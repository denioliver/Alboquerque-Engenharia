import { useCallback, useEffect, useState } from 'react'
import type React from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Pencil, Plus, Settings, Shield, Trash2, Upload, Users, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { login, logout, requestPasswordReset, subscribeToAuth, type AuthState } from '../services/authService'
import { createAdminUser, deleteAdminUser, listAdminUsers } from '../repositories/adminUserRepository'
import { listAdminProjects, removeProject, saveProject } from '../repositories/adminProjectRepository'
import { uploadProjectImage, validateImageFiles } from '../services/imageService'
import type { AdminProject, ProjectImage } from '../types/admin'
import { defaultSiteSettings } from '../config/siteSettings'
import { normalizeInstagram, normalizeWhatsAppNumber } from '../config/siteConfig'
import { getSiteSettings, saveSiteSettings, uploadSiteImage } from '../repositories/siteSettingsRepository'
import type { SiteSettings } from '../types/siteSettings'
import adminLogo from '../assets/logo/logo-albuquerque-engenharia.png'
import { getProjects, removeLocalProject } from '../repositories/projectRepository'
import './admin.css'

function messageFor(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'Não foi possível concluir a operação. Tente novamente.'
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.startsWith('55')) {
    const localNumber = digits.slice(2).slice(0, 11)
    return localNumber ? `+55 ${formatPhone(localNumber)}` : '+55'
  }
  return formatPhone(digits)
}

function useAdminAuth() {
  const [state, setState] = useState<AuthState>({ user: null, role: null, displayName: null, loading: true })
  useEffect(() => subscribeToAuth(setState), [])
  return state
}

export function AdminLogin({ reset = false }: { reset?: boolean }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true); setFeedback('')
    try {
      if (reset) {
        await requestPasswordReset(email)
        setFeedback('Caso exista uma conta associada a este e-mail, as instruções foram enviadas.')
      } else {
        await login(email, password)
        navigate('/admin/dashboard')
      }
    } catch (error) { setFeedback(messageFor(error)) } finally { setBusy(false) }
  }
  return <main className="admin-auth"><div className="admin-auth-card">
    <span className="admin-kicker">Albuquerque Engenharia</span>
    <h1>{reset ? 'Recuperar senha' : 'Acesso administrativo'}</h1>
    <p>{reset ? 'Informe seu e-mail para receber as instruções de recuperação.' : 'Entre para gerenciar o portfólio da empresa.'}</p>
    <form onSubmit={submit}>
      <label>E-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {!reset && <label>Senha<div className="password-field"><input type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></label>}
      {feedback && <p className="admin-feedback">{feedback}</p>}
      <button className="admin-button" disabled={busy}>{busy ? 'Aguarde...' : reset ? 'Enviar instruções' : 'Entrar'}</button>
    </form>
    <Link to={reset ? '/admin/login' : '/admin/recuperar-senha'}>{reset ? 'Voltar ao login' : 'Esqueci minha senha'}</Link>
  </div></main>
}

