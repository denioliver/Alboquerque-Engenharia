import logo from '../assets/logo/logo-albuquerque-engenharia.png'
import heroImage from '../assets/servicosRealizados/SITE/CONDOMÍNIO ENCONTRO DAS ÁGUAS/PORTARIA 01 - FINALIZAÇÃO.jpeg'

export const siteConfig = {
  logo,
  heroImage,
  phone: '(71) 9 9661-8635',
  email: 'contato@engenhariaalbuquerque.com.br',
  instagram: 'https://www.instagram.com/',
  whatsappNumber: '5571996618635',
}

export function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('55')) return digits
  return `55${digits.replace(/^0/, '')}`
}

export function normalizeInstagram(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const handle = trimmed
    .replace(/^@/, '')
    .replace(/^instagram\.com\//i, '')
    .replace(/^www\.instagram\.com\//i, '')
    .replace(/^\/+|\/+$/g, '')

  return handle ? `https://www.instagram.com/${handle}/` : ''
}

export function whatsappLink(message = 'Olá! Conheci a Albuquerque Engenharia pelo site e gostaria de solicitar um orçamento.', whatsappNumber = siteConfig.whatsappNumber) {
  const normalizedNumber = normalizeWhatsAppNumber(whatsappNumber)
  return normalizedNumber
    ? `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function gmailLink(email = siteConfig.email) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email,
    su: 'Solicitação de orçamento',
    body: 'Olá! Gostaria de solicitar um orçamento.',
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}
