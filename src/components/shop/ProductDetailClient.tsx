'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ZoomIn, Truck, Shield, Zap } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, discountPercentage } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import Link from 'next/link'

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const images = product.images?.length > 0 ? product.images : ['']
  const discount = product.discount_price ? discountPercentage(product.price, product.discount_price) : 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-orange-500">Beranda</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-orange-500">Produk</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-orange-500">
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 group">
            {images[selectedImage]?.startsWith('http') ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightbox(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <span className="text-8xl">📦</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_flash_sale && (
                <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3" /> Flash Sale
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            <button
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 right-3 bg-white/90 rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow"
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow"
                  disabled={selectedImage === images.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-orange-500' : 'border-transparent'
                  }`}
                >
                  {img?.startsWith('http') ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">📦</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-orange-500 font-medium mb-1">{product.categories?.name}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-end gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.discount_price ?? product.price)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                  Hemat {formatPrice(product.price - product.discount_price)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `Stok: ${product.stock} tersisa` : 'Stok Habis'}
            </span>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Jumlah:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-50 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 hover:bg-gray-50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                added
                  ? 'bg-green-500 text-white'
                  : product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? '✓ Ditambahkan!' : 'Tambah ke Keranjang'}
            </button>
            <button className="p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {product.stock > 0 && (
            <Link
              href="/checkout"
              onClick={() => addItem(product, quantity)}
              className="block w-full text-center py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition-all mb-8"
            >
              Beli Sekarang
            </Link>
          )}

          {/* Trust */}
          <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
            {[
              { icon: <Truck className="w-4 h-4 text-orange-500" />, text: 'Pengiriman ke seluruh Indonesia' },
              { icon: <Shield className="w-4 h-4 text-orange-500" />, text: 'Pembayaran 100% aman & terproteksi' },
              { icon: '↩️', text: 'Garansi pengembalian produk 7 hari' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <span>{typeof item.icon === 'string' ? item.icon : item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  )
}