function AdminLayout({ auth, children }: { auth: AuthState; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const links: Array<readonly [string, string, LucideIcon]> = [['/admin/dashboard', 'Dashboard', LayoutDashboard], ['/admin/obras', 'Obras', Pencil], ...(auth.role === 'owner' ? [['/admin/usuarios', 'Usuários', Users] as const, ['/admin/configuracoes', 'Configurações', Settings] as const] : [])]
  return <div className="admin-shell">
    <aside className={menuOpen ? 'is-open' : ''}><a className="admin-brand" href="/" aria-label="Abrir site"><img className="admin-brand-logo" src={adminLogo} alt="Albuquerque Engenharia" /></a><nav>{links.map(([to, label, Icon]) => <Link onClick={() => setMenuOpen(false)} to={to} key={to}><Icon size={18} />{label}</Link>)}</nav><button className="admin-logout" onClick={() => void logout()}><LogOut size={18} />Sair</button></aside>
    <div className="admin-content"><header><button className="admin-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu"><Menu /></button><span>{auth.displayName || auth.user?.email}</span><button onClick={() => void logout()}><LogOut size={17} /></button></header>{children}</div>
  </div>
}

function Protected({ role, children }: { role?: 'owner' | 'editor'; children: React.ReactNode }) {
  const auth = useAdminAuth()
  if (auth.loading) return <div className="admin-loading">Carregando...</div>
  if (!auth.user || !auth.role) return <Navigate to="/admin/login" replace />
  if (role && auth.role !== role) return <Navigate to="/admin/dashboard" replace />
  return <AdminLayout auth={auth}>{children}</AdminLayout>
}

function Dashboard() {
  const auth = useAdminAuth()
  const [projectCount, setProjectCount] = useState(getProjects().length)
  const [userCount, setUserCount] = useState(auth.user ? 1 : 0)
  useEffect(() => {
    void listAdminProjects()
      .then((remoteProjects) => {
        const allProjectIds = new Set(getProjects().map((project) => project.id))
        remoteProjects.forEach((project) => allProjectIds.add(project.id))
        setProjectCount(allProjectIds.size)
      })
      .catch(() => setProjectCount(getProjects().length))
  }, [])
  useEffect(() => {
    if (auth.role !== 'owner') return
    setUserCount(auth.user ? 1 : 0)
  }, [auth.role, auth.user])
  return <section className="admin-page"><div className="admin-page-heading"><div><span className="admin-kicker">Visão geral</span><h1>Dashboard</h1></div><div className="admin-heading-actions"><Link className="admin-button" to="/admin/obras/nova"><Plus size={18} />Nova obra</Link>{auth.role === 'owner' && <Link className="admin-button secondary" to="/admin/usuarios"><Users size={18} />Gerenciar acessos</Link>}</div></div><div className="dashboard-stats-layout"><div className="stats-grid"><div><strong>{projectCount}</strong><span>Obras no site</span></div>{auth.role === 'owner' && <div><strong>{userCount}</strong><span>Usuários com acesso</span></div>}</div><div className="visits-card"><h2>Visitas ao site</h2><div className="visits-metrics"><div><strong>0</strong><span>Hoje</span></div><div><strong>0</strong><span>Semana</span></div><div><strong>0</strong><span>Mês</span></div><div><strong>0</strong><span>Total</span></div></div></div></div><div className="admin-callout"><Shield size={22} /><div><strong>Segurança ativa</strong><p>A autorização é validada pelo Firebase Authentication e pelas regras do backend.</p></div></div></section>
}

const emptyProject: Omit<AdminProject, 'id'> = { slug: '', title: '', shortDescription: '', description: '', category: '', servicesPerformed: [], images: [], coverImageId: '', featured: false, published: false }

function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [form, setForm] = useState<Omit<AdminProject, 'id'>>(emptyProject)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (id) void listAdminProjects().then((items) => { setProjects(items); const found = items.find((item) => item.id === id); if (found) setForm(found) }) }, [id])
  const setField = (field: keyof typeof form, value: string | boolean | string[] | ProjectImage[]) => setForm((current) => ({ ...current, [field]: value }))
  const onFiles = (files: File[]) => { try { validateImageFiles(files, form.images.length); setNewFiles(files); setFeedback('') } catch (error) { setFeedback(messageFor(error)) } }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setFeedback('')
    try {
      const projectId = id ?? crypto.randomUUID()
      const uploaded: ProjectImage[] = []
      for (const [index, file] of newFiles.entries()) uploaded.push(await uploadProjectImage(file, projectId, form.images.length + index, form.published, setProgress))
      const images = [...form.images, ...uploaded]
      const savedId = await saveProject({ ...form, slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), images, coverImageId: form.coverImageId || images[0]?.id || '' }, id)
      navigate(`/admin/obras/${savedId}/editar`)
    } catch (error) { setFeedback(messageFor(error)) } finally { setBusy(false) }
  }
  const removeImage = (imageId: string) => setField('images', form.images.filter((image) => image.id !== imageId))
  return <section className="admin-page"><div className="admin-page-heading"><div><span className="admin-kicker">{id ? 'Editar obra' : 'Novo cadastro'}</span><h1>{id ? 'Editar obra' : 'Nova obra'}</h1></div></div><form className="project-form" onSubmit={submit}>
    <div className="form-grid"><label>Título<input required value={form.title} onChange={(event) => setField('title', event.target.value)} /></label><label>Categoria<input required value={form.category} onChange={(event) => setField('category', event.target.value)} /></label><label>Localização<input value={form.location ?? ''} onChange={(event) => setField('location', event.target.value)} /></label><label>Data de conclusão<input type="date" value={form.completionDate ?? ''} onChange={(event) => setField('completionDate', event.target.value)} /></label></div>
    <label>Resumo<input required value={form.shortDescription} onChange={(event) => setField('shortDescription', event.target.value)} /></label><label>Descrição<textarea required rows={5} value={form.description} onChange={(event) => setField('description', event.target.value)} /></label><label>Serviços executados<input value={form.servicesPerformed.join(', ')} onChange={(event) => setField('servicesPerformed', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label>
    <div className="upload-box"><label><Upload size={20} />Selecionar imagens (JPEG, PNG ou WebP)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => onFiles([...event.target.files ?? []])} /></label><small>{form.images.length + newFiles.length}/10 imagens selecionadas</small></div>
    {(form.images.length > 0 || newFiles.length > 0) && <div className="image-preview-grid">{form.images.map((image) => <div key={image.id}><img src={image.url} alt={image.alt} /><button type="button" onClick={() => removeImage(image.id)} aria-label="Remover imagem"><X size={15} /></button><button type="button" className={form.coverImageId === image.id ? 'cover active' : 'cover'} onClick={() => setField('coverImageId', image.id)}>Capa</button></div>)}{newFiles.map((file) => <div key={file.name}><img src={URL.createObjectURL(file)} alt={file.name} /><span>Nova</span></div>)}</div>}
    <div className="form-options"><label className="checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => setField('featured', event.target.checked)} /> Destaque na página inicial</label><label className="checkbox"><input type="checkbox" checked={form.published} onChange={(event) => setField('published', event.target.checked)} /> Publicada</label></div>
    {busy && <progress max="100" value={progress} />}{feedback && <p className="admin-feedback">{feedback}</p>}<div className="form-actions"><Link className="admin-button secondary" to="/admin/obras">Cancelar</Link><button className="admin-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar obra'}</button></div>
  </form>{projects.length > 0 && null}</section>
}

