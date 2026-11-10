import type { Project } from '../types/project'

const imageModules = import.meta.glob<string>(
  '../assets/servicosRealizados/SITE/**/*.{jpeg,jpg,png,webp}',
  { eager: true, import: 'default', query: '?url' },
)

type ServiceData = Pick<Project, 'title' | 'category' | 'description' | 'servicesPerformed' | 'featured'>

const serviceData: Record<string, ServiceData> = {
  'BAIA DO SUESTE - REVITALIZAÇÃO DE FACHADA': {
    title: 'Baía do Sueste',
    category: 'Revitalização de fachadas',
    description: 'Revitalização de fachada com lavagem, recuperação de revestimentos e tratamento das juntas para preservar o desempenho e a aparência do edifício.',
    servicesPerformed: ['Lavagem com hidrojateamento', 'Substituição de pastilhas danificadas', 'Substituição de rejunte', 'Substituição de selante'],
    featured: true,
  },
  'CONDOMÍNIO ENCONTRO DAS ÁGUAS': {
    title: 'Condomínio Encontro das Águas',
    category: 'Reformas residenciais',
    description: 'Revitalização das portarias e dos acessos do condomínio, com foco na recuperação das superfícies e na valorização da entrada.',
    servicesPerformed: ['Revitalização de portarias', 'Tratamento de superfícies', 'Execução de acabamento'],
    featured: true,
  },
  'DELRIO - REVITALIZAÇÃO EM FACHADA': {
    title: 'DelRio',
    category: 'Revitalização de fachadas',
    description: 'Serviços de revitalização em fachadas, incluindo tratamento estrutural, criação de juntas e renovação dos acabamentos.',
    servicesPerformed: ['Lavagem com hidrojateamento', 'Tratamento estrutural', 'Criação de juntas de movimentação', 'Aplicação de textura acrílica', 'Pintura'],
    featured: true,
  },
  'ED. IRIS - SUBSTITUIÇÃO DE TELHADO': {
    title: 'Ed. Iris',
    category: 'Manutenção e adequações',
    description: 'Intervenção de manutenção e adequação da cobertura do edifício para melhorar a proteção e a durabilidade da estrutura.',
    servicesPerformed: ['Substituição de telhado', 'Adequações técnicas', 'Execução de acabamento'],
    featured: false,
  },
  LAGOA: {
    title: 'Lagoa Verde',
    category: 'Revitalização de fachadas',
    description: 'Serviços de recuperação e revitalização de fachadas, com tratamento de trincas, preparação das superfícies e pintura.',
    servicesPerformed: ['Lavagem com hidrojateamento', 'Recuperação estrutural', 'Tratamento de trincas e fissuras', 'Aplicação de fundo preparador', 'Execução de pintura'],
    featured: false,
  },
  'LAVANDERIA 60 MINUTOS': {
    title: 'Lavanderia 60 Minutos',
    category: 'Construção comercial',
    description: 'Construção e adequação de espaço comercial para receber uma operação de lavanderia completa, com instalações e automação.',
    servicesPerformed: ['Demolição de loja existente', 'Construção de lavanderia', 'Sistema de automação', 'Sistema hidrossanitário e de esgoto', 'Forro e pintura'],
    featured: false,
  },
  NEOGIBA: {
    title: 'Neogiba',
    category: 'Serviços de engenharia',
    description: 'Projeto demonstrativo. A descrição técnica e os serviços executados serão atualizados pelo proprietário.',
    servicesPerformed: ['Serviços de engenharia', 'Execução e acompanhamento técnico'],
    featured: false,
  },
  'NEVADA - SERVIÇOS EM FACHADA': {
    title: 'Nevada',
    category: 'Revitalização de fachadas',
    description: 'Serviços de recuperação e renovação de fachada, com tratamento das superfícies e aplicação de pintura acrílica.',
    servicesPerformed: ['Lavagem com hidrojateamento', 'Retirada de caixas de ar condicionado sem uso', 'Tratamento de trincas e fissuras', 'Aplicação de fundo preparador', 'Aplicação de tinta acrílica'],
    featured: false,
  },
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getServiceFolder(path: string) {
  return path.split('/SITE/')[1].split('/')[0]
}

function getImageOrder(path: string) {
  const priority = path.toUpperCase().includes('FINALIZAÇÃO') || path.toUpperCase().includes('FINALIZACAO') ? 0 : 1
  return `${priority}-${path}`
}

function buildProjects(): Project[] {
  const grouped = new Map<string, string[]>()

  Object.entries(imageModules).forEach(([path, url]) => {
    const folder = getServiceFolder(path)
    const images = grouped.get(folder) ?? []
    images.push(url)
    grouped.set(folder, images)
  })

  return [...grouped.entries()].map(([folder, images]) => {
    const data = serviceData[folder] ?? {
      title: folder,
      category: 'Serviços de engenharia',
      description: 'Projeto demonstrativo. A descrição técnica e os serviços executados serão atualizados pelo proprietário.',
      servicesPerformed: ['Serviços de engenharia', 'Execução e acompanhamento técnico'],
      featured: false,
    }
    const orderedImages = images.sort((a, b) => getImageOrder(a).localeCompare(getImageOrder(b)))

    return {
      id: slugify(folder),
      slug: slugify(folder),
      title: data.title,
      shortDescription: `${data.category}.`,
      description: data.description,
      category: data.category,
      coverImage: orderedImages[0],
      images: orderedImages,
      servicesPerformed: data.servicesPerformed,
      featured: data.featured,
      published: true,
    }
  })
}

const localProjects = buildProjects()

export function getProjects(): Project[] {
  return localProjects.filter((project) => project.published)
}
