/**
 * Common types for API responses and platform integrations
 */

export type PlatformType = "etsy" | "medusa" | "aukro" | "other"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PlatformProduct {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  status: string
  platform_id?: string
  platform_url?: string
}

export interface PlatformOrder {
  id: string
  product_id: string
  platform_order_id: string
  buyer_name: string
  buyer_email: string
  sale_price: number
  platform_fees: number
  status: string
  order_date: string
}

export interface SyncResult {
  platform: PlatformType
  success: boolean
  products_synced?: number
  orders_synced?: number
  errors?: string[]
  timestamp: string
}

export interface WebhookPayload {
  platform: PlatformType
  event_type: string
  data: any
  timestamp: string
  signature?: string
}