function getLocalAdminProjects() {
  return getProjects().map((project): AdminProject => ({
    ...project,
    images: project.images.map((url, order) => ({
      id: `${project.id}-${order + 1}`,
      source: 'local',
      localAssetKey: url,
      url,
      alt: project.title,
      order,
    })),
    coverImageId: `${project.id}-1`,
  }))
}

function ProjectsAdmin() {
  const [projects, setProjects] = useState<AdminProject[]>(getLocalAdminProjects)
  const load = () => {
    const local = getLocalAdminProjects()
    void listAdminProjects()
      .then((remote) => {
        const merged = new Map(local.map((project) => [project.id, project]))
        remote.forEach((project) => merged.set(project.id, project))
        setProjects([...merged.values()])
      })
      .catch(() => undefined)
  }
  useEffect(load, [])
  const remove = async (project: AdminProject) => { if (!window.confirm(`Excluir "${project.title}"?`)) return; const local = project.images.length > 0 && project.images.every((image) => image.source === 'local'); try { if (local) removeLocalProject(project.id); else await removeProject(project); load() } catch (error) { window.alert(messageFor(error)) } }
  return <section className="admin-page"><div className="admin-page-heading"><div><span className="admin-kicker">Conteúdo</span><h1>Obras</h1></div><Link className="admin-button" to="/admin/obras/nova"><Plus size={18} />Nova obra</Link></div><div className="admin-table">{projects.map((project) => { const local = project.images.length > 0 && project.images.every((image) => image.source === 'local'); return <div className="admin-row" key={project.id}><div><strong>{project.title}</strong><span>{project.category}</span></div><div className="row-actions">{!local && <Link to={`/admin/obras/${project.id}/editar`} aria-label={`Editar ${project.title}`}><Pencil size={16} /></Link>}<button onClick={() => void remove(project)} aria-label={`Excluir ${project.title}`}><Trash2 size={16} /></button></div></div>})}{projects.length === 0 && <p className="empty-state">Nenhuma obra encontrada no site.</p>}</div></section>
}

