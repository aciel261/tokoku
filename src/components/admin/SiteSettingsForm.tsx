'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface SiteSettingsFormProps {
  initialSettings: Record<string, any>
}

export default function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Hero Banner
  const [hero, setHero] = useState({
    title: initialSettings?.hero_banner?.title || 'Belanja Mudah, Harga Terbaik',
    subtitle: initialSettings?.hero_banner?.subtitle || 'Temukan ribuan produk pilihan',
    image_url: initialSettings?.hero_banner?.image_url || '',
    cta_text: initialSettings?.hero_banner?.cta_text || 'Belanja Sekarang',
    cta_link: initialSettings?.hero_banner?.cta_link || '/shop',
  })

  // Store Info
  const [storeName, setStoreName] = useState(initialSettings?.store_name || 'TokoKu')
  const [storeLogo, setStoreLogo] = useState(initialSettings?.store_logo || '')
  const [whatsapp, setWhatsapp] = useState(initialSettings?.whatsapp_number || '')

  // Promo Banner
  const [promo, setPromo] = useState({
    text: initialSettings?.promo_banner?.text || '🎉 Gratis Ongkir untuk pembelian di atas Rp 100.000',
    is_active: initialSettings?.promo_banner?.is_active ?? true,
  })

  const saveAll = async () => {
    setSaving(true)
    const supabase = createClient()

    const updates = [
      { key: 'hero_banner', value: hero },
      { key: 'store_name', value: storeName },
      { key: 'store_logo', value: storeLogo },
      { key: 'whatsapp_number', value: whatsapp },
      { key: 'promo_banner', value: promo },
    ]

    await Promise.all(
      updates.map(({ key, value }) =>
        supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
      )
    )

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all'

  return (
    <div className="space-y-6">
      {/* Top Save Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-sm text-gray-600">
          Perubahan akan langsung terlihat di halaman toko setelah disimpan
        </p>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200">
            <Eye className="w-4 h-4" /> Preview Toko
          </Link>
          <button
            onClick={saveAll}
            disabled={saving}
            className={`flex items-center gap-2 font-semibold px-5 py-2 rounded-xl text-sm transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan!' : 'Simpan Semua'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-lg">🖼️</div>
            <div>
              <h3 className="font-bold text-gray-900">Hero Banner</h3>
              <p className="text-xs text-gray-500">Bagian utama halaman depan</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Judul Utama</label>
              <input className={inputCls} value={hero.title}
                onChange={e => setHero(h => ({ ...h, title: e.target.value }))}
                placeholder="Belanja Mudah, Harga Terbaik" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subjudul</label>
              <textarea className={`${inputCls} resize-none`} rows={2} value={hero.subtitle}
                onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))}
                placeholder="Deskripsi singkat toko..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Gambar Banner</label>
              <input className={inputCls} value={hero.image_url}
                onChange={e => setHero(h => ({ ...h, image_url: e.target.value }))}
                placeholder="https://... (kosongkan untuk background default)" />
              {hero.image_url && (
                <img src={hero.image_url} alt="preview" className="mt-2 w-full h-24 object-cover rounded-xl" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teks Tombol</label>
                <input className={inputCls} value={hero.cta_text}
                  onChange={e => setHero(h => ({ ...h, cta_text: e.target.value }))}
                  placeholder="Belanja Sekarang" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link Tombol</label>
                <input className={inputCls} value={hero.cta_link}
                  onChange={e => setHero(h => ({ ...h, cta_link: e.target.value }))}
                  placeholder="/shop" />
              </div>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🏪</div>
              <div>
                <h3 className="font-bold text-gray-900">Identitas Toko</h3>
                <p className="text-xs text-gray-500">Nama dan logo toko</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Toko</label>
                <input className={inputCls} value={storeName}
                  onChange={e => setStoreName(e.target.value)} placeholder="TokoKu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Logo</label>
                <input className={inputCls} value={storeLogo}
                  onChange={e => setStoreLogo(e.target.value)} placeholder="https://..." />
                {storeLogo && (
                  <img src={storeLogo} alt="logo" className="mt-2 h-12 object-contain" />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">No. WhatsApp (opsional)</label>
                <input className={inputCls} value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)} placeholder="628xxxxxxxxxx" />
                <p className="text-xs text-gray-400 mt-1">Format internasional, tanpa + (contoh: 6281234567890)</p>
              </div>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">📢</div>
              <div>
                <h3 className="font-bold text-gray-900">Banner Promosi</h3>
                <p className="text-xs text-gray-500">Bar notifikasi di atas halaman</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900">Tampilkan Banner</p>
                  <p className="text-xs text-gray-500">Banner orange di atas navbar</p>
                </div>
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors ${promo.is_active ? 'bg-orange-500' : 'bg-gray-300'}`}
                  onClick={() => setPromo(p => ({ ...p, is_active: !p.is_active }))}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${promo.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teks Banner</label>
                <input className={inputCls} value={promo.text}
                  onChange={e => setPromo(p => ({ ...p, text: e.target.value }))}
                  placeholder="🎉 Gratis Ongkir pembelian di atas Rp 100.000" />
              </div>
              {promo.is_active && (
                <div className="bg-orange-500 text-white text-xs text-center py-2 rounded-xl font-medium">
                  Preview: {promo.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pb-4">
        <button
          onClick={saveAll}
          disabled={saving}
          className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl text-sm transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : saved ? '✓ Semua Tersimpan!' : 'Simpan Semua Perubahan'}
        </button>
      </div>
    </div>
  )
}
