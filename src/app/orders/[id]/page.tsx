'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils'
import Navbar from '@/components/shop/Navbar'
import { Package, Truck, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

const STEP_ICONS = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setOrder(data)
        setLoading(false)
      })

    // Real-time subscription
    const channel = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => setOrder(prev => prev ? { ...prev, ...payload.new } : prev))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-32">
          <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
          <Link href="/" className="text-orange-500 hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    )
  }

  const currentStep = order.status === 'cancelled' ? -1 : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            Detail Pesanan
          </h1>
          <Link href="/orders" className="text-sm text-orange-500 hover:underline">← Semua Pesanan</Link>
        </div>

        {/* Order ID & Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">ID Pesanan</p>
              <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg">{order.id}</code>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Tanggal</p>
              <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        {order.status !== 'cancelled' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
            <h3 className="font-bold text-gray-900 mb-6">Status Pengiriman</h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-orange-500 transition-all duration-700"
                style={{ height: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
              />

              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = STEP_ICONS[step as keyof typeof STEP_ICONS]
                  const isDone = index <= currentStep
                  const isCurrent = index === currentStep

                  return (
                    <div key={step} className="flex items-start gap-5 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        isDone ? 'bg-orange-500' : 'bg-gray-100'
                      } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}>
                        <Icon className={`w-5 h-5 ${isDone ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="pt-1.5">
                        <p className={`font-semibold text-sm ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                          {ORDER_STATUS_LABELS[step]}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-orange-500 mt-0.5 font-medium">● Status saat ini</p>
                        )}
                        {step === 'shipped' && order.tracking_number && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            No. Resi: <span className="font-mono font-medium">{order.tracking_number}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-700">Pesanan Dibatalkan</p>
              <p className="text-sm text-red-600">Pesanan ini telah dibatalkan</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Produk yang Dipesan</h3>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.product_image?.startsWith('http') ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-gray-500">{item.quantity}x {formatPrice(item.price_at_time)}</p>
                </div>
                <p className="font-bold text-gray-900 text-sm">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon ({order.discount_code})</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Ongkos Kirim</span>
              <span>{order.shipping_cost === 0 ? 'GRATIS' : formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total Pembayaran</span>
              <span className="text-orange-500">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">Alamat Pengiriman</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-900">{order.shipping_address.name}</p>
            <p>{order.shipping_address.phone}</p>
            <p>{order.shipping_address.address}</p>
            <p>{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Metode Pembayaran</span>
            <span className="font-medium capitalize">{order.payment_method?.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
