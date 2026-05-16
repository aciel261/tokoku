import { createClient } from '@/lib/supabase/server'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { ShoppingBag, Package, TrendingUp, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalOrders },
    { count: totalProducts },
    { data: recentOrders },
    { data: stats },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total_amount, status'),
  ])

  const revenue = (stats || []).filter((o: any) => o.status !== 'cancelled')
    .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount), 0)
  const pendingOrders = (stats || []).filter((o: any) => o.status === 'pending').length

  const statCards = [
    { label: 'Total Pendapatan', value: formatPrice(revenue), icon: TrendingUp, color: 'bg-green-500', change: '+12%' },
    { label: 'Total Pesanan', value: totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-500', change: `${pendingOrders} pending` },
    { label: 'Produk Aktif', value: totalProducts || 0, icon: Package, color: 'bg-orange-500', change: 'Update produk' },
    { label: 'Perlu Diproses', value: pendingOrders, icon: Users, color: 'bg-purple-500', change: 'Segera proses' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Selamat datang di panel admin TokoKu</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{card.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-sm text-orange-500 font-medium flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {recentOrders && recentOrders.length > 0 ? recentOrders.map((order: any) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {order.guest_name || 'Pelanggan'}
                </p>
                <p className="text-xs text-gray-500 font-mono">{order.id.slice(0, 16)}...</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                <p className="text-xs text-gray-400">{order.order_items?.length || 0} item</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </Link>
          )) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              Belum ada pesanan
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
