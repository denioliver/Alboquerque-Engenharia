import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https'

if (getApps().length === 0) initializeApp()

const ownerEmail = 'contato@engenhariaalbuquerque.com.br'
const admin = getFirestore()

async function requireOwner(request: CallableRequest) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
  const role = request.auth.token?.role
  const email = typeof request.auth.token?.email === 'string' ? request.auth.token.email.toLowerCase() : ''
  if (role !== 'owner' && email !== ownerEmail) throw new HttpsError('permission-denied', 'Apenas o proprietário pode executar esta ação.')
  return request.auth.uid
}

export const ensureOwnerRole = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
  const email = request.auth.token.email?.toLowerCase()
  if (email !== ownerEmail) throw new HttpsError('permission-denied', 'Esta conta não é a proprietária.')

  await getAuth().setCustomUserClaims(request.auth.uid, { role: 'owner' })
  await admin.doc(`adminProfiles/${request.auth.uid}`).set({
    uid: request.auth.uid,
    email: ownerEmail,
    displayName: 'Rodrigo Cavalcante',
    role: 'owner',
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  const settingsRef = admin.doc('siteSettings/general')
  const settings = await settingsRef.get()
  const current = settings.exists ? settings.data() : {}
  const repair: Record<string, unknown> = {}
  if (typeof current?.phone !== 'string' || !current.phone.trim()) repair.phone = '(71) 99661-8635'
  if (typeof current?.whatsappNumber !== 'string' || !current.whatsappNumber.trim()) repair.whatsappNumber = '5571996618635'
  if (Object.keys(repair).length > 0) {
    await settingsRef.set(repair, { merge: true })
  }

  return { role: 'owner' }
})

export const createAdminUser = onCall(async (request) => {
  await requireOwner(request)
  const data = request.data as { email?: unknown; password?: unknown; displayName?: unknown }
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
  const password = typeof data.password === 'string' ? data.password : ''
  const displayName = typeof data.displayName === 'string' ? data.displayName.trim().slice(0, 100) : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    throw new HttpsError('invalid-argument', 'Informe um e-mail válido e uma senha com pelo menos 8 caracteres.')
  }
  try {
    const user = await getAuth().createUser({ email, password, displayName: displayName || undefined })
    await getAuth().setCustomUserClaims(user.uid, { role: 'editor' })
    await admin.doc(`adminProfiles/${user.uid}`).set({
      uid: user.uid,
      email,
      displayName: displayName || undefined,
      role: 'editor',
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return { uid: user.uid }
  } catch (error) {
    if (error instanceof HttpsError) throw error
    throw new HttpsError('internal', 'Não foi possível criar o acesso.')
  }
})

export const listAdminUsers = onCall(async (request) => {
  await requireOwner(request)
  const users = await getAuth().listUsers(1000)
  const profiles = await Promise.all(users.users.map((user) => admin.doc(`adminProfiles/${user.uid}`).get()))
  return {
    users: users.users.map((user, index) => {
      const profile = profiles[index].exists ? profiles[index].data() : undefined
      return {
        uid: user.uid,
        email: user.email,
        displayName: profile?.displayName || user.displayName,
        disabled: user.disabled,
        role: profile?.role || 'editor',
        active: profile?.active !== false,
      }
    }),
  }
})

export const deleteAdminUser = onCall(async (request) => {
  await requireOwner(request)
  const uid = typeof request.data?.uid === 'string' ? request.data.uid : ''
  if (!uid) throw new HttpsError('invalid-argument', 'Usuário inválido.')
  try {
    const target = await getAuth().getUser(uid)
    if (target.email?.toLowerCase() === ownerEmail) {
      throw new HttpsError('permission-denied', 'Não é possível excluir o proprietário.')
    }
    await getAuth().deleteUser(uid)
    await admin.doc(`adminProfiles/${uid}`).delete()
    return { uid }
  } catch (error) {
    if (error instanceof HttpsError) throw error
    throw new HttpsError('internal', 'Não foi possível excluir o acesso.')
  }
})
