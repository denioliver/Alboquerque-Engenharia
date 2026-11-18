import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { deleteObject, ref, updateMetadata } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import type { AdminProject, ProjectImage } from '../types/admin'
import { getProjects } from './projectRepository'

const projectsCollection = collection(db, 'projects')

export async function listAdminProjects() {
  const snapshot = await getDocs(query(projectsCollection, orderBy('updatedAt', 'desc')))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as AdminProject))
}

export async function saveProject(project: Omit<AdminProject, 'id'>, id?: string) {
  await Promise.all(project.images
    .filter((image) => image.source === 'firebase' && image.storagePath)
    .map((image) => updateMetadata(ref(storage, image.storagePath!), { customMetadata: { published: String(project.published) } })))
  if (id) {
    await updateDoc(doc(db, 'projects', id), { ...project, updatedAt: serverTimestamp() })
    return id
  }
  const created = await addDoc(projectsCollection, { ...project, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return created.id
}

async function deleteImage(image: ProjectImage) {
  if (image.source !== 'firebase') return
  await Promise.all([
    image.storagePath ? deleteObject(ref(storage, image.storagePath)) : Promise.resolve(),
    image.thumbnailPath ? deleteObject(ref(storage, image.thumbnailPath)) : Promise.resolve(),
  ])
}

export async function removeProject(project: AdminProject) {
  await Promise.all(project.images.map(deleteImage))
  await deleteDoc(doc(db, 'projects', project.id))
}

export async function migrateLocalProjects() {
  const localProjects = getProjects()
  await Promise.all(localProjects.map(async (project) => {
    const images: ProjectImage[] = project.images.map((url, order) => ({
      id: `${project.id}-${order + 1}`,
      source: 'local',
      localAssetKey: url,
      url,
      alt: project.title,
      order,
    }))
    await setDoc(doc(db, 'projects', project.id), {
      ...project,
      images,
      coverImageId: images[0]?.id ?? '',
      migratedFromLocal: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true })
  }))
}
