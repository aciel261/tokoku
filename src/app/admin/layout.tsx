import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, Image, LogOut, Layers } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Produk' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
  { href: '/admin/categories', icon: Layers, label: 'Kategori' },
  { href: '/admin/discounts', icon: Tag, label: 'Diskon & Kupon' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan Toko' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'Fraunces, serif' }}>TokoKu</span>
              <span className="text-gray-500 text-xs block -mt-0.5">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium group"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Lihat Toko
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
