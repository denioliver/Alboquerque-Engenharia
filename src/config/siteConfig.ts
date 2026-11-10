import logo from '../assets/logo/logo-alboquerque-engenharia.png'
import heroImage from '../assets/servicosRealizados/SITE/CONDOMÍNIO ENCONTRO DAS ÁGUAS/PORTARIA 01 - FINALIZAÇÃO.jpeg'

export const siteConfig = {
  logo,
  heroImage,
  phone: '(00) 00000-0000',
  email: 'contato@albuquerqueengenharia.com.br',
  instagram: 'https://www.instagram.com/',
  whatsappNumber: '',
}

export function whatsappLink(message = 'Olá! Conheci a Albuquerque Engenharia pelo site e gostaria de solicitar um orçamento.') {
  return siteConfig.whatsappNumber
    ? `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`
}
