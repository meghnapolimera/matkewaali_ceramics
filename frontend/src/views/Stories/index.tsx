import { Link } from 'react-router-dom'
import stories from '../../data/stories'
import styles from './Stories.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Stories() {
  usePageMeta(
    'Stories — Matkewaali Ceramics',
    'Stories and process behind Matkewaali Ceramics — the making, the materials, and the ideas.',
  )
  return (
    <div className={styles.storiesPage}>
      <div className={styles.storiesContainer}>
        {stories.map(story => (
          <Link key={story.slug} to={`/stories/${story.slug}`} className={styles.storyCard}>
            {story.coverImage && (
              <img src={story.coverImage} alt={story.title} className={styles.coverImage} />
            )}
            <div className={styles.cardBody}>
              <p className={styles.date}>{story.date}</p>
              <h2 className={styles.title}>{story.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
