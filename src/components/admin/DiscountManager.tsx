'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DiscountCode } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'

const initialForm = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  min_purchase: '0',
  valid_until: '',
  usage_limit: '',
  is_active: true,
}

export default function DiscountManager({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const router = useRouter()
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes)
  const [form, setForm] = useState(initialForm)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const addCode = async () => {
    if (!form.code.trim() || !form.value) return
    setAdding(true)
    const supabase = createClient()

    const { data, error } = await supabase.from('discount_codes').insert({
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: parseFloat(form.value),
      min_purchase: parseFloat(form.min_purchase) || 0,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      is_active: form.is_active,
    }).select().single()

    if (data) setCodes(prev => [data, ...prev])
    setForm(initialForm)
    setAdding(false)
    router.refresh()
  }

  const toggleCode = async (code: DiscountCode) => {
    setLoading(code.id)
    const supabase = createClient()
    await supabase.from('discount_codes').update({ is_active: !code.is_active }).eq('id', code.id)
    setCodes(prev => prev.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c))
    setLoading(null)
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Hapus kode diskon ini?')) return
    setLoading(id)
    const supabase = createClient()
    await supabase.from('discount_codes').delete().eq('id', id)
    setCodes(prev => prev.filter(c => c.id !== id))
    setLoading(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
        <h3 className="font-bold text-gray-900 mb-4">Buat Kode Baru</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode Kupon *</label>
            <input
              type="text"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="HEMAT10"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipe Diskon</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'percentage', label: 'Persentase (%)' },
                { val: 'fixed', label: 'Nominal (Rp)' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: opt.val as any }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.type === opt.val ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nilai {form.type === 'percentage' ? '(%) *' : '(Rp) *'}
            </label>
            <input
              type="number"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type === 'percentage' ? '10' : '50000'}
              max={form.type === 'percentage' ? 100 : undefined}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min. Pembelian (Rp)</label>
            <input
              type="number"
              value={form.min_purchase}
              onChange={e => setForm(f => ({ ...f, min_purchase: e.target.value }))}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Berlaku Hingga</label>
            <input
              type="datetime-local"
              value={form.valid_until}
              onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Batas Penggunaan</label>
            <input
              type="number"
              value={form.usage_limit}
              onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))}
              placeholder="Tak terbatas"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={addCode}
            disabled={adding || !form.code || !form.value}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {adding ? 'Membuat...' : 'Buat Kode'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Daftar Kode Diskon ({codes.length})</h3>
        </div>

        {codes.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada kode diskon</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {codes.map(code => {
              const isExpired = code.valid_until && new Date(code.valid_until) < new Date()
              const isUsedUp = code.usage_limit && code.usage_count >= code.usage_limit
              const isEffectivelyActive = code.is_active && !isExpired && !isUsedUp

              return (
                <div key={code.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono font-bold text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded-lg">
                        {code.code}
                      </code>
                      {isEffectivelyActive ? (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">Aktif</span>
                      ) : isExpired ? (
                        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Kadaluarsa</span>
                      ) : isUsedUp ? (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Habis</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Nonaktif</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      <span className="font-medium text-orange-500">
                        {code.type === 'percentage' ? `${code.value}%` : formatPrice(code.value)} off
                      </span>
                      {code.min_purchase > 0 && <span>Min. {formatPrice(code.min_purchase)}</span>}
                      <span>{code.usage_count}/{code.usage_limit ?? '∞'} dipakai</span>
                      {code.valid_until && <span>s/d {formatDate(code.valid_until).split(',')[0]}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleCode(code)}
                      disabled={loading === code.id}
                      className={`p-1.5 rounded-lg transition-colors ${code.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={code.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {code.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteCode(code.id)}
                      disabled={loading === code.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {loading === code.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
