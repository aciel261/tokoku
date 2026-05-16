'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newName, setNewName] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const addCategory = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const supabase = createClient()
    const slug = slugify(newName)
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newName.trim(), slug, image_url: newImageUrl || null })
      .select()
      .single()

    if (data) setCategories(prev => [...prev, data])
    setNewName('')
    setNewImageUrl('')
    setAdding(false)
    router.refresh()
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setEditName(cat.name)
  }

  const saveEdit = async (cat: Category) => {
    if (!editName.trim()) return
    setLoading(cat.id)
    const supabase = createClient()
    const slug = slugify(editName)
    await supabase.from('categories').update({ name: editName.trim(), slug }).eq('id', cat.id)
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: editName.trim(), slug } : c))
    setEditId(null)
    setLoading(null)
    router.refresh()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini? Produk terkait tidak akan dihapus.')) return
    setLoading(id)
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Category */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
        <h3 className="font-bold text-gray-900 mb-4">Tambah Kategori Baru</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Kategori *</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="Contoh: Elektronik, Fashion..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {newName && (
              <p className="text-xs text-gray-400 mt-1">
                Slug: <code className="bg-gray-100 px-1 rounded">{slugify(newName)}</code>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Gambar (opsional)</label>
            <input
              type="url"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={addCategory}
            disabled={adding || !newName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {adding ? 'Menambahkan...' : 'Tambah Kategori'}
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Daftar Kategori ({categories.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Belum ada kategori</p>
          ) : categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover rounded-lg" />
                ) : '📦'}
              </div>

              {editId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat); if (e.key === 'Escape') setEditId(null) }}
                    className="flex-1 border border-orange-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button onClick={() => saveEdit(cat)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg">
                    {loading === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} disabled={loading === cat.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      {loading === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
