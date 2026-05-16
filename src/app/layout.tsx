import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toko Online - Belanja Mudah, Harga Terbaik',
  description: 'Platform e-commerce terpercaya dengan ribuan produk pilihan',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
