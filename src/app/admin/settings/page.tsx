import { createClient } from '@/lib/supabase/server'
import SiteSettingsForm from '@/components/admin/SiteSettingsForm'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('key, value')

  const settingsMap = Object.fromEntries(
    (settings || []).map((s: any) => [s.key, s.value])
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
          Pengaturan Toko
        </h1>
        <p className="text-gray-500 text-sm">Kelola tampilan dan konten halaman depan toko</p>
      </div>
      <SiteSettingsForm initialSettings={settingsMap} />
    </div>
  )
}