function UsersAdmin() {
  const auth = useAdminAuth()
  const [users, setUsers] = useState<Awaited<ReturnType<typeof listAdminUsers>>>([])
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const load = useCallback(() => {
    if (auth.user) {
      setUsers([{ uid: auth.user.uid, email: auth.user.email ?? undefined, displayName: auth.displayName ?? auth.user.displayName ?? undefined, disabled: false, role: auth.role === 'owner' ? 'owner' : 'editor', active: true }])
    }
  }, [auth.user, auth.displayName, auth.role])
  useEffect(() => { if (auth.user) load() }, [auth.user, load])
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (form.password.length < 8) { setFeedback('A senha provisória deve ter pelo menos 8 caracteres.'); return } try { setBusy(true); setFeedback(''); await createAdminUser(form); setOpen(false); setForm({ email: '', password: '', displayName: '' }); load() } catch (error) { setFeedback(messageFor(error)) } finally { setBusy(false) } }
  const remove = async (uid: string, email?: string) => { if (!window.confirm(`Excluir o acesso de "${email || uid}" permanentemente?`)) return; try { await deleteAdminUser(uid); load() } catch (error) { setFeedback(messageFor(error)) } }
  return <section className="admin-page"><div className="admin-page-heading"><div><span className="admin-kicker">Acessos</span><h1>Usuários</h1></div><button className="admin-button" onClick={() => { setFeedback(''); setOpen(true) }}><Plus size={18} />Criar novo acesso</button></div>{feedback && !open && <p className="admin-feedback">{feedback}</p>}<div className="admin-table">{users.map((user) => <div className="admin-row" key={user.uid}><div><strong>{user.displayName || 'Sem nome'}</strong><span>{user.email || 'Sem e-mail'}</span></div><span className="status published">{user.role === 'owner' ? 'Proprietário' : 'Editor'}</span>{user.role !== 'owner' && <button onClick={() => void remove(user.uid, user.email)} aria-label={`Excluir ${user.email || user.uid}`}><Trash2 size={16} /></button>}</div>)}</div>{open && <div className="admin-modal"><form onSubmit={submit}><button type="button" className="modal-close" onClick={() => setOpen(false)}><X /></button><h2>Criar novo acesso</h2><label>Nome<input required value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label><label>E-mail<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Senha provisória<input type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{feedback && <p className="admin-feedback">{feedback}</p>}<button className="admin-button" disabled={busy}>{busy ? 'Criando acesso...' : 'Criar acesso'}</button></form></div>}</section>
}

