import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import AdminOrderActions from '@/components/admin/AdminOrderActions'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered']
  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            Detail Pesanan
          </h1>
          <code className="text-xs text-gray-400 font-mono">{order.id}</code>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Produk Dipesan</h3>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product_image?.startsWith('http') ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity}x {formatPrice(item.price_at_time)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
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
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Info Pelanggan & Pengiriman</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pelanggan</p>
                <p className="font-semibold text-gray-900">{order.guest_name}</p>
                <p className="text-sm text-gray-500">{order.guest_email}</p>
                <p className="text-sm text-gray-500">{order.shipping_address?.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alamat</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {order.shipping_address?.address}<br />
                  {order.shipping_address?.city}, {order.shipping_address?.province}<br />
                  {order.shipping_address?.postal_code}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catatan</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-1">Status Pesanan</h3>
            <p className="text-xs text-gray-400 mb-4">{formatDate(order.created_at)}</p>

            {/* Progress Steps */}
            <div className="space-y-3 mb-5">
              {statusSteps.map((step, i) => (
                <div key={step} className={`flex items-center gap-3 text-sm ${i <= currentStepIndex ? 'text-orange-500' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i < currentStepIndex ? 'bg-orange-500 text-white' :
                    i === currentStepIndex ? 'border-2 border-orange-500 text-orange-500' :
                    'border-2 border-gray-200 text-gray-300'
                  }`}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`font-medium ${i === currentStepIndex ? 'text-gray-900' : ''}`}>
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
              ))}
            </div>

            <AdminOrderActions orderId={order.id} currentStatus={order.status} currentTracking={order.tracking_number} currentPayment={order.payment_status} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Info Pembayaran</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Metode</span>
                <span className="font-medium capitalize">{order.payment_method?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status === 'paid' ? '✓ Dibayar' : '⏳ Belum Bayar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
