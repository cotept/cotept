export interface Mentor {
  id: string
  name: string
  company: string
  experience: string
  title: string
  tags: string[]
  rating: number
  reviewCount: number
  pricePerHour: number
  imageUrl: string
  tierIndex: number // 0-7 corresponding to the strip segments
}
