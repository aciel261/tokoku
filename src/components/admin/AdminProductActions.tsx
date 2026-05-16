'use client'

import { useState } from 'react'
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminProductActions({
  productId,
  isActive,
}: {
  productId: string
  isActive: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleActive = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').update({ is_active: !isActive }).eq('id', productId)
    router.refresh()
    setLoading(false)
  }

  const deleteProduct = async () => {
    if (!confirm('Hapus produk ini? Tindakan tidak bisa dibatalkan.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={toggleActive}
        disabled={loading}
        className={`p-1.5 rounded-lg transition-colors ${
          isActive
            ? 'text-green-500 hover:bg-green-50'
            : 'text-gray-400 hover:bg-gray-50'
        }`}
        title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
      >
        {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
      </button>
      <button
        onClick={deleteProduct}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  )
}
