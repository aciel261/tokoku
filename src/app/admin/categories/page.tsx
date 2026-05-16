import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/admin/CategoryManager'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Kategori</h1>
        <p className="text-gray-500 text-sm">{categories?.length || 0} kategori aktif</p>
      </div>
      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
