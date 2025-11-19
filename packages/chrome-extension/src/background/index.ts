import browser from 'webextension-polyfill'
import type { ChromeMessage, ChromeMessageResponse, ExtensionSettings } from '../types'

/**
 * Background Service Worker (Manifest V3)
 * Handles messaging, forwarding to content scripts, and syncing with backend
 */

// --------------------
// Extension settings
// --------------------
let settings: ExtensionSettings = {
  apiUrl: 'http://localhost:3000',
  autoSync: true,
  syncInterval: 30,
  notifications: true,
  apiKey: undefined,
}

// Load stored settings on startup
browser.storage.local.get('settings').then((result) => {
  if (result.settings) {
    settings = { ...settings, ...result.settings }
  }
})

// --------------------
// Utils
// --------------------
async function sendToActiveTab(message: ChromeMessage): Promise<ChromeMessageResponse<any>> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return { success: false, error: 'No active tab found', requestId: message.requestId };
  }

  try {
    const response = (await browser.tabs.sendMessage(tab.id, message)) as ChromeMessageResponse<any> | undefined;
    return response ?? { success: false, error: 'No response from content script', requestId: message.requestId };
  } catch (error) {
    return { success: false, error: (error as Error).message, requestId: message.requestId };
  }
}


// --------------------
// Handlers
// --------------------
const handlers: Record<
  string,
  (message: ChromeMessage<any>, sender: browser.Runtime.MessageSender) => Promise<ChromeMessageResponse<any>>
> = {
  CREATE_AD: (msg) => sendToActiveTab(msg),
  EDIT_AD: (msg) => sendToActiveTab(msg),
  DELETE_AD: (msg) => sendToActiveTab(msg),
  REPUBLISH_AD: (msg) => sendToActiveTab(msg),
  FETCH_STATS: (msg) => sendToActiveTab(msg),
  FETCH_MESSAGES: (msg) => sendToActiveTab(msg),
  SEND_MESSAGE: (msg) => sendToActiveTab(msg),
  GET_ACTIVE_PLATFORM: async (msg, sender) => {
    if (sender.tab?.id) {
      try {
        const response = (await browser.tabs.sendMessage(sender.tab.id, msg)) as
          | ChromeMessageResponse<any>
          | undefined
        return {
          success: response?.success ?? true,
          data: response?.data,
          error: response?.error,
          requestId: msg.requestId,
        }
      } catch {
        return { success: false, error: 'Failed to reach content script', requestId: msg.requestId }
      }
    }
    return sendToActiveTab(msg)
  },

  SYNC_TO_SERVER: async (msg) => {
    try {
      const response = await fetch(`${settings.apiUrl}/api/extension/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey && { Authorization: `Bearer ${settings.apiKey}` }),
        },
        body: JSON.stringify(msg.payload),
      })

      if (!response.ok) throw new Error(`API error: ${response.statusText}`)

      const data = await response.json()
      return { success: true, data, requestId: msg.requestId }
    } catch (error) {
      return { success: false, error: (error as Error).message, requestId: msg.requestId }
    }
  },

  PUBLISH_LISTING: async (msg) => {
    try {
      const { listingId, publicationId, platform, apiUrl, data } = msg.payload

      // Si les données sont déjà fournies (mode test), on les utilise directement
      let listingData = data

      // Sinon, récupérer les données de l'annonce depuis l'API
      if (!listingData && apiUrl) {
        const response = await fetch(`${apiUrl}/api/extension/listing/${listingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) throw new Error(`API error: ${response.statusText}`)

        const result = await response.json()
        if (!result.success) throw new Error(result.error || 'Failed to fetch listing')

        listingData = result.data
      }

      if (!listingData) throw new Error('No listing data provided')

      // Ouvrir un nouvel onglet sur la plateforme
      const platformUrls: Record<string, string> = {
        vinted: 'https://www.vinted.fr/items/new',
        leboncoin: 'https://www.leboncoin.fr/deposer-une-annonce',
      }

      const url = platformUrls[platform]
      if (!url) throw new Error(`Unknown platform: ${platform}`)

      // Créer l'onglet en arrière-plan (active: false)
      const tab = await browser.tabs.create({ url, active: false })

      // Attendre que la page se charge complètement
      if (tab.id) {
        await new Promise<void>((resolve) => {
          const listener = (
            tabId: number,
            changeInfo: browser.Tabs.OnUpdatedChangeInfoType
          ) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
              browser.tabs.onUpdated.removeListener(listener)
              // Attendre encore 2 secondes pour que le content script s'initialise
              setTimeout(() => resolve(), 2000)
            }
          }
          browser.tabs.onUpdated.addListener(listener)

          // Timeout de sécurité de 15 secondes
          setTimeout(() => {
            browser.tabs.onUpdated.removeListener(listener)
            resolve()
          }, 15000)
        })
      }

      // Envoyer les données au content script de la plateforme
      if (tab.id) {
        const createResponse = (await browser.tabs.sendMessage(tab.id, {
          action: 'CREATE_AD',
          payload: { data: listingData },
          timestamp: Date.now(),
          requestId: crypto.randomUUID(),
        })) as ChromeMessageResponse<{ adId?: string }>

        // NOTE: Database status update disabled for testing
        // User can test multiple times with the same listing without recreating it
        // If you need to update the status, uncomment the code below:
        /*
        if (createResponse && createResponse.success) {
          await fetch(`${apiUrl}/api/listings/${listingId}/publish`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              publicationId,
              externalId: createResponse.data?.adId,
              status: 'ACTIVE',
            }),
          })
        }
        */
      }

      return { success: true, requestId: msg.requestId }
    } catch (error) {
      return { success: false, error: (error as Error).message, requestId: msg.requestId }
    }
  },
}

// --------------------
// Message listener
// --------------------
browser.runtime.onMessage.addListener(
  (message: unknown, sender: browser.Runtime.MessageSender): Promise<ChromeMessageResponse<any>> => {
    return (async () => {
      if (typeof message === 'object' && message !== null && 'action' in message) {
        const msg = message as ChromeMessage<any>
        const handler = handlers[msg.action]

        if (!handler) {
          return { success: false, error: `Unknown action: ${msg.action}`, requestId: msg.requestId }
        }

        try {
          const result = await handler(msg, sender)
          return result
        } catch (err) {
          return { success: false, error: (err as Error).message, requestId: msg.requestId }
        }
      }

      return { success: false, error: 'Invalid message format', requestId: 'unknown' }
    })()
  }
)

// --------------------
// Periodic auto-sync
// --------------------
if (settings.autoSync) {
  setInterval(async () => {
    console.log('[Background] Auto-sync triggered')
    const tabs = await browser.tabs.query({})
    for (const tab of tabs) {
      if (!tab.id) continue
      try {
        await browser.tabs.sendMessage(tab.id, { action: 'SYNC', requestId: crypto.randomUUID() })
      } catch {}
    }
  }, settings.syncInterval * 60 * 1000)
}

console.log('[Background] Service worker initialized')
export {}