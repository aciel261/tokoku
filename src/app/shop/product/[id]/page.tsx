import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shop/Navbar'
import ProductDetailClient from '@/components/shop/ProductDetailClient'
import ProductCard from '@/components/shop/ProductCard'
import { notFound } from 'next/navigation'
import { Product } from '@/types'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const { data: related } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .eq('category_id', product.category_id)
    .neq('id', id)
    .limit(4)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductDetailClient product={product} />

        {related && related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
              Produk Serupa
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
