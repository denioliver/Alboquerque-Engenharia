/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSiteSettings } from '../repositories/siteSettingsRepository'
import { siteConfig } from './siteConfig'
import type { SiteSettings } from '../types/siteSettings'

export const defaultSiteSettings: SiteSettings = {
  brandName: 'Albuquerque Engenharia',
  logoUrl: siteConfig.logo,
  heroImageUrl: siteConfig.heroImage,
  phone: siteConfig.phone,
  email: siteConfig.email,
  instagram: siteConfig.instagram,
  whatsappNumber: siteConfig.whatsappNumber,
  heroEyebrow: 'Engenharia, construção e reformas',
  heroTitle: 'Engenharia que transforma projetos em realidade.',
  heroDescription: 'Soluções em engenharia, construção e reformas, com planejamento, qualidade e compromisso em cada etapa.',
  aboutTitle: 'Projetamos o futuro com base sólida.',
  aboutLead: 'A Albuquerque Engenharia atua na construção, reforma e manutenção de espaços que fazem parte da vida das pessoas.',
  aboutDescription: 'Com uma abordagem próxima e responsável, unimos visão técnica, planejamento e execução cuidadosa para transformar cada desafio em uma solução duradoura.',
  servicesTitle: 'Soluções para cada etapa.',
  servicesDescription: 'Da primeira ideia ao último acabamento, nossa experiência trabalha a favor do seu projeto.',
  contactTitle: 'Seu próximo projeto começa aqui.',
  contactDescription: 'Conte para a gente o que você está planejando. Nossa equipe está pronta para ouvir e construir junto.',
  footerTagline: 'Construindo soluções que permanecem.',
}

const SiteSettingsContext = createContext<SiteSettings>(defaultSiteSettings)

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSiteSettings)
  useEffect(() => {
    void getSiteSettings()
      .then((remote) => {
        if (remote) setSettings((current) => ({
          ...current,
          ...remote,
          logoUrl: typeof remote.logoUrl === 'string' && remote.logoUrl.length > 0 && !remote.logoUrl.startsWith('/assets/')
            ? remote.logoUrl
            : current.logoUrl,
          heroImageUrl: typeof remote.heroImageUrl === 'string' && remote.heroImageUrl.length > 0 && !remote.heroImageUrl.startsWith('/assets/')
            ? remote.heroImageUrl
            : current.heroImageUrl,
          phone: remote.phone || current.phone,
          whatsappNumber: remote.whatsappNumber || current.whatsappNumber,
          instagram: remote.instagram || current.instagram,
        }))
      })
      .catch(() => undefined)
  }, [])
  const value = useMemo(() => settings, [settings])
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
