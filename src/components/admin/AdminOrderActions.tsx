'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/lib/utils'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderActions({
  orderId,
  currentStatus,
  currentTracking,
  currentPayment,
}: {
  orderId: string
  currentStatus: string
  currentTracking?: string
  currentPayment: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [payment, setPayment] = useState(currentPayment)
  const [tracking, setTracking] = useState(currentTracking || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({
      status,
      payment_status: payment,
      tracking_number: tracking || null,
    }).eq('id', orderId)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status Pesanan</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status Pembayaran</label>
        <select
          value={payment}
          onChange={e => setPayment(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="unpaid">Belum Bayar</option>
          <option value="paid">Sudah Bayar</option>
          <option value="refunded">Refund</option>
        </select>
      </div>

      {(status === 'shipped' || status === 'delivered') && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">No. Resi</label>
          <input
            type="text"
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            placeholder="Masukkan nomor resi..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Menyimpan...' : saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
      </button>
    </div>
  )
}
