import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
            Tambah Produk Baru
          </h1>
          <p className="text-gray-500 text-sm">Isi semua informasi produk dengan lengkap</p>
        </div>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  )
}
