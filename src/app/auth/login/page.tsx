import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginClient />
    </Suspense>
  )
}
