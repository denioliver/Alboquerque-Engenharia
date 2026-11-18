import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../config/firebase'
import type { ProjectImage } from '../types/admin'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const MAX_IMAGES = 10
const MAX_COMPRESSED_SIZE = 1_200_000
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function readAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

async function compress(file: File, maxDimension: number, quality: number) {
  const source = await readAsDataUrl(file)
  const image = new Image()
  image.src = source
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('O arquivo não é uma imagem válida.'))
  })
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
  let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) throw new Error('Não foi possível otimizar a imagem.')

  if (blob.size > MAX_COMPRESSED_SIZE) {
    const smallerWidth = Math.max(1, Math.round(canvas.width * 0.8))
    const smallerHeight = Math.max(1, Math.round(canvas.height * 0.8))
    canvas.width = smallerWidth
    canvas.height = smallerHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0, smallerWidth, smallerHeight)
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.68))
  }
  if (!blob) throw new Error('Não foi possível otimizar a imagem.')
  return blob
}

export function validateImageFiles(files: File[], existingCount: number) {
  if (files.length > MAX_IMAGES) {
    throw new Error(`Selecione no máximo ${MAX_IMAGES} imagens por vez.`)
  }
  if (existingCount + files.length > MAX_IMAGES) {
    throw new Error(`Cada obra pode ter no máximo ${MAX_IMAGES} imagens.`)
  }
  for (const file of files) {
    if (!ACCEPTED_TYPES.has(file.type)) throw new Error('Use apenas imagens JPEG, PNG ou WebP.')
    if (file.size > MAX_FILE_SIZE) throw new Error('Cada imagem deve ter no máximo 8 MB antes da otimização.')
  }
}

export async function uploadProjectImage(
  file: File,
  projectId: string,
  index: number,
  published: boolean,
  onProgress: (progress: number) => void,
): Promise<ProjectImage> {
  const blob = await compress(file, 1280, 0.72)
  const id = crypto.randomUUID()
  const path = `projects/${projectId}/gallery/${id}.webp`
  const task = uploadBytesResumable(ref(storage, path), blob, { contentType: 'image/webp', customMetadata: { published: String(published) } })
  await new Promise<void>((resolve, reject) => {
    task.on('state_changed', (snapshot) => onProgress(snapshot.bytesTransferred / snapshot.totalBytes * 100), reject, resolve)
  })
  const thumbnailBlob = await compress(file, 480, 0.68)
  const thumbnailPath = `projects/${projectId}/thumbnails/${id}.webp`
  const thumbnailTask = uploadBytesResumable(ref(storage, thumbnailPath), thumbnailBlob, { contentType: 'image/webp', customMetadata: { published: String(published) } })
  await new Promise<void>((resolve, reject) => thumbnailTask.on('state_changed', undefined, reject, resolve))
  return { id, source: 'firebase', storagePath: path, thumbnailPath, url: await getDownloadURL(ref(storage, path)), alt: file.name, order: index }
}
