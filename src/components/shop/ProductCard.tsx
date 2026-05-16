'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Zap } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, discountPercentage } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const discount = product.discount_price
    ? discountPercentage(product.price, product.discount_price)
    : 0

  const displayImage = product.images?.[0] || '/placeholder-product.jpg'
  const isOutOfStock = product.stock === 0

  return (
    <Link href={`/shop/product/${product.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {displayImage.startsWith('http') ? (
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_flash_sale && (
              <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> Flash
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
                Habis
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView?.(product) }}
              className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-xs font-medium text-gray-600"
              title="Quick view"
            >
              👁
            </button>
            <button
              onClick={(e) => { e.preventDefault() }}
              className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-orange-500 font-medium mb-0.5">
            {product.categories?.name || 'Produk'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-end gap-1.5 mb-3">
            <span className="font-bold text-gray-900">
              {formatPrice(product.discount_price ?? product.price)}
            </span>
            {product.discount_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? 'Ditambahkan!' : isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </Link>
  )
}
