import type { PlatformType, PlatformProduct, PlatformOrder, SyncResult } from "@/lib/api/types"

/**
 * Base class for platform integrations
 * Each platform (Etsy, Medusa, Aukro) will extend this
 */
export abstract class BasePlatformAdapter {
  protected platform: PlatformType
  protected apiKey?: string
  protected apiSecret?: string

  constructor(platform: PlatformType, config?: { apiKey?: string; apiSecret?: string }) {
    this.platform = platform
    this.apiKey = config?.apiKey
    this.apiSecret = config?.apiSecret
  }

  /**
   * List products from platform
   */
  abstract listProducts(): Promise<PlatformProduct[]>

  /**
   * Get single product from platform
   */
  abstract getProduct(platformProductId: string): Promise<PlatformProduct | null>

  /**
   * Create product on platform
   */
  abstract createProduct(product: PlatformProduct): Promise<{ id: string; url?: string }>

  /**
   * Update product on platform
   */
  abstract updateProduct(platformProductId: string, updates: Partial<PlatformProduct>): Promise<boolean>

  /**
   * Delete/delist product from platform
   */
  abstract deleteProduct(platformProductId: string): Promise<boolean>

  /**
   * Sync orders from platform
   */
  abstract syncOrders(): Promise<PlatformOrder[]>

  /**
   * Verify webhook signature (if platform supports webhooks)
   */
  abstract verifyWebhook(payload: any, signature?: string): boolean

  /**
   * Handle webhook payload
   */
  abstract handleWebhook(payload: any): Promise<void>

  /**
   * Perform full sync of products and orders
   */
  async fullSync(): Promise<SyncResult> {
    try {
      const products = await this.listProducts()
      const orders = await this.syncOrders()

      return {
        platform: this.platform,
        success: true,
        products_synced: products.length,
        orders_synced: orders.length,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        platform: this.platform,
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        timestamp: new Date().toISOString(),
      }
    }
  }
}
