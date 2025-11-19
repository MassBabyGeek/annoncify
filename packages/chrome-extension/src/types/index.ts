/**
 * Core types for Annoncify Chrome Extension
 */

// ========================================
// PLATFORM TYPES
// ========================================

export type PlatformName = 'vinted' | 'leboncoin' | 'facebook' | 'ebay' | 'etsy'

export interface Platform {
  name: PlatformName
  displayName: string
  baseUrl: string
  enabled: boolean
}

// ========================================
// AD/LISTING TYPES
// ========================================

export interface PlatformCustomFields {
  categoryId: string
  fields: Record<string, any>
}

export interface AdPayload {
  title: string
  description: string
  price: number
  currency: string
  category: string
  subcategory?: string
  leboncoinCategory?: string // LeBonCoin category ID for automatic navigation (backward compatibility)
  condition?: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
  location: {
    city: string
    zipCode: string
    country: string
  }
  images: string[] // URLs or base64
  shipping?: {
    available: boolean
    price?: number
    methods?: string[]
  }
  metadata?: Record<string, any> // Platform-specific fields (backward compatibility)
  customFields?: Record<string, PlatformCustomFields> // Platform-specific fields by platform { LEBONCOIN: { categoryId, fields }, ... }
}

export interface AdStats {
  id: string
  platform: PlatformName
  views: number
  favorites: number
  messages: number
  lastUpdated: Date
  status: 'active' | 'sold' | 'expired' | 'draft'
}

// ========================================
// MESSAGE TYPES
// ========================================

export interface Message {
  id: string
  threadId: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  timestamp: Date
  read: boolean
}

export interface MessageThread {
  id: string
  platform: PlatformName
  adId: string
  adTitle: string
  participant: {
    id: string
    name: string
    avatar?: string
  }
  messages: Message[]
  unreadCount: number
  lastMessage: Message
}

// ========================================
// ADAPTER INTERFACE
// ========================================

export interface PlatformAdapter {
  /**
   * Detect if current page is this platform
   */
  detect(): boolean

  /**
   * Get platform name
   */
  getPlatformName(): PlatformName

  /**
   * Create a new ad
   */
  createAd(data: AdPayload): Promise<{ success: boolean; adId?: string; error?: string }>

  /**
   * Edit an existing ad
   */
  editAd(id: string, data: Partial<AdPayload>): Promise<{ success: boolean; error?: string }>

  /**
   * Delete an ad
   */
  deleteAd(id: string): Promise<{ success: boolean; error?: string }>

  /**
   * Republish/bump an ad
   */
  republishAd(id: string): Promise<{ success: boolean; error?: string }>

  /**
   * Fetch stats for an ad
   */
  fetchStats(id: string): Promise<AdStats>

  /**
   * Fetch all message threads
   */
  fetchMessages(): Promise<MessageThread[]>

  /**
   * Send a message in a thread
   */
  sendMessage(threadId: string, message: string): Promise<{ success: boolean; error?: string }>

  /**
   * Mark messages as read
   */
  markAsRead(threadId: string): Promise<{ success: boolean; error?: string }>
}

// ========================================
// MESSAGING TYPES (Chrome Runtime)
// ========================================

export type MessageAction =
  | 'CREATE_AD'
  | 'EDIT_AD'
  | 'DELETE_AD'
  | 'REPUBLISH_AD'
  | 'FETCH_STATS'
  | 'FETCH_MESSAGES'
  | 'SEND_MESSAGE'
  | 'SYNC_TO_SERVER'
  | 'GET_ACTIVE_PLATFORM'

export interface ChromeMessage<T = any> {
  action: MessageAction
  payload: T
  timestamp: number
  requestId: string
}

export interface ChromeMessageResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  requestId: string
}

// ========================================
// TASK TYPES (for background queue)
// ========================================

export type TaskType = 'create_ad' | 'edit_ad' | 'delete_ad' | 'fetch_stats' | 'send_message'

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Task {
  id: string
  type: TaskType
  platform: PlatformName
  payload: any
  status: TaskStatus
  progress: number // 0-100
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  retryCount: number
}

// ========================================
// STORAGE TYPES
// ========================================

export interface ExtensionSettings {
  apiUrl: string // Next.js API endpoint
  apiKey?: string
  autoSync: boolean
  syncInterval: number // minutes
  notifications: boolean
}

export interface StorageData {
  settings: ExtensionSettings
  tasks: Task[]
  lastSync: Date | null
}

// ========================================
// NEXTJS API TYPES
// ========================================

export interface SyncPayload {
  stats: AdStats[]
  messages: MessageThread[]
  timestamp: Date
}

export interface ServerCommand {
  type: 'create_ad' | 'edit_ad' | 'delete_ad'
  platform: PlatformName
  data: AdPayload | Partial<AdPayload>
  adId?: string
}
