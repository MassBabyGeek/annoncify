import type { PlatformAdapter, PlatformName } from '../types'
import { VintedAdapter } from './vinted'
import { LeBonCoinAdapter } from './leboncoin'

/**
 * Platform Adapter Registry
 * Manages all available platform adapters
 */
export class PlatformRegistry {
  private adapters: Map<PlatformName, PlatformAdapter> = new Map()
  private currentAdapter: PlatformAdapter | null = null

  constructor() {
    // Register all adapters
    this.register(new VintedAdapter())
    this.register(new LeBonCoinAdapter())
    // Future platforms:
    // this.register(new FacebookMarketplaceAdapter())
    // this.register(new EbayAdapter())
    // this.register(new EtsyAdapter())
  }

  /**
   * Register a platform adapter
   */
  private register(adapter: PlatformAdapter) {
    this.adapters.set(adapter.getPlatformName(), adapter)
  }

  /**
   * Detect current platform and return appropriate adapter
   */
  detectPlatform(): PlatformAdapter | null {
    for (const adapter of this.adapters.values()) {
      if (adapter.detect()) {
        this.currentAdapter = adapter
        return adapter
      }
    }
    return null
  }

  /**
   * Get adapter for specific platform
   */
  getAdapter(platform: PlatformName): PlatformAdapter | null {
    return this.adapters.get(platform) || null
  }

  /**
   * Get current active adapter
   */
  getCurrentAdapter(): PlatformAdapter | null {
    return this.currentAdapter
  }

  /**
   * Get all registered platforms
   */
  getAllPlatforms(): PlatformName[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * Check if a platform is supported
   */
  isPlatformSupported(platform: PlatformName): boolean {
    return this.adapters.has(platform)
  }
}

// Singleton instance
export const platformRegistry = new PlatformRegistry()
