'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category, Product } from '@/types'
import { Loader2, Plus, X, Upload } from 'lucide-react'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    discount_price: product?.discount_price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    category_id: product?.category_id || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_flash_sale: product?.is_flash_sale ?? false,
    flash_sale_ends_at: product?.flash_sale_ends_at?.slice(0, 16) || '',
  })
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Harga tidak valid'
    if (form.discount_price && (isNaN(Number(form.discount_price)) || Number(form.discount_price) >= Number(form.price))) {
      e.discount_price = 'Harga diskon harus lebih kecil dari harga normal'
    }
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Stok tidak valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const addImageUrl = () => {
    const trimmed = imageUrl.trim()
    if (trimmed && !images.includes(trimmed)) {
      setImages([...images, trimmed])
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const supabase = createClient()
    const fileName = `products/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`

    const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (data) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      setImages(prev => [...prev, urlData.publicUrl])
    } else {
      alert('Gagal upload gambar. Pastikan bucket "product-images" sudah dibuat di Supabase Storage.')
    }
    setUploadingImage(false)
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      images,
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_flash_sale: form.is_flash_sale,
      flash_sale_ends_at: form.flash_sale_ends_at
        ? new Date(form.flash_sale_ends_at).toISOString()
        : null,
    }

    if (isEdit) {
      await supabase.from('products').update(payload).eq('id', product.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    router.push('/admin/products')
    router.refresh()
    setLoading(false)
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full border ${errors[key] ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Informasi Produk</h3>
            <div className="space-y-4">
              {field('Nama Produk *', 'name', 'text', 'Masukkan nama produk...')}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={5}
                  placeholder="Deskripsikan produk Anda..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Harga & Stok</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field('Harga Normal (Rp) *', 'price', 'number', '0')}
              {field('Harga Diskon (Rp)', 'discount_price', 'number', 'Kosongkan jika tidak ada')}
              {field('Stok *', 'stock', 'number', '0')}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Foto Produk</h3>

            {/* Upload file */}
            <label className="flex items-center gap-3 w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 mb-3 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">
                {uploadingImage ? 'Mengupload...' : 'Upload gambar dari komputer'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>

            {/* URL Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                placeholder="Atau paste URL gambar..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={addImageUrl}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        Utama
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Gambar pertama akan menjadi foto utama produk</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Status & Visibilitas</h3>
            <div className="space-y-3">
              {[
                { key: 'is_active' as const, label: 'Produk Aktif', sub: 'Tampil di toko' },
                { key: 'is_featured' as const, label: 'Produk Unggulan', sub: 'Tampil di halaman utama' },
                { key: 'is_flash_sale' as const, label: 'Flash Sale ⚡', sub: 'Tandai sebagai flash sale' },
              ].map(({ key, label, sub }) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${form[key] ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </label>
              ))}

              {form.is_flash_sale && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Flash Sale Berakhir</label>
                  <input
                    type="datetime-local"
                    value={form.flash_sale_ends_at}
                    onChange={e => setForm(f => ({ ...f, flash_sale_ends_at: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Kategori</h3>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Pilih Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              Belum ada kategori?{' '}
              <a href="/admin/categories" className="text-orange-500 hover:underline">Tambah di sini</a>
            </p>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
            <a href="/admin/products"
              className="w-full text-center py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Batal
            </a>
          </div>
        </div>
      </div>
    </form>
  )
}
