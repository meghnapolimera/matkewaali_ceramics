import { useState, ReactNode } from 'react'
import blockPrinted from '../../assets/block_printed_planters.jpeg'
import cowMadhubani from '../../assets/cow_madhubani_planter.jpeg'
import styles from './FAQ.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

const EMAIL = 'meghnapolimera@matkewaali.com'
const emailLink = <a className={styles.emailLink} href={`mailto:${EMAIL}`}>{EMAIL}</a>

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'When do you update your shop?',
    a: "New work is added a few times a year. There's no fixed schedule — it depends on what I'm working on. Follow me on Instagram or subscribe to the newsletter to be the first to know when new pieces go live.",
  },
  {
    q: 'Do you take custom orders?',
    a: <>Yes! Feel free to get in touch at {emailLink} with details about what you have in mind.</>,
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently I ship within the United States only. I hope to expand this in the future.',
  },
  {
    q: 'Do you have any care recommendations?',
    a: 'All pieces are food and dishwasher safe, but hand washing is strongly recommended. Handmade ceramics are more susceptible to chipping than mass-produced pieces, so a little extra care goes a long way.',
  },
  {
    q: 'Do you work with restaurants or coffee shops?',
    a: <>If you are interested in working together to develop pieces for your restaurant, please get in touch at {emailLink} explaining what type of tableware you are looking for and details about your restaurant. Please understand that I don't make anything that may fall outside of my usual aesthetic and work solely with my current glaze palette.</>,
  },
  {
    q: 'Do you work with retailers or galleries?',
    a: <>I'm open to stockist inquiries on a case-by-case basis. Please reach out at {emailLink} with details about your space and I'll get back to you.</>,
  },
]

export default function FAQ() {
  usePageMeta(
    'FAQ — Matkewaali Ceramics',
    'Frequently asked questions about Matkewaali Ceramics — shipping, materials, care instructions, and more.',
  )
  const [open, setOpen] = useState<string | null>(null)

  function toggle(q: string) {
    setOpen(prev => prev === q ? null : q)
  }

  return (
    <div className={styles.faqPage}>
      <div className={styles.faqContainer}>
        {faqs.map(item => (
          <div
            key={item.q}
            className={styles.faqItem}
            onClick={() => toggle(item.q)}
          >
            <div className={styles.faqQuestion}>
              <span>{item.q}</span>
              <span className={styles.faqIcon}>{open === item.q ? '−' : '+'}</span>
            </div>
            {open === item.q && (
              <div className={styles.faqAnswer}>
                <p>{item.a}</p>
              </div>
            )}
          </div>
        ))}

        <div className={styles.faqImages}>
          <img src={blockPrinted} alt="Block printed planters" className={styles.faqImage} />
          <img src={cowMadhubani} alt="Cow madhubani planter" className={styles.faqImage} />
        </div>
      </div>
    </div>
  )
}
