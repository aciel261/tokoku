import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { Eye } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, order_items(id)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: orders } = await query

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            Pesanan
          </h1>
          <p className="text-gray-500 text-sm">{orders?.length || 0} pesanan</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <Link
            key={f.value}
            href={f.value ? `/admin/orders?status=${f.value}` : '/admin/orders'}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              status === f.value || (!status && !f.value)
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">ID Pesanan</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Pelanggan</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Pembayaran</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tanggal</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders && orders.length > 0 ? orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                      {order.id.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{order.guest_name || 'Guest'}</p>
                    <p className="text-xs text-gray-400">{order.guest_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                    <p className="text-xs text-gray-400">{order.order_items?.length} item</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.payment_status === 'paid'
                        ? 'bg-green-50 text-green-600'
                        : order.payment_status === 'refunded'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {order.payment_status === 'paid' ? 'Dibayar' : order.payment_status === 'refunded' ? 'Refund' : 'Belum Bayar'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50 inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                    Tidak ada pesanan ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
