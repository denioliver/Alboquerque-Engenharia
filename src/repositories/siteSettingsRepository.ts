import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { normalizeInstagram, normalizeWhatsAppNumber } from '../config/siteConfig'
import type { SiteSettings } from '../types/siteSettings'

const settingsRef = doc(db, 'siteSettings', 'general')

function isLocalAssetUrl(value: unknown): boolean {
  return typeof value === 'string'
    && (value.startsWith('/assets/') || value.startsWith('assets/') || value.startsWith('/src/'))
}

export async function getSiteSettings() {
  const snapshot = await getDoc(settingsRef)
  if (!snapshot.exists()) return null

  const settings = snapshot.data() as Partial<SiteSettings>
  return {
    ...settings,
    logoUrl: isLocalAssetUrl(settings.logoUrl) ? undefined : settings.logoUrl,
    heroImageUrl: isLocalAssetUrl(settings.heroImageUrl) ? undefined : settings.heroImageUrl,
  }
}

export async function saveSiteSettings(settings: SiteSettings) {
  await setDoc(settingsRef, {
    ...settings,
    logoUrl: isLocalAssetUrl(settings.logoUrl) ? deleteField() : String(settings.logoUrl).trim(),
    heroImageUrl: isLocalAssetUrl(settings.heroImageUrl) ? deleteField() : String(settings.heroImageUrl).trim(),
    whatsappNumber: normalizeWhatsAppNumber(settings.whatsappNumber),
    instagram: normalizeInstagram(settings.instagram),
  }, { merge: true })
}

export async function uploadSiteImage(file: File, name: 'logo' | 'hero') {
  const path = `site-config/${name}-${crypto.randomUUID()}`
  const imageRef = ref(storage, path)
  await uploadBytes(imageRef, file, { contentType: file.type, customMetadata: { published: 'true' } })
  return getDownloadURL(imageRef)
}
