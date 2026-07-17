import funPlanter1 from '../../assets/fun_planter_1.jpeg'
import funPlanter2 from '../../assets/fun_planter_2.jpeg'
import funPlanter3 from '../../assets/fun_planter_3.jpeg'
import funPlanter4 from '../../assets/fun_planter_4.jpeg'
import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutContainer}>
        <p className={styles.aboutP}>I am Meghna Polimera, and my journey with clay began in 2019 through self-directed exploration. As a self-taught ceramic artist, I create functional wheel-thrown pieces that emphasize rustic aesthetics through varied textures and muted tones.</p>

        <div className={styles.aboutSplit}>
          <p className={styles.aboutP}>My work explores the natural qualities of clay and surface, combining techniques like hand-texturing, carving, and slip trailing to create pieces with tactile depth and organic character. I favor earthy palettes and raw finishes that bring a sense of warmth and authenticity to everyday objects.</p>
          <div className={styles.aboutGrid}>
            <img src={funPlanter1} alt="" className={styles.aboutGridImg} />
            <img src={funPlanter2} alt="" className={styles.aboutGridImg} />
            <img src={funPlanter3} alt="" className={styles.aboutGridImg} />
            <img src={funPlanter4} alt="" className={styles.aboutGridImg} />
          </div>
        </div>

        <p className={styles.aboutP}>The name Matkewaali is Hindi for "woman who sells ceramics." The icon — the Devanagari letter म, the Hindi equivalent of M — is my maker's mark, stamped into the bottom of every piece I make.</p>

        <p className={styles.aboutP}>I also draw inspiration from Indian folk and tribal art traditions—including Warli, Gond, Sohrai, Kolam, Bandhani, and Kalamkari. These traditions, which have carried stories of communities for generations through bold geometries and nature-inspired motifs, translate beautifully onto ceramic surfaces. Through slip trailing and pattern work, I honor these visual languages while creating pieces that bridge ancestral patterns with contemporary functional design.</p>

        <p className={styles.aboutP}>Being self-taught has shaped my approach through intuitive exploration and deliberate practice, leading to a style that feels both personal and connected to larger artistic traditions.</p>

        <p className={styles.aboutP}>You can also find my latest work on instagram <a href="https://instagram.com/matkewaali" target="_blank" rel="noopener noreferrer" className={styles.instagramLink}>@matkewaali</a></p>
      </div>
    </div>
  )
}
