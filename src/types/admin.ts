import type { Timestamp } from 'firebase/firestore'

export type AdminRole = 'owner' | 'editor'

export interface ProjectImage {
  id: string
  source: 'local' | 'firebase'
  localAssetKey?: string
  storagePath?: string
  thumbnailPath?: string
  url?: string
  alt: string
  order: number
}

export interface AdminProject {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
  category: string
  location?: string
  completionDate?: string
  servicesPerformed: string[]
  images: ProjectImage[]
  coverImageId: string
  featured: boolean
  published: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface AdminProfile {
  uid: string
  email: string
  displayName?: string
  role: AdminRole
  active: boolean
}
