import { createClient } from '@/lib/supabase/server'
import DiscountManager from '@/components/admin/DiscountManager'

export default async function AdminDiscountsPage() {
  const supabase = await createClient()
  const { data: codes } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Diskon & Kupon</h1>
        <p className="text-gray-500 text-sm">Kelola kode promo dan diskon toko</p>
      </div>
      <DiscountManager initialCodes={codes || []} />
    </div>
  )
}
