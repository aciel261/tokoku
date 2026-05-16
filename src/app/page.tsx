import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/shop/Navbar'
import ProductCard from '@/components/shop/ProductCard'
import { Product, Category } from '@/types'
import { ArrowRight, Zap, Shield, Truck, Tag } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: settings } = await supabase.from('site_settings').select('key, value')
  const settingsMap = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]))
  const heroBanner = settingsMap?.hero_banner || {}
  const promoBanner = settingsMap?.promo_banner || {}

  const { data: featuredProducts } = await supabase
    .from('products').select('*, categories(name, slug)')
    .eq('is_active', true).eq('is_featured', true)
    .order('created_at', { ascending: false }).limit(8)

  const { data: flashSaleProducts } = await supabase
    .from('products').select('*, categories(name, slug)')
    .eq('is_active', true).eq('is_flash_sale', true)
    .order('created_at', { ascending: false }).limit(6)

  const { data: categories } = await supabase
    .from('categories').select('*').order('name').limit(8)

  const catEmojis: Record<string, string> = {
    elektronik: '📱', fashion: '👗', 'makanan-minuman': '🍜',
    kecantikan: '💄', olahraga: '⚽', rumah: '🏠', buku: '📚', mainan: '🧸'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {promoBanner?.is_active && (
        <div className="bg-orange-500 text-white text-center py-2.5 text-sm font-medium">
          {promoBanner.text || '🎉 Gratis Ongkir untuk pembelian di atas Rp 100.000'}
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              ✨ Belanja Lebih Mudah
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
              {heroBanner?.title || 'Belanja Mudah,\nHarga Terbaik'}
            </h1>
            <p className="text-white/80 text-lg mb-8">
              {heroBanner?.subtitle || 'Temukan ribuan produk pilihan dengan pengiriman cepat ke seluruh Indonesia'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={heroBanner?.cta_link || '/shop'}
                className="bg-white text-orange-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-orange-50 transition-all active:scale-95">
                {heroBanner?.cta_text || 'Belanja Sekarang'} →
              </Link>
              <Link href="/shop?flash_sale=true"
                className="bg-white/20 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Flash Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="w-5 h-5 text-orange-500" />, text: 'Gratis Ongkir', sub: 'Min. Rp100k' },
              { icon: <Shield className="w-5 h-5 text-orange-500" />, text: 'Pembayaran Aman', sub: '100% terproteksi' },
              { icon: <Tag className="w-5 h-5 text-orange-500" />, text: 'Harga Terbaik', sub: 'Dijamin murah' },
              { icon: <Zap className="w-5 h-5 text-orange-500" />, text: 'Flash Sale', sub: 'Diskon hingga 70%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Categories */}
        {categories && categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Kategori</h2>
              <Link href="/shop" className="text-sm text-orange-500 font-medium flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {categories.map((cat: Category) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex flex-col items-center gap-2 group">
                  <div className="w-full aspect-square bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-2xl group-hover:bg-orange-50 group-hover:border-orange-200 transition-all shadow-sm">
                    {catEmojis[cat.slug] || '📦'}
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Flash Sale */}
        {flashSaleProducts && flashSaleProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Flash Sale</h2>
                <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                  <Zap className="w-4 h-4" /> Hari Ini
                </span>
              </div>
              <Link href="/shop?flash_sale=true" className="text-sm text-orange-500 font-medium flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {flashSaleProducts.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Featured */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Produk Pilihan</h2>
              <Link href="/shop" className="text-sm text-orange-500 font-medium flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!featuredProducts || featuredProducts.length === 0) && (!flashSaleProducts || flashSaleProducts.length === 0) && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Toko Siap Dibuka!</h3>
            <p className="text-gray-500 mb-6">Tambahkan produk dari admin panel untuk mulai berjualan</p>
            <Link href="/admin" className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">
              Buka Admin Panel →
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-white text-lg" style={{ fontFamily: 'Fraunces, serif' }}>TokoKu</span>
              </div>
              <p className="text-sm leading-relaxed">Platform belanja online terpercaya.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Belanja</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Semua Produk</Link></li>
                <li><Link href="/shop?flash_sale=true" className="hover:text-orange-400 transition-colors">Flash Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Akun</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
                <li><Link href="/orders" className="hover:text-orange-400 transition-colors">Pesanan Saya</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Admin</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin" className="hover:text-orange-400 transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
            © 2026 TokoKu. Semua hak dilindungi.
          </div>
        </div>
      </footer>
    </div>
  )
}
