'use client'

import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shop/Navbar'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const PROVINCES = [
  'Aceh', 'Bali', 'Banten', 'Bengkulu', 'DI Yogyakarta', 'DKI Jakarta',
  'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur',
  'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 'Kalimantan Utara',
  'Kepulauan Bangka Belitung', 'Kepulauan Riau', 'Lampung', 'Maluku', 'Maluku Utara',
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat',
  'Riau', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Utara',
  'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, discountCode, discountAmount, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    city: '', province: '', postal_code: '',
    payment_method: 'transfer_bank', notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = totalPrice()
  const shipping = subtotal >= 100000 ? 0 : 15000
  const total = subtotal - discountAmount + shipping

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nama wajib diisi'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email tidak valid'
    if (!form.phone.trim()) e.phone = 'No. telepon wajib diisi'
    if (!form.address.trim()) e.address = 'Alamat wajib diisi'
    if (!form.city.trim()) e.city = 'Kota wajib diisi'
    if (!form.province) e.province = 'Provinsi wajib dipilih'
    if (!form.postal_code.trim()) e.postal_code = 'Kode pos wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (items.length === 0) return

    setLoading(true)
    const supabase = createClient()

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          guest_email: form.email,
          guest_name: form.name,
          status: 'pending',
          total_amount: total,
          discount_code: discountCode,
          discount_amount: discountAmount,
          shipping_cost: shipping,
          shipping_address: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            province: form.province,
            postal_code: form.postal_code,
          },
          payment_method: form.payment_method,
          notes: form.notes,
        })
        .select('id')
        .single()

      if (orderError || !order) throw new Error('Gagal membuat pesanan')

      // Create order items
      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || null,
        quantity,
        price_at_time: product.discount_price ?? product.price,
        subtotal: (product.discount_price ?? product.price) * quantity,
      }))

      await supabase.from('order_items').insert(orderItems)

      // Update discount code usage
      if (discountCode) {
        await supabase.rpc('increment_discount_usage', { code: discountCode })
      }

      clearCart()
      setSuccess(order.id)
    } catch (err) {
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              Pesanan Berhasil! 🎉
            </h2>
            <p className="text-gray-500 mb-2">ID Pesanan:</p>
            <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono text-gray-700 block mb-6">
              {success}
            </code>
            <p className="text-sm text-gray-500 mb-8">
              Konfirmasi pesanan dikirimkan ke email Anda. Tim kami akan segera memproses pesanan Anda.
            </p>
            <div className="flex gap-3">
              <Link href={`/orders/${success}`} className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm">
                Lacak Pesanan
              </Link>
              <Link href="/" className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-gray-500 mb-4">Keranjang kosong</p>
          <Link href="/shop" className="text-orange-500 font-semibold hover:underline">Mulai Belanja</Link>
        </div>
      </div>
    )
  }

  const inputClass = (field: string) =>
    `w-full border ${errors[field] ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Fraunces, serif' }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Informasi Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap *</label>
                  <input className={inputClass('name')} value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">No. Telepon *</label>
                  <input className={inputClass('phone')} value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                  <input className={inputClass('email')} type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@contoh.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Alamat Pengiriman</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alamat Lengkap *</label>
                  <textarea className={inputClass('address')} rows={3} value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Nama jalan, no. rumah, RT/RW, kelurahan, kecamatan" />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kota *</label>
                    <input className={inputClass('city')} value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Kota" />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Provinsi *</label>
                    <div className="relative">
                      <select className={`${inputClass('province')} appearance-none pr-10`} value={form.province}
                        onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>
                        <option value="">Pilih Provinsi</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode Pos *</label>
                    <input className={inputClass('postal_code')} value={form.postal_code}
                      onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="12345" />
                    {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Metode Pembayaran</h3>
              <div className="space-y-2">
                {[
                  { value: 'transfer_bank', label: '🏦 Transfer Bank', sub: 'BCA, Mandiri, BNI, BRI' },
                  { value: 'cod', label: '💵 COD (Bayar di Tempat)', sub: 'Bayar saat barang tiba' },
                  { value: 'ewallet', label: '📱 E-Wallet', sub: 'GoPay, OVO, Dana, ShopeePay' },
                ].map((opt) => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.payment_method === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <input type="radio" name="payment" value={opt.value} checked={form.payment_method === opt.value}
                      onChange={() => setForm(f => ({ ...f, payment_method: opt.value }))}
                      className="accent-orange-500" />
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Catatan (Opsional)</h3>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Instruksi khusus untuk pengiriman..." />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Ringkasan ({items.length} item)</h3>

              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                {items.map(({ product, quantity }) => {
                  const price = product.discount_price ?? product.price
                  return (
                    <div key={product.id} className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.startsWith('http') ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{quantity}x {formatPrice(price)}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPrice(price * quantity)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkir</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'GRATIS' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : 'Buat Pesanan'}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                Dengan menekan tombol di atas, kamu menyetujui syarat & ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