function SiteSettingsAdmin() {
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings)
  const [savedForm, setSavedForm] = useState<SiteSettings>(defaultSiteSettings)
  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    void getSiteSettings()
      .then((settings) => {
        if (settings) {
          setForm((current) => {
            const loaded = {
              ...current,
              ...settings,
              logoUrl: typeof settings.logoUrl === 'string' && settings.logoUrl.length > 0 && !settings.logoUrl.startsWith('/assets/')
                ? settings.logoUrl
                : current.logoUrl,
              heroImageUrl: typeof settings.heroImageUrl === 'string' && settings.heroImageUrl.length > 0 && !settings.heroImageUrl.startsWith('/assets/')
                ? settings.heroImageUrl
                : current.heroImageUrl,
              phone: formatPhone(settings.phone || current.phone),
              whatsappNumber: formatWhatsApp(settings.whatsappNumber || current.whatsappNumber),
              instagram: settings.instagram || current.instagram,
            }
            setSavedForm(loaded)
            return loaded
          })
        }
      })
      .catch((error) => setFeedback(messageFor(error)))
  }, [])
  const setField = (field: keyof SiteSettings, value: string) => setForm((current) => ({
    ...current,
    [field]: field === 'phone'
      ? formatPhone(value)
      : field === 'whatsappNumber'
        ? formatWhatsApp(value)
        : value,
  }))
  const upload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImageUrl', name: 'logo' | 'hero') => {
    const file = event.target.files?.[0]
    if (!file) return
    try { setBusy(true); setField(field, await uploadSiteImage(file, name)); setFeedback('Imagem carregada. Clique em salvar para publicar.') } catch (error) { setFeedback(messageFor(error)) } finally { setBusy(false) }
  }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setBusy(true)
      const normalized = {
        ...form,
        phone: formatPhone(form.phone),
        whatsappNumber: normalizeWhatsAppNumber(form.whatsappNumber),
        instagram: normalizeInstagram(form.instagram),
      }
      await saveSiteSettings(normalized)
      const saved = { ...normalized, whatsappNumber: formatWhatsApp(normalized.whatsappNumber) }
      setForm(saved)
      setSavedForm(saved)
      setEditing(false)
      setFeedback('Configurações salvas com sucesso.')
    } catch (error) {
      setFeedback(messageFor(error))
    } finally {
      setBusy(false)
    }
  }
  const startEditing = () => {
    setSavedForm(form)
    setEditing(true)
    setFeedback('')
  }
  const cancelEditing = () => {
    setForm(savedForm)
    setEditing(false)
    setFeedback('')
  }
  const textFields: Array<[keyof SiteSettings, string, string]> = [['brandName', 'Nome da empresa', 'text'], ['phone', 'Telefone', 'text'], ['email', 'E-mail', 'email'], ['instagram', 'Instagram (@usuario ou URL)', 'text'], ['whatsappNumber', 'WhatsApp (com ou sem código do país)', 'text'], ['heroEyebrow', 'Texto acima do título', 'text'], ['heroTitle', 'Título principal', 'text'], ['heroDescription', 'Descrição principal', 'textarea'], ['aboutTitle', 'Título sobre a empresa', 'text'], ['aboutLead', 'Resumo sobre a empresa', 'textarea'], ['aboutDescription', 'Descrição sobre a empresa', 'textarea'], ['servicesTitle', 'Título dos serviços', 'text'], ['servicesDescription', 'Descrição dos serviços', 'textarea'], ['contactTitle', 'Título do contato', 'text'], ['contactDescription', 'Descrição do contato', 'textarea'], ['footerTagline', 'Frase do rodapé', 'text']]
  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div><span className="admin-kicker">Personalização</span><h1>Configurações do site</h1></div>
        {!editing && <button type="button" className="admin-button" onClick={startEditing}><Pencil size={16} />Editar campos</button>}
      </div>
      <form className="project-form settings-form" onSubmit={submit}>
        <div className={`settings-upload-grid ${editing ? '' : 'is-readonly'}`}>
          <div className="upload-box">
            {editing ? <label><Upload size={20} />Nova logo<input type="file" accept="image/*" onChange={(event) => void upload(event, 'logoUrl', 'logo')} /></label> : <span><Upload size={20} />Logo atual</span>}
            <img className="settings-image-preview" src={form.logoUrl} alt="Logo atual" />
          </div>
          <div className="upload-box">
            {editing ? <label><Upload size={20} />Nova imagem de fundo<input type="file" accept="image/*" onChange={(event) => void upload(event, 'heroImageUrl', 'hero')} /></label> : <span><Upload size={20} />Imagem de fundo atual</span>}
            <img className="settings-image-preview" src={form.heroImageUrl} alt="Imagem atual da tela inicial" />
          </div>
        </div>
        <div className="settings-fields">
          {textFields.map(([field, label, type]) => (
            <label key={field}>
              {label}
              {type === 'textarea'
                ? <textarea rows={3} disabled={!editing} value={form[field]} onChange={(event) => setField(field, event.target.value)} />
                : <input type={type} disabled={!editing} value={form[field]} onChange={(event) => setField(field, event.target.value)} />}
            </label>
          ))}
        </div>
        {feedback && <p className="admin-feedback">{feedback}</p>}
        {editing && <div className="form-actions">
          <button type="button" className="admin-button secondary" onClick={cancelEditing} disabled={busy}>Cancelar</button>
          <button className="admin-button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar configurações'}</button>
        </div>}
      </form>
    </section>
  )
}

export function AdminRoutes() {
  return <Routes><Route path="login" element={<AdminLogin />} /><Route path="recuperar-senha" element={<AdminLogin reset />} /><Route path="dashboard" element={<Protected><Dashboard /></Protected>} /><Route path="obras" element={<Protected><ProjectsAdmin /></Protected>} /><Route path="obras/nova" element={<Protected><ProjectForm /></Protected>} /><Route path="obras/:id/editar" element={<Protected><ProjectForm /></Protected>} /><Route path="usuarios" element={<Protected role="owner"><UsersAdmin /></Protected>} /><Route path="configuracoes" element={<Protected role="owner"><SiteSettingsAdmin /></Protected>} /><Route index element={<Navigate to="dashboard" replace />} /></Routes>
}
