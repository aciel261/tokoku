'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Email atau password salah') }
      else { router.push(redirect); router.refresh() }
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) { setError(error.message) }
      else { setSuccess('Akun berhasil dibuat! Silakan cek email untuk konfirmasi.') }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>TokoKu</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            {mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              className="text-orange-500 font-semibold hover:underline">
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <p className="font-semibold text-gray-900 mb-1">Cek Email Kamu!</p>
              <p className="text-sm text-gray-500">{success}</p>
              <button onClick={() => setSuccess('')} className="mt-4 text-orange-500 text-sm hover:underline">Kembali ke Login</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Nama kamu"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@contoh.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="Min. 6 karakter" minLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-orange-500">← Kembali ke Toko</Link>
        </p>
      </div>
    </div>
  )
}
