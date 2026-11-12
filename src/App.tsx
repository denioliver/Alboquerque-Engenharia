import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Camera,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Ruler,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { gmailLink, siteConfig, whatsappLink } from './config/siteConfig'
import { getProjects } from './repositories/projectRepository'
import type { Project } from './types/project'
import './App.css'

const projects = getProjects()

const services = [
  { title: 'Construção civil', description: 'Execução organizada, do planejamento à entrega, com foco em qualidade e segurança.', icon: Building2 },
  { title: 'Reformas residenciais', description: 'Ambientes renovados com cuidado técnico, acabamento e respeito à rotina de cada cliente.', icon: Sparkles },
  { title: 'Reformas comerciais', description: 'Obras pensadas para reduzir impactos e devolver seu espaço pronto para operar.', icon: Ruler },
  { title: 'Projetos de engenharia', description: 'Soluções técnicas que conectam viabilidade, funcionalidade e visão de longo prazo.', icon: ExternalLink },
  { title: 'Gerenciamento de obras', description: 'Acompanhamento próximo, organização de etapas e comunicação transparente.', icon: Check },
  { title: 'Manutenção e adequações', description: 'Intervenções precisas para preservar, adaptar e valorizar seu patrimônio.', icon: ShieldCheck },
]

const navItems = [
  ['Sobre nós', 'sobre'],
  ['Serviços', 'servicos'],
  ['Obras', 'obras'],
  ['Contato', 'contato'],
]

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (id: string) => {
    setOpen(false)
    if (location.pathname !== '/') {
      navigate(`/#${id}`)
      return
    }
    scrollToId(id)
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="Albuquerque Engenharia - início">
          <img src={siteConfig.logo} alt="Albuquerque Engenharia" />
        </Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Abrir menu">
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Navegação principal">
          {navItems.map(([label, id]) => (
            <button key={id} onClick={() => goTo(id)}>{label}</button>
          ))}
          <a className="nav-cta" href={whatsappLink()} target="_blank" rel="noreferrer">
            Solicitar orçamento <ArrowUpRight size={16} />
          </a>
        </nav>
      </div>
    </header>
  )
}

function ButtonLink({ children, href, secondary = false }: { children: React.ReactNode; href: string; secondary?: boolean }) {
  return <a className={`button ${secondary ? 'button-secondary' : ''}`} href={href} target="_blank" rel="noreferrer">{children} <ArrowUpRight size={17} /></a>
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <img className="hero-image" src={siteConfig.heroImage} alt="Equipe e estrutura de uma obra de engenharia" fetchPriority="high" />
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="eyebrow light"><span /> Engenharia, construção e reformas</p>
        <h1 id="hero-title">Engenharia que transforma projetos <em>em realidade.</em></h1>
        <p className="hero-description">Soluções em engenharia, construção e reformas, com planejamento, qualidade e compromisso em cada etapa.</p>
        <div className="hero-actions">
          <ButtonLink href={whatsappLink()}>Solicitar orçamento</ButtonLink>
          <a className="text-link light-link" href="#obras">Conhecer nossas obras <ArrowUpRight size={17} /></a>
        </div>
        <div className="hero-foot">
          <span>01 — 03</span>
          <div className="hero-progress"><i /></div>
          <span>Construindo com propósito</span>
        </div>
      </div>
      <a className="scroll-cue" href="#sobre" aria-label="Rolar para conhecer a empresa"><ChevronDown size={20} /></a>
    </section>
  )
}

