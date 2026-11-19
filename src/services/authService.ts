import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, db } from '../config/firebase'
import { firebaseApp } from '../config/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { AdminRole } from '../types/admin'

const ownerEmail = 'contato@engenhariaalbuquerque.com.br'

export interface AuthState {
  user: User | null
  role: AdminRole | null
  displayName: string | null
  loading: boolean
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('A verificação de acesso expirou.')), milliseconds)
    }),
  ])
}

export async function getRole(user: User): Promise<AdminRole | null> {
  if (user.email?.toLowerCase() === ownerEmail) return 'owner'

  const token = await withTimeout(user.getIdTokenResult(true), 5000)
  const claimedRole = token.claims.role
  if (claimedRole === 'owner' || claimedRole === 'editor') return claimedRole

  const profile = await withTimeout(getDoc(doc(db, 'adminProfiles', user.uid)), 5000)
  if (profile.exists()) {
    const role = profile.data().role
    if (role === 'owner' || role === 'editor') return role
  }

  return null
}

export async function getAdminIdentity(user: User): Promise<{ role: AdminRole | null; displayName: string | null }> {
  const role = await getRole(user)
  if (!role) return { role: null, displayName: null }
  if (user.email?.toLowerCase() === ownerEmail) {
    await withTimeout(httpsCallable(getFunctions(firebaseApp), 'ensureOwnerRole')(), 5000).catch(() => undefined)
    await withTimeout(setDoc(doc(db, 'adminProfiles', user.uid), {
        uid: user.uid,
        email: ownerEmail,
        displayName: 'Rodrigo Cavalcante',
        role: 'owner',
        active: true,
        updatedAt: serverTimestamp(),
      }, { merge: true }), 5000).catch(() => undefined)
    return { role: 'owner', displayName: 'Rodrigo Cavalcante' }
  }

  const profile = await withTimeout(getDoc(doc(db, 'adminProfiles', user.uid)), 5000).catch(() => null)
  const profileName = profile?.exists() ? profile.data().displayName : null
  return {
    role,
    displayName: typeof profileName === 'string' && profileName.trim()
      ? profileName
      : user.displayName || user.email,
  }
}

export function subscribeToAuth(callback: (state: AuthState) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback({ user: null, role: null, displayName: null, loading: false })
      return
    }
    void getAdminIdentity(user)
      .then(({ role, displayName }) => callback({ user, role, displayName, loading: false }))
      .catch(() => callback({ user, role: null, displayName: null, loading: false }))
  })
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function requestPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email)
}

export function logout() {
  return signOut(auth)
}
