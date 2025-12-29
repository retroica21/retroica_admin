import { EtsyAdapter } from "./etsy"
import { MedusaAdapter } from "./medusa"
import { AukroAdapter } from "./aukro"
import type { BasePlatformAdapter } from "./base"
import type { PlatformType } from "@/lib/api/types"

/**
 * Factory to create platform adapters with proper configuration
 */
export class PlatformFactory {
  static createAdapter(platform: PlatformType): BasePlatformAdapter {
    switch (platform) {
      case "etsy":
        return new EtsyAdapter(process.env.ETSY_API_KEY)

      case "medusa":
        return new MedusaAdapter(process.env.MEDUSA_API_URL || "", process.env.MEDUSA_API_KEY)

      case "aukro":
        return new AukroAdapter(process.env.AUKRO_API_KEY, process.env.AUKRO_API_SECRET)

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  static getAllAdapters(): BasePlatformAdapter[] {
    return [
      PlatformFactory.createAdapter("etsy"),
      PlatformFactory.createAdapter("medusa"),
      PlatformFactory.createAdapter("aukro"),
    ]
  }
}
