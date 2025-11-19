import browser from 'webextension-polyfill'
import { platformRegistry } from '../platforms/registry'
import type { ChromeMessage, ChromeMessageResponse } from '../types'

console.log('[Annoncify] Vinted content script loaded')

// Get Vinted adapter
const adapter = platformRegistry.getAdapter('vinted')

if (!adapter) {
  console.error('[Annoncify] Vinted adapter not found')
}

/**
 * Listen for messages from background script
 */
browser.runtime.onMessage.addListener((message: unknown): Promise<ChromeMessageResponse> => {
  return (async () => {
    // Vérifie que message est un objet ChromeMessage
    if (typeof message !== 'object' || message === null || !('action' in message)) {
      return {
        success: false,
        error: 'Invalid message format',
        requestId: 'unknown',
      } as ChromeMessageResponse
    }

    const msg = message as ChromeMessage<any>

    if (!adapter) {
      return {
        success: false,
        error: 'Adapter not available',
        requestId: msg.requestId,
      } as ChromeMessageResponse
    }

    try {
      switch (msg.action) {
        case 'CREATE_AD':
          const createResult = await adapter.createAd(msg.payload.data)
          return {
            success: createResult.success,
            data: createResult.adId ? { adId: createResult.adId } : undefined,
            error: createResult.error,
            requestId: msg.requestId
          } as ChromeMessageResponse

        case 'EDIT_AD':
          const editResult = await adapter.editAd(msg.payload.id, msg.payload.data)
          return { ...editResult, requestId: msg.requestId } as ChromeMessageResponse

        case 'DELETE_AD':
          const deleteResult = await adapter.deleteAd(msg.payload.id)
          return { ...deleteResult, requestId: msg.requestId } as ChromeMessageResponse

        case 'REPUBLISH_AD':
          const republishResult = await adapter.republishAd(msg.payload.id)
          return { ...republishResult, requestId: msg.requestId } as ChromeMessageResponse

        case 'FETCH_STATS':
          const stats = await adapter.fetchStats(msg.payload.id)
          return { success: true, data: stats, requestId: msg.requestId } as ChromeMessageResponse

        case 'FETCH_MESSAGES':
          const messages = await adapter.fetchMessages()
          return { success: true, data: messages, requestId: msg.requestId } as ChromeMessageResponse

        case 'SEND_MESSAGE':
          const sendResult = await adapter.sendMessage(msg.payload.threadId, msg.payload.message)
          return { ...sendResult, requestId: msg.requestId } as ChromeMessageResponse

        case 'GET_ACTIVE_PLATFORM':
          return { success: true, data: { platform: 'vinted' }, requestId: msg.requestId } as ChromeMessageResponse

        default:
          return { success: false, error: `Unknown action: ${msg.action}`, requestId: msg.requestId } as ChromeMessageResponse
      }
    } catch (error) {
      return { success: false, error: (error as Error).message, requestId: msg.requestId } as ChromeMessageResponse
    }
  })()
})

// Notify background that platform is detected
browser.runtime.sendMessage({
  action: 'PLATFORM_DETECTED',
  payload: { platform: 'vinted' },
  timestamp: Date.now(),
  requestId: crypto.randomUUID(),
})

export {}