'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@/types'

interface ShopFiltersProps {
  categories: Category[]
  currentParams: Record<string, string | undefined>
}

export default function ShopFilters({ categories, currentParams }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePriceFilter = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('min_price', min)
    params.set('max_price', max)
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => router.push('/shop')

  const priceRanges = [
    { label: 'Di bawah Rp50.000', min: '0', max: '50000' },
    { label: 'Rp50.000 - Rp200.000', min: '50000', max: '200000' },
    { label: 'Rp200.000 - Rp500.000', min: '200000', max: '500000' },
    { label: 'Di atas Rp500.000', min: '500000', max: '99999999' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Filter</h3>
          {(currentParams.category || currentParams.min_price || currentParams.flash_sale) && (
            <button onClick={clearFilters} className="text-xs text-orange-500 hover:underline">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Kategori */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Kategori</h4>
        <div className="space-y-1">
          <Link
            href="/shop"
            className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
              !currentParams.category
                ? 'bg-orange-50 text-orange-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua Kategori
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                currentParams.category === cat.slug
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Harga */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Rentang Harga</h4>
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handlePriceFilter(range.min, range.max)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                currentParams.min_price === range.min && currentParams.max_price === range.max
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flash Sale */}
      <div>
        <Link
          href="/shop?flash_sale=true"
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentParams.flash_sale === 'true'
              ? 'bg-amber-50 text-amber-700'
              : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
          }`}
        >
          <span>⚡</span> Flash Sale Hari Ini
        </Link>
      </div>
    </div>
  )
}
