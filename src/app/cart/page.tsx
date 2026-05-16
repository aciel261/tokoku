'use client'

import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/shop/Navbar'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, discountCode, discountAmount, applyDiscount, removeDiscount } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const subtotal = totalPrice()
  const shipping = subtotal >= 100000 ? 0 : 15000
  const total = subtotal - discountAmount + shipping

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const supabase = createClient()
    const { data: code } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', couponInput.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (!code) {
      setCouponError('Kode kupon tidak valid atau sudah kadaluarsa')
      setCouponLoading(false)
      return
    }

    if (code.valid_until && new Date(code.valid_until) < new Date()) {
      setCouponError('Kode kupon sudah kadaluarsa')
      setCouponLoading(false)
      return
    }

    if (code.usage_limit && code.usage_count >= code.usage_limit) {
      setCouponError('Kuota kupon sudah habis')
      setCouponLoading(false)
      return
    }

    if (subtotal < code.min_purchase) {
      setCouponError(`Minimum pembelian ${formatPrice(code.min_purchase)} untuk kupon ini`)
      setCouponLoading(false)
      return
    }

    const discountAmt = code.type === 'percentage'
      ? (subtotal * code.value) / 100
      : code.value

    applyDiscount(code.code, discountAmt)
    setCouponLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <ShoppingBag className="w-20 h-20 text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
            Keranjang Kosong
          </h2>
          <p className="text-gray-500 mb-8">Tambahkan produk ke keranjang untuk mulai berbelanja</p>
          <Link href="/shop" className="bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-600 transition-colors">
            Mulai Belanja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Fraunces, serif' }}>
          Keranjang Belanja
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => {
              const price = product.discount_price ?? product.price
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {product.images?.[0]?.startsWith('http') ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
                    <p className="font-bold text-orange-500">{formatPrice(price)}</p>
                    {product.discount_price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(price * quantity)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-5">Ringkasan Pesanan</h3>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({items.length} produk)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon ({discountCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                {discountCode ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
                    <span className="text-sm text-green-700 font-medium">🎉 Kupon {discountCode} aktif</span>
                    <button onClick={removeDiscount} className="text-xs text-green-600 hover:underline">Hapus</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Kode voucher"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        Pakai
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                  </div>
                )}
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              {shipping > 0 && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  Tambah {formatPrice(100000 - subtotal)} lagi untuk gratis ongkir
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