function About() {
  const aboutImages = projects.slice(0, 4).map((project) => ({
    src: project.coverImage,
    alt: project.title,
  }))
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || aboutImages.length < 2) return

    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % aboutImages.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [aboutImages.length])

  return (
    <section className="section about-section" id="sobre">
      <div className="container about-grid">
        <div className="about-copy">
          <p className="eyebrow"><span /> Sobre a empresa</p>
          <h2>Projetamos o futuro com <em>base sólida.</em></h2>
          <p className="lead">A Albuquerque Engenharia atua na construção, reforma e manutenção de espaços que fazem parte da vida das pessoas.</p>
          <p>Com uma abordagem próxima e responsável, unimos visão técnica, planejamento e execução cuidadosa para transformar cada desafio em uma solução duradoura.</p>
          <div className="about-actions">
            <a className="text-link" href="#contato">Fale com nossa equipe <ArrowUpRight size={17} /></a>
            <img className="about-logo" src={siteConfig.logo} alt="Albuquerque Engenharia" />
          </div>
        </div>
        <div className="about-visual">
          <img src={aboutImages[activeImage].src} alt={aboutImages[activeImage].alt} loading="lazy" />
          <div className="image-caption"><span>01</span><strong>Experiência que se constrói<br />em cada detalhe.</strong></div>
          <div className="about-carousel-controls" aria-label="Controles da galeria sobre nós">
            <button type="button" onClick={() => setActiveImage((activeImage - 1 + aboutImages.length) % aboutImages.length)} aria-label="Imagem anterior">
              <ChevronLeft size={17} />
            </button>
            <div className="about-carousel-dots">
              {aboutImages.map((image, index) => (
                <button
                  type="button"
                  className={index === activeImage ? 'active' : ''}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Exibir imagem ${index + 1}: ${image.alt}`}
                  key={image.src}
                />
              ))}
            </div>
            <button type="button" onClick={() => setActiveImage((activeImage + 1) % aboutImages.length)} aria-label="Próxima imagem">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
      <div className="container values-row">
        <div><strong>01</strong><h3>Planejamento</h3><p>Cada etapa pensada antes de começar.</p></div>
        <div><strong>02</strong><h3>Qualidade</h3><p>Critério técnico em todas as entregas.</p></div>
        <div><strong>03</strong><h3>Compromisso</h3><p>Presença e clareza durante todo o processo.</p></div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="section services-section" id="servicos">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow"><span /> O que fazemos</p><h2>Soluções para cada <em>etapa.</em></h2></div>
          <p>Da primeira ideia ao último acabamento, nossa experiência trabalha a favor do seu projeto.</p>
        </div>
        <div className="services-grid">
          {services.map(({ title, description, icon: Icon }, index) => (
            <article className="service-card" key={title}>
              <span className="service-number">0{index + 1}</span>
              <Icon size={28} strokeWidth={1.4} />
              <h3>{title}</h3>
              <p>{description}</p>
              <a href="#contato" aria-label={`Falar sobre ${title}`}><ArrowUpRight size={18} /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className="project-card" to={`/obras/${project.slug}`}>
      <img src={project.coverImage} alt={project.title} loading="lazy" />
      <div className="project-card-overlay" />
      <div className="project-card-content">
        <span>{project.category}</span><h3>{project.title}</h3>
        <div className="project-card-bottom"><p>{project.shortDescription}</p><ArrowUpRight size={21} /></div>
      </div>
    </Link>
  )
}

function FeaturedProjects() {
  return (
    <section className="section projects-section" id="obras">
      <div className="container">
        <div className="section-heading projects-heading">
          <div><p className="eyebrow"><span /> Portfólio</p><h2>Obras que falam <em>por nós.</em></h2></div>
          <Link className="text-link" to="/obras">Ver todas as obras <ArrowUpRight size={17} /></Link>
        </div>
        <div className="projects-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact-section" id="contato">
      <div className="container contact-grid">
        <div><p className="eyebrow light"><span /> Vamos conversar</p><h2>Seu próximo projeto <em>começa aqui.</em></h2><p>Conte para a gente o que você está planejando. Nossa equipe está pronta para ouvir e construir junto.</p></div>
        <div className="contact-links">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="contact-main"><MessageCircle size={23} /> Falar pelo WhatsApp <ArrowUpRight size={19} /></a>
          <a href={gmailLink()} target="_blank" rel="noreferrer"><Mail size={18} /> {siteConfig.email}</a>
          <a href={whatsappLink(`Olá! Gostaria de falar sobre um orçamento pelo telefone ${siteConfig.phone}.`)} target="_blank" rel="noreferrer"><Phone size={18} /> {siteConfig.phone}</a>
          <span><span className="contact-dot" /> Atendimento em toda a região</span>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return <footer className="footer"><div className="container footer-grid"><div><img src={siteConfig.logo} alt="Albuquerque Engenharia" /><p>Construindo soluções que permanecem.</p></div><div><span className="footer-label">Navegação</span>{navItems.map(([label, id]) => <a key={id} href={`/#${id}`}>{label}</a>)}</div><div><span className="footer-label">Contato</span><a href={whatsappLink()} target="_blank" rel="noreferrer">WhatsApp</a><a href={gmailLink()} target="_blank" rel="noreferrer">{siteConfig.email}</a><a href={siteConfig.instagram} target="_blank" rel="noreferrer"><Camera size={15} /> Instagram</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Albuquerque Engenharia</span><span>Feito para construir o amanhã.</span></div></footer>
}

function Home() {
  return <><Header /><main><Hero /><About /><Services /><FeaturedProjects /><Contact /></main><Footer /></>
}

function Projects() {
  const categories = ['Todas', ...new Set(projects.map((project) => project.category))]
  const [active, setActive] = useState('Todas')
  const filtered = active === 'Todas' ? projects : projects.filter((project) => project.category === active)
  return <><Header /><main className="inner-page"><div className="container inner-hero"><p className="eyebrow"><span /> Portfólio</p><h1>Obras que falam<br /><em>por nós.</em></h1><p>Conheça alguns dos projetos realizados pela Albuquerque Engenharia.</p></div><div className="container filter-row">{categories.map((category) => <button className={active === category ? 'active' : ''} onClick={() => setActive(category)} key={category}>{category}</button>)}</div><div className="container all-projects-grid">{filtered.map((project) => <ProjectCard project={project} key={project.id} />)}</div><Contact /></main><Footer /></>
}

function ProjectDetails() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const navigate = useNavigate()
  const image = project?.images[active]
  const next = () => setActive((current) => (current + 1) % (project?.images.length || 1))
  const previous = () => setActive((current) => (current - 1 + (project?.images.length || 1)) % (project?.images.length || 1))

  if (!project) return <><Header /><main className="not-found"><h1>Obra não encontrada.</h1><Link className="button" to="/obras">Voltar ao portfólio <ArrowUpRight size={17} /></Link></main><Footer /></>
  return <><Header /><main className="project-detail"><div className="container detail-top"><button className="back-link" onClick={() => navigate('/obras')}><ChevronLeft size={17} /> Voltar ao portfólio</button><div className="detail-meta"><span>{project.category}</span><span>Projeto em destaque</span></div><h1>{project.title}</h1><p>{project.description}</p></div><div className="container gallery"><button className="gallery-main" onClick={() => setLightbox(true)}><img src={image} alt={`${project.title} - imagem ${active + 1}`} /><span className="gallery-hint"><Play size={14} fill="currentColor" /> Ampliar imagem</span></button><div className="gallery-thumbs">{project.images.map((item, index) => <button className={index === active ? 'active' : ''} onClick={() => setActive(index)} key={item}><img src={item} alt="" /></button>)}</div></div><div className="container detail-info"><div><p className="eyebrow"><span /> Escopo realizado</p><h2>Detalhes do projeto</h2></div><div><p>{project.shortDescription}</p><ul>{project.servicesPerformed.map((service) => <li key={service}><Check size={16} /> {service}</li>)}</ul><ButtonLink href={whatsappLink(`Olá! Conheci o projeto ${project.title} no site e gostaria de solicitar um orçamento.`)}>Falar sobre um projeto</ButtonLink></div></div><Contact /></main><Footer />{lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galeria ampliada" onClick={() => setLightbox(false)}><button className="lightbox-close" onClick={() => setLightbox(false)}><X /></button><button className="lightbox-arrow prev" onClick={(event) => { event.stopPropagation(); previous() }}><ChevronLeft /></button><img src={image} alt={project.title} onClick={(event) => event.stopPropagation()} /><button className="lightbox-arrow next" onClick={(event) => { event.stopPropagation(); next() }}><ChevronRight /></button></div>}</>
}

function App() {
  const location = useLocation()
  useEffect(() => {
    const hash = location.hash.slice(1)
    if (hash) setTimeout(() => scrollToId(hash), 50)
    else window.scrollTo(0, 0)
  }, [location])
  return <Routes><Route path="/" element={<Home />} /><Route path="/obras" element={<Projects />} /><Route path="/obras/:slug" element={<ProjectDetails />} /><Route path="*" element={<ProjectDetails />} /></Routes>
}

export default App
