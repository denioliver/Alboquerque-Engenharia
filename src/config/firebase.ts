import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyDvnfStrrwfJSmgbKt7wPvHoeZspCB3H7I',
  authDomain: 'alboquerque-engenharia.firebaseapp.com',
  projectId: 'alboquerque-engenharia',
  storageBucket: 'alboquerque-engenharia.firebasestorage.app',
  messagingSenderId: '765150960034',
  appId: '1:765150960034:web:5366332278633b2cf5bafb',
  measurementId: 'G-YNG8L5HGVQ',
}

export const firebaseApp = initializeApp(firebaseConfig)

export async function initializeAnalytics() {
  if (await isSupported()) {
    return getAnalytics(firebaseApp)
  }
  return null
}
