import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Edit, Eye, Package } from 'lucide-react'
import AdminProductActions from '@/components/admin/AdminProductActions'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Produk</h1>
          <p className="text-gray-500 text-sm">{products?.length || 0} produk</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Produk</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Kategori</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Harga</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Stok</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products && products.length > 0 ? products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.startsWith('http') ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {product.is_featured && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">Unggulan</span>}
                          {product.is_flash_sale && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">⚡ Flash</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{product.categories?.name || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(product.discount_price ?? product.price)}</p>
                      {product.discount_price && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      product.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/shop/product/${product.id}`} target="_blank"
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <AdminProductActions productId={product.id} isActive={product.is_active} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                    <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    Belum ada produk. <Link href="/admin/products/new" className="text-orange-500 hover:underline">Tambah sekarang</Link>
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
