export type Category = {
  id: string
  name: string
  slug: string
  image_url?: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  discount_price?: number
  stock: number
  category_id?: string
  categories?: Category
  images: string[]
  is_active: boolean
  is_featured: boolean
  is_flash_sale: boolean
  flash_sale_ends_at?: string
  created_at: string
  updated_at: string
}

export type DiscountCode = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_purchase: number
  valid_from: string
  valid_until?: string
  usage_limit?: number
  usage_count: number
  is_active: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export type ShippingAddress = {
  name: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
}

export type Order = {
  id: string
  user_id?: string
  guest_email?: string
  guest_name?: string
  status: OrderStatus
  total_amount: number
  discount_code?: string
  discount_amount: number
  shipping_cost: number
  shipping_address: ShippingAddress
  payment_method?: string
  payment_status: PaymentStatus
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_image?: string
  quantity: number
  price_at_time: number
  subtotal: number
}

export type CartItem = {
  product: Product
  quantity: number
}

export type SiteSettings = {
  hero_banner: {
    title: string
    subtitle: string
    image_url: string
    cta_text: string
    cta_link: string
  }
  store_name: string
  store_logo: string
  whatsapp_number: string
  promo_banner: {
    text: string
    is_active: boolean
  }
}
