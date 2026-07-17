import { useParams, Link } from 'react-router-dom'
import stories from '../../data/stories'
import styles from './Story.module.css'

export default function Story() {
  const { slug } = useParams<{ slug: string }>()
  const story = stories.find(s => s.slug === slug)

  if (!story) {
    return (
      <div className={styles.storyPage}>
        <div className={styles.storyContainer}>
          <p className={styles.notFound}>Story not found.</p>
          <Link to="/stories" className={styles.backLink}>← Back to Stories</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.storyPage}>
      <div className={styles.storyContainer}>
        <Link to="/stories" className={styles.backLink}>← Back to Stories</Link>

        <div className={styles.storyHeader}>
          <p className={styles.date}>{story.date}</p>
          <h1 className={styles.title}>{story.title}</h1>
        </div>

        {story.coverImage && (
          <img src={story.coverImage} alt={story.title} className={styles.coverImage} />
        )}

        <div className={styles.storyBody}>
          {story.content.map((block, i) => {
            if (block.type === 'text') {
              return <p key={i} className={styles.paragraph}>{block.value}</p>
            }
            if (block.type === 'image') {
              return <img key={i} src={block.src} alt={block.alt ?? ''} className={styles.bodyImage} />
            }
            if (block.type === 'split') {
              return (
                <div key={i} className={styles.split}>
                  {block.imageLeft && <img src={block.src} alt={block.alt ?? ''} className={styles.splitImage} style={block.objectPosition ? { objectPosition: block.objectPosition } : undefined} />}
                  <p className={styles.paragraph}>{block.value}</p>
                  {!block.imageLeft && <img src={block.src} alt={block.alt ?? ''} className={styles.splitImage} style={block.objectPosition ? { objectPosition: block.objectPosition } : undefined} />}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
