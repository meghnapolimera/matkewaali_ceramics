import bgImage from '../../assets/candle_cup_background.jpeg'
import styles from './Home.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Home() {
  usePageMeta(
    'Matkewaali — Handmade Ceramics | Seattle',
    'Handmade ceramics by Meghna Polimera. Based in Seattle, WA.',
  )
  return (
    <div
      className={styles.home}
      style={{ backgroundImage: `url(${bgImage})` }}
    />
  )
}
