import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) notFound()

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            Edit Produk
          </h1>
          <p className="text-gray-500 text-sm line-clamp-1">{product.name}</p>
        </div>
      </div>
      <ProductForm product={product} categories={categories || []} />
    </div>
  )
}
