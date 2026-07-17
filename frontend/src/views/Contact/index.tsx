import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../services/api'
import kolam1 from '../../assets/kolam_planter_1.png'
import kolam2 from '../../assets/kolam_planter_2.png'
import kolam3 from '../../assets/kolam_planter_3.png'
import kolam4 from '../../assets/kolam_planter_4.png'
import styles from './Contact.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form')
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({ name: '', email: '', message: '' })
  const [touched, setTouched] = useState({ name: false, email: false, message: false })

  function validate(f = form): boolean {
    const e = {
      name: !f.name.trim() ? 'Name is required' : '',
      email: !f.email.trim()
        ? 'Email is required'
        : !EMAIL_RE.test(f.email)
          ? 'Please enter a valid email address'
          : '',
      message: !f.message.trim()
        ? 'Message is required'
        : f.message.trim().length > 2000
          ? 'Message must be under 2000 characters'
          : '',
    }
    setErrors(e)
    return !e.name && !e.email && !e.message
  }

  function touch(field: keyof typeof touched) {
    setTouched(t => ({ ...t, [field]: true }))
    validate()
  }

  function handleChange(field: keyof typeof form, value: string) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (touched[field]) validate(next)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!validate()) return

    setStep('submitting')
    setSubmitError('')

    try {
      await api.sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      })
      setStep('success')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setStep('form')
    }
  }

  return (
    <div className={styles.contactPage}>
      <div className={styles.contactContainer}>
        {step === 'success' ? (
          <div className={styles.statusMessage}>
            <p>Message sent. I'll get back to you soon.</p>
            <Link to="/products" className={styles.actionBtn}>Back to Shop</Link>
          </div>
        ) : (
          <div className={styles.contactLayout}>
            <div className={styles.contactIntro}>
              <p>If you've got any questions about my work, custom orders, or anything else, please don't hesitate to get in touch. I'll try to get back to you as soon as possible.</p>
              <p>You can also find my latest work on Instagram at <a className={styles.igLink} href="https://www.instagram.com/matkewaali/" target="_blank" rel="noopener noreferrer">@matkewaali</a></p>
            </div>

            <form className={styles.contactForm} onSubmit={submit} noValidate>
              <label className={styles.field}>
                <span>Name <span className={styles.required}>*</span></span>
                <input
                  type="text"
                  maxLength={200}
                  required
                  className={errors.name && touched.name ? styles.invalid : ''}
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={() => touch('name')}
                />
              </label>

              <label className={styles.field}>
                <span>Email <span className={styles.required}>*</span></span>
                <input
                  type="email"
                  maxLength={320}
                  required
                  className={errors.email && touched.email ? styles.invalid : ''}
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => touch('email')}
                />
                {errors.email && touched.email && form.email.trim() && (
                  <span className={styles.fieldError}>{errors.email}</span>
                )}
              </label>

              <label className={styles.field}>
                <span>Message <span className={styles.required}>*</span></span>
                <textarea
                  rows={6}
                  maxLength={2000}
                  required
                  className={errors.message && touched.message ? styles.invalid : ''}
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  onBlur={() => touch('message')}
                />
                <span className={styles.charCount}>{form.message.length} / 2000</span>
                {errors.message && touched.message && form.message.trim() && (
                  <span className={styles.fieldError}>{errors.message}</span>
                )}
              </label>

              {submitError && <p className={styles.fieldError}>{submitError}</p>}

              <button type="submit" className={styles.submitBtn} disabled={step === 'submitting'}>
                {step === 'submitting' ? <span className={styles.spinner} /> : 'Send Message'}
              </button>
            </form>
          </div>
        )}
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
