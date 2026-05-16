'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Order } from '@/types'
import Navbar from '@/components/shop/Navbar'
import Link from 'next/link'
import { Package, Search, ArrowRight } from 'lucide-react'

export default function OrdersPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const searchOrders = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('guest_email', email.trim().toLowerCase())
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Package className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            Lacak Pesanan
          </h1>
          <p className="text-gray-500 mt-1">Cari pesanan Anda dengan email yang digunakan saat checkout</p>
        </div>

        <form onSubmit={searchOrders} className="flex gap-3 mb-8">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Masukkan email..."
            required
            className="flex-1 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3.5 rounded-2xl transition-colors disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        {searched && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">Tidak ada pesanan ditemukan untuk email ini</p>
                <Link href="/shop" className="inline-block mt-4 text-orange-500 font-semibold hover:underline text-sm">
                  Mulai Belanja →
                </Link>
              </div>
            ) : (
              orders.map((order: Order) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                        {order.id.slice(0, 12)}...
                      </code>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
