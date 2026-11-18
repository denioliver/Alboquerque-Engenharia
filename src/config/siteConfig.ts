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

export function whatsappLink(message = 'Olá! Conheci a Albuquerque Engenharia pelo site e gostaria de solicitar um orçamento.', whatsappNumber = siteConfig.whatsappNumber) {
  return whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
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
