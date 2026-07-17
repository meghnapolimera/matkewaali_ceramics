export interface StoryBlock {
  type: 'text' | 'image' | 'split'
  value?: string
  src?: string
  alt?: string
  imageLeft?: boolean
  objectPosition?: string
}

export interface Story {
  slug: string
  title: string
  date: string
  excerpt: string
  coverImage?: string
  content: StoryBlock[]
}

import tenMugs from '../content/stories/ten-mugs'

const stories: Story[] = [
  tenMugs,
]

export default stories
