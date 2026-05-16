'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Search, User, Menu, X, Heart, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Fraunces, serif' }}>
                TokoKu
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/shop" className={`text-sm font-medium transition-colors ${
                pathname === '/shop' ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
              }`}>Produk</Link>
              <Link href="/shop?category=promo" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                Promo 🔥
              </Link>
            </div>

            {/* Search Bar Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              <Link href="/orders" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Package className="w-5 h-5 text-gray-600" />
              </Link>

              <Link href="/auth/login" className="hidden md:flex p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </Link>

              <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-1">
              <Link href="/shop" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">
                Semua Produk
              </Link>
              <Link href="/shop?flash_sale=true" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-orange-500">
                Flash Sale 🔥
              </Link>
              <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">
                <Package className="w-4 h-4" /> Pesanan Saya
              </Link>
              <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">
                <User className="w-4 h-4" /> Login / Daftar
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16" />
    </>
  )
}
