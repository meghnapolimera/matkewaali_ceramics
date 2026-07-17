import bgImage from '../../assets/candle_cup_background.jpeg'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div
      className={styles.home}
      style={{ backgroundImage: `url(${bgImage})` }}
    />
  )
}
