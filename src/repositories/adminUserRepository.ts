import { httpsCallable, getFunctions } from 'firebase/functions'
import { firebaseApp } from '../config/firebase'

export async function listAdminUsers() {
  const listUsers = httpsCallable<void, { users: Array<{ uid: string; email?: string; displayName?: string; disabled: boolean; role: 'owner' | 'editor'; active: boolean }> }>(getFunctions(firebaseApp), 'listAdminUsers')
  const result = await listUsers()
  return result.data.users
}

export async function createAdminUser(input: { email: string; password: string; displayName?: string }) {
  const createUser = httpsCallable<typeof input, { uid: string }>(getFunctions(firebaseApp), 'createAdminUser')
  return createUser(input)
}

export async function deleteAdminUser(uid: string) {
  const deleteUser = httpsCallable<{ uid: string }, { uid: string }>(getFunctions(firebaseApp), 'deleteAdminUser')
  return deleteUser({ uid })
}
