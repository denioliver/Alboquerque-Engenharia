import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import type { SiteSettings } from '../types/siteSettings'

const settingsRef = doc(db, 'siteSettings', 'general')

export async function getSiteSettings() {
  const snapshot = await getDoc(settingsRef)
  return snapshot.exists() ? snapshot.data() as Partial<SiteSettings> : null
}

export async function saveSiteSettings(settings: SiteSettings) {
  await setDoc(settingsRef, settings, { merge: true })
}

export async function uploadSiteImage(file: File, name: 'logo' | 'hero') {
  const path = `site-config/${name}-${crypto.randomUUID()}`
  const imageRef = ref(storage, path)
  await uploadBytes(imageRef, file, { contentType: file.type, customMetadata: { published: 'true' } })
  return getDownloadURL(imageRef)
}
