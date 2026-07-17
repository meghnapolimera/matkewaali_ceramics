import type { Story } from '../../../data/stories'
import raw from './story.txt?raw'
import mugs from './mugs.jpeg'
import wheel from './wheel.jpeg'
import mug from './mug.jpeg'

const paragraphs = raw.trim().split(/\n\n+/)

const story: Story = {
  slug: 'ten-mugs',
  title: 'Ten Mugs',
  date: 'July 2026',
  excerpt: 'After months away from the wheel, one gloomy Sunday in April brought me back to the first forms I ever made.',
  coverImage: mugs,
  content: [
    { type: 'text',  value: paragraphs[0] },
    { type: 'text',  value: paragraphs[1] },
    { type: 'split', value: paragraphs[2], src: wheel, alt: 'Pottery wheel' },
    { type: 'text',  value: paragraphs[3] },
    { type: 'text',  value: paragraphs[4] },
    { type: 'split', value: paragraphs[5], src: mug,   alt: 'One of the ten mugs', imageLeft: true },
    { type: 'text',  value: paragraphs[6] },
  ],
}

export default story
