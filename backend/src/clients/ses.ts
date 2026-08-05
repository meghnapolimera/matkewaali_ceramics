import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({})
const FROM_EMAIL = 'meghnapolimera@matkewaali.com'
const OWNER_EMAIL = 'meghnapolimera@matkewaali.com'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface OrderConfirmationParams {
  to: string
  customerName: string
  orderId: string
  items: Array<{ name: string; price: number }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  pickup?: boolean
  shippingAddress?: { line1: string; line2?: string; city: string; state: string; zip: string }
}

interface ContactEmailParams {
  name: string
  email: string
  message: string
}

function emailWrapper(content: string): string {
  const logoUrl = `${process.env.ASSETS_BASE_URL}/matkewaali_ceramics_black_logo.png`
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;text-align:center">
      <img src="${logoUrl}" alt="Matkewaali Ceramics" style="width:180px;margin:32px auto 24px;display:block" />
      ${content}
    </div>
  `
}

function orderTable(items: Array<{ name: string; price: number }>, subtotal: number, tax: number, shipping: number, total: number): string {
  const itemRows = items
    .map(i => `<tr><td style="padding:6px 0;text-align:center">${escapeHtml(i.name)}</td><td style="text-align:center">$${i.price.toFixed(2)}</td></tr>`)
    .join('')
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      ${itemRows}
      <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #eee"></td></tr>
      <tr><td style="text-align:center;color:#999">Subtotal</td><td style="text-align:center;color:#999">$${subtotal.toFixed(2)}</td></tr>
      <tr><td style="text-align:center;color:#999">Tax</td><td style="text-align:center;color:#999">$${tax.toFixed(2)}</td></tr>
      <tr><td style="text-align:center;color:#999">Shipping</td><td style="text-align:center;color:#999">$${shipping.toFixed(2)}</td></tr>
      <tr><td style="text-align:center;font-weight:bold">Total</td><td style="text-align:center;font-weight:bold">$${total.toFixed(2)}</td></tr>
    </table>
  `
}

export async function sendOrderConfirmation(params: OrderConfirmationParams): Promise<void> {
  const name = escapeHtml(params.customerName)

  const fulfillmentBlock = params.pickup
    ? '<p>Local pickup — Ballard, Seattle</p>'
    : (() => {
        const addr = params.shippingAddress!
        const addressLine2 = addr.line2 ? `<br>${escapeHtml(addr.line2)}` : ''
        return `<p>${escapeHtml(addr.line1)}${addressLine2}<br>${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.zip)}</p>`
      })()

  const customerNextSteps = params.pickup
    ? "We'll be in touch to arrange your pickup in Ballard, Seattle."
    : "We'll be in touch with shipping details soon."

  const customerHtml = emailWrapper(`
    <h2 style="font-weight:300;letter-spacing:1px">Order Confirmed</h2>
    <p>Hi ${name}, thank you for your order!<br>${customerNextSteps}</p>

    <h3 style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:8px">Order Summary</h3>
    ${orderTable(params.items, params.subtotal, params.tax, params.shipping, params.total)}

    <h3 style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:8px">${params.pickup ? 'Pickup' : 'Shipping To'}</h3>
    ${fulfillmentBlock}

    <p style="color:#999;font-size:0.85rem;margin-top:32px">Order ID: ${escapeHtml(params.orderId)}</p>
  `)

  const ownerHtml = emailWrapper(`
    <h2 style="font-weight:300;letter-spacing:1px">New Order Received</h2>
    <p><strong>${name}</strong> (${escapeHtml(params.to)}) placed an order.</p>

    <h3 style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:8px">Order Summary</h3>
    ${orderTable(params.items, params.subtotal, params.tax, params.shipping, params.total)}

    <h3 style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:8px">${params.pickup ? 'Pickup' : 'Ship To'}</h3>
    ${fulfillmentBlock}

    <p style="color:#999;font-size:0.85rem;margin-top:32px">Order ID: ${escapeHtml(params.orderId)}</p>
  `)

  await Promise.all([
    ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [params.to] },
      Message: {
        Subject: { Data: 'Your Matkewaali order is confirmed', Charset: 'UTF-8' },
        Body: { Html: { Data: customerHtml, Charset: 'UTF-8' } },
      },
    })),
    ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [OWNER_EMAIL] },
      Message: {
        Subject: { Data: `New order from ${params.customerName} — $${params.total.toFixed(2)}`, Charset: 'UTF-8' },
        Body: { Html: { Data: ownerHtml, Charset: 'UTF-8' } },
      },
    })),
  ])
}

export async function sendSubscriptionConfirmation(to: string): Promise<void> {
  const html = emailWrapper(`
    <h2 style="font-weight:300;letter-spacing:1px">Thanks for subscribing to Matkewaali Ceramics</h2>
    <p>You're now on the list. You'll hear from me when new pieces are available, when the shop updates, and occasionally about the work and process behind Matkewaali Ceramics.</p>
    <p style="color:#999;font-size:0.85rem;margin-top:32px">If you'd like to unsubscribe, <a href="https://matkewaali.com/unsubscribe?email=${encodeURIComponent(to)}" style="color:#999">click here</a>.</p>
  `)

  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: 'Welcome to Matkewaali Ceramics', Charset: 'UTF-8' },
      Body: { Html: { Data: html, Charset: 'UTF-8' } },
    },
  }))
}

export async function sendContactEmail(params: ContactEmailParams): Promise<void> {
  const name = escapeHtml(params.name)
  const email = escapeHtml(params.email)
  const message = escapeHtml(params.message).replace(/\n/g, '<br>')

  const html = emailWrapper(`
    <h2 style="font-weight:300;letter-spacing:1px">New Message</h2>
    <p><strong>${name}</strong> (${email}) sent you a message.</p>
    <h3 style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:8px">Message</h3>
    <p style="text-align:left;white-space:pre-wrap">${message}</p>
  `)

  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [OWNER_EMAIL] },
    ReplyToAddresses: [params.email],
    Message: {
      Subject: { Data: `Message from ${params.name}`, Charset: 'UTF-8' },
      Body: { Html: { Data: html, Charset: 'UTF-8' } },
    },
  }))
}
