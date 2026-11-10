export interface Project {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
  category: string
  location?: string
  completionDate?: string
  coverImage: string
  images: string[]
  servicesPerformed: string[]
  featured: boolean
  published: boolean
}
