import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shop/Navbar'
import ProductCard from '@/components/shop/ProductCard'
import ShopFilters from '@/components/shop/ShopFilters'
import { Product, Category } from '@/types'
import { Search } from 'lucide-react'

type SearchParams = {
  q?: string
  category?: string
  min_price?: string
  max_price?: string
  sort?: string
  flash_sale?: string
  featured?: string
  [key: string]: string | undefined
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }
  if (params.flash_sale === 'true') {
    query = query.eq('is_flash_sale', true)
  }
  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  }
  if (params.min_price) {
    query = query.gte('price', parseFloat(params.min_price))
  }
  if (params.max_price) {
    query = query.lte('price', parseFloat(params.max_price))
  }
  if (params.category) {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', params.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  switch (params.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query.limit(48)
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  const pageTitle = params.q
    ? `Hasil pencarian "${params.q}"`
    : params.flash_sale === 'true' ? '⚡ Flash Sale'
    : params.category ? categories?.find((c: Category) => c.slug === params.category)?.name || 'Produk'
    : 'Semua Produk'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <ShopFilters categories={categories || []} currentParams={params} />
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
                  {pageTitle}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {products?.length || 0} produk ditemukan
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden md:block">Urutkan:</span>
                <select
                  defaultValue={params.sort || 'newest'}
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('sort', e.target.value)
                    window.location.href = url.toString()
                  }}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="newest">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p: Product) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Produk tidak ditemukan</h3>
                <p className="text-gray-500">Coba kata kunci lain atau hapus filter</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
