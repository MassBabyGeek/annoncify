import type { PlatformAdapter, PlatformName, AdPayload, AdStats, MessageThread } from '../types'

/**
 * Base abstract class for all platform adapters
 * Provides common utilities and enforces interface implementation
 */
export abstract class BasePlatformAdapter implements PlatformAdapter {
  protected abstract platformName: PlatformName

  abstract detect(): boolean
  abstract createAd(data: AdPayload): Promise<{ success: boolean; adId?: string; error?: string }>
  abstract editAd(id: string, data: Partial<AdPayload>): Promise<{ success: boolean; error?: string }>
  abstract deleteAd(id: string): Promise<{ success: boolean; error?: string }>
  abstract republishAd(id: string): Promise<{ success: boolean; error?: string }>
  abstract fetchStats(id: string): Promise<AdStats>
  abstract fetchMessages(): Promise<MessageThread[]>
  abstract sendMessage(threadId: string, message: string): Promise<{ success: boolean; error?: string }>
  abstract markAsRead(threadId: string): Promise<{ success: boolean; error?: string }>

  getPlatformName(): PlatformName {
    return this.platformName
  }

  // ========================================
  // COMMON UTILITY METHODS
  // ========================================

  protected waitForElement(selector: string, timeout = 10000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector)
      if (element) return resolve(element)

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector)
        if (el) {
          observer.disconnect()
          resolve(el)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      setTimeout(() => {
        observer.disconnect()
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
      }, timeout)
    })
  }

  protected async waitForElements(selector: string, timeout = 10000): Promise<NodeListOf<Element>> {
    await this.waitForElement(selector, timeout)
    return document.querySelectorAll(selector)
  }

  protected async typeIntoField(element: HTMLInputElement | HTMLTextAreaElement, text: string) {
    element.focus()
    element.value = ''

    for (const char of text) {
      element.value += char
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
      await this.sleep(50 + Math.random() * 50)
    }

    element.blur()
  }

  protected async clickElement(element: HTMLElement, scrollIntoView = true) {
    if (scrollIntoView) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await this.sleep(300)
    }
    element.click()
    await this.sleep(100)
  }

  protected async selectOption(selectElement: HTMLSelectElement, value: string) {
    selectElement.value = value
    selectElement.dispatchEvent(new Event('change', { bubbles: true }))
    await this.sleep(100)
  }

  protected async uploadFiles(inputElement: HTMLInputElement, files: File[]) {
    const dataTransfer = new DataTransfer()
    files.forEach(file => dataTransfer.items.add(file))
    inputElement.files = dataTransfer.files
    inputElement.dispatchEvent(new Event('change', { bubbles: true }))
  }

  protected base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',')
    if (arr.length !== 2) throw new Error('Invalid base64 string format')

    const match = arr[0]?.match(/:(.*?);/)
    if (!match || !match[1]) throw new Error('Invalid base64 string MIME type')
    const mime = match[1]

    if (!arr[1]) throw new Error('Invalid base64 string data')
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8arr = new Uint8Array(n)

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }

    return new File([u8arr], filename, { type: mime })
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected randomDelay(min = 500, max = 1500): Promise<void> {
    return this.sleep(min + Math.random() * (max - min))
  }

  protected log(message: string, data?: any) {
    console.log(`[Annoncify - ${this.platformName}]`, message, data ?? '')
  }

  protected logError(message: string, error?: any) {
    console.error(`[Annoncify - ${this.platformName}] ERROR:`, message, error ?? '')
  }

  protected extractNumber(text: string): number {
    const match = text.match(/\d+/)
    return match && match[0] ? parseInt(match[0], 10) : 0
  }

  protected isVisible(element: HTMLElement): boolean {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
  }

  protected async retry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await this.sleep(initialDelay * Math.pow(2, i))
        }
      }
    }

    throw lastError
  }
}
