import { Link } from 'react-router-dom'
import kolam1 from '../../assets/kolam_planter_1.png'
import kolam2 from '../../assets/kolam_planter_2.png'
import kolam3 from '../../assets/kolam_planter_3.png'
import kolam4 from '../../assets/kolam_planter_4.png'
import styles from './Contact.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Contact() {
  usePageMeta(
    'Contact — Matkewaali Ceramics',
    'Get in touch with Matkewaali Ceramics. Questions about orders, pieces, or collaborations — reach out by email.',
  )
  return (
    <div className={styles.contactPage}>
      <div className={styles.contactContainer}>
        <div className={styles.contactIntro}>
          <p>Before reaching out, you might find your answer in the <Link className={styles.faqLink} to="/faq">FAQ</Link>.</p>
          <p>If you've got any questions about my work, custom orders, or anything else, write to me at <a className={styles.emailLink} href="mailto:meghnapolimera@matkewaali.com">meghnapolimera@matkewaali.com</a>. I'll try to get back to you as soon as possible.</p>
          <p>You can also find my latest work on Instagram at <a className={styles.igLink} href="https://www.instagram.com/matkewaali/" target="_blank" rel="noopener noreferrer">@matkewaali</a></p>
        </div>
      </div>

      <div className={styles.contactImages}>
        <img src={kolam1} alt="Kolam planter" className={styles.contactImage} />
        <img src={kolam2} alt="Kolam planter" className={styles.contactImage} />
        <img src={kolam3} alt="Kolam planter" className={styles.contactImage} />
        <img src={kolam4} alt="Kolam planter" className={styles.contactImage} />
      </div>
    </div>
  )
}
