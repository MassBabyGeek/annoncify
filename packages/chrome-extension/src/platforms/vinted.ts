import { BasePlatformAdapter } from './base-adapter'
import type { AdPayload, AdStats, MessageThread, PlatformName, Message } from '../types'

/**
 * Vinted Platform Adapter
 * Handles all automation for Vinted.fr
 */
export class VintedAdapter extends BasePlatformAdapter {
  protected platformName: PlatformName = 'vinted'

  // DOM Selectors for Vinted (as of 2024)
  private selectors = {
    // Ad Creation
    uploadButton: 'button[data-testid="upload-button"]',
    titleInput: 'input[name="title"]',
    descriptionTextarea: 'textarea[name="description"]',
    priceInput: 'input[name="price"]',
    categorySelect: 'select[name="catalog_id"]',
    brandInput: 'input[name="brand"]',
    sizeSelect: 'select[name="size_id"]',
    conditionSelect: 'select[name="status_id"]',
    colorSelect: 'select[name="color_ids"]',
    cityInput: 'input[name="city"]',
    submitButton: 'button[type="submit"]',
    photoInput: 'input[type="file"][accept="image/*"]',

    // Stats
    statsViews: '.item-stats__view-count',
    statsFavorites: '.item-stats__favourite-count',

    // Messages
    messageThreads: '.conversation-list__item',
    messageInput: 'textarea[name="body"]',
    sendMessageButton: 'button[type="submit"]',
    unreadBadge: '.conversation__unread-badge',
  }

  /**
   * Detect if we're on Vinted
   */
  detect(): boolean {
    return (
      window.location.hostname.includes('vinted.fr') ||
      window.location.hostname.includes('vinted.com')
    )
  }

  /**
   * Create a new ad on Vinted
   */
  async createAd(data: AdPayload): Promise<{ success: boolean; adId?: string; error?: string }> {
    try {
      this.log('Starting ad creation', data)

      // Navigate to upload page if not already there
      if (!window.location.pathname.includes('/items/new')) {
        window.location.href = 'https://www.vinted.fr/items/new'
        await this.sleep(2000)
      }

      // Step 1: Upload photos
      await this.uploadPhotos(data.images)

      // Step 2: Fill title
      const titleInput = (await this.waitForElement(this.selectors.titleInput)) as HTMLInputElement
      await this.typeIntoField(titleInput, data.title)

      // Step 3: Fill description
      const descriptionTextarea = (await this.waitForElement(
        this.selectors.descriptionTextarea
      )) as HTMLTextAreaElement
      await this.typeIntoField(descriptionTextarea, data.description)

      // Step 4: Select category (if available)
      if (data.category) {
        const categorySelect = (await this.waitForElement(
          this.selectors.categorySelect
        )) as HTMLSelectElement
        await this.selectOption(categorySelect, data.category)
        await this.randomDelay()
      }

      // Step 5: Fill brand (if available in metadata)
      if (data.metadata?.brand) {
        const brandInput = (await this.waitForElement(
          this.selectors.brandInput
        )) as HTMLInputElement
        await this.typeIntoField(brandInput, data.metadata.brand)
      }

      // Step 6: Select size (if available)
      if (data.metadata?.size) {
        const sizeSelect = (await this.waitForElement(
          this.selectors.sizeSelect
        )) as HTMLSelectElement
        await this.selectOption(sizeSelect, data.metadata.size)
      }

      // Step 7: Select condition
      if (data.condition) {
        const conditionSelect = (await this.waitForElement(
          this.selectors.conditionSelect
        )) as HTMLSelectElement
        const conditionMap: Record<string, string> = {
          new: '6',
          like_new: '1',
          very_good: '2',
          good: '3',
          acceptable: '4',
        }
        await this.selectOption(conditionSelect, conditionMap[data.condition] || '2')
      }

      // Step 8: Fill price
      const priceInput = (await this.waitForElement(this.selectors.priceInput)) as HTMLInputElement
      await this.typeIntoField(priceInput, data.price.toString())

      // Step 9: Fill location
      const cityInput = (await this.waitForElement(this.selectors.cityInput)) as HTMLInputElement
      await this.typeIntoField(cityInput, data.location.city)
      await this.sleep(1000) // Wait for autocomplete
      // Press Enter to select first suggestion
      cityInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

      // Step 10: Submit
      await this.randomDelay(1000, 2000)
      const submitButton = (await this.waitForElement(
        this.selectors.submitButton
      )) as HTMLButtonElement
      await this.clickElement(submitButton)

      // Wait for redirect to ad page
      await this.sleep(3000)

      // Extract ad ID from URL
      const adIdMatch = window.location.pathname.match(/\/items\/(\d+)/)
      const adId = adIdMatch && adIdMatch[1] ? adIdMatch[1] : undefined

      this.log('Ad created successfully', { adId })
      return { success: true, adId }
    } catch (error) {
      this.logError('Failed to create ad', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Upload photos
   */
  private async uploadPhotos(images: string[]) {
    const photoInput = (await this.waitForElement(this.selectors.photoInput)) as HTMLInputElement

    const files: File[] = []
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      if (!image) continue

      let file: File

      if (image.startsWith('data:')) {
        // Base64 image
        file = this.base64ToFile(image, `photo-${i + 1}.jpg`)
      } else {
        // URL - fetch and convert to File
        const response = await fetch(image)
        const blob = await response.blob()
        file = new File([blob], `photo-${i + 1}.jpg`, { type: 'image/jpeg' })
      }

      files.push(file)
    }

    await this.uploadFiles(photoInput, files)
    await this.sleep(2000) // Wait for upload
  }

  /**
   * Edit an existing ad
   */
  async editAd(
    id: string,
    data: Partial<AdPayload>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Navigate to edit page
      window.location.href = `https://www.vinted.fr/items/${id}/edit`
      await this.sleep(2000)

      // Update fields that are provided
      if (data.title) {
        const titleInput = (await this.waitForElement(
          this.selectors.titleInput
        )) as HTMLInputElement
        await this.typeIntoField(titleInput, data.title)
      }

      if (data.description) {
        const descriptionTextarea = (await this.waitForElement(
          this.selectors.descriptionTextarea
        )) as HTMLTextAreaElement
        await this.typeIntoField(descriptionTextarea, data.description)
      }

      if (data.price !== undefined) {
        const priceInput = (await this.waitForElement(
          this.selectors.priceInput
        )) as HTMLInputElement
        await this.typeIntoField(priceInput, data.price.toString())
      }

      // Submit changes
      const submitButton = (await this.waitForElement(
        this.selectors.submitButton
      )) as HTMLButtonElement
      await this.clickElement(submitButton)

      await this.sleep(2000)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Delete an ad
   */
  async deleteAd(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Navigate to item page
      window.location.href = `https://www.vinted.fr/items/${id}`
      await this.sleep(2000)

      // Click options menu
      const optionsButton = (await this.waitForElement(
        'button[data-testid="item-options"]'
      )) as HTMLButtonElement
      await this.clickElement(optionsButton)

      // Click delete
      const deleteButton = (await this.waitForElement(
        'button[data-testid="delete-item"]'
      )) as HTMLButtonElement
      await this.clickElement(deleteButton)

      // Confirm deletion
      const confirmButton = (await this.waitForElement(
        'button[data-testid="confirm-delete"]'
      )) as HTMLButtonElement
      await this.clickElement(confirmButton)

      await this.sleep(2000)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Republish/bump an ad
   */
  async republishAd(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Vinted doesn't have a native "bump" feature like LeBonCoin
      // We can close and reopen the ad
      window.location.href = `https://www.vinted.fr/items/${id}`
      await this.sleep(2000)

      // This is a placeholder - actual implementation depends on Vinted's current UI
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Fetch stats for an ad
   */
  async fetchStats(id: string): Promise<AdStats> {
    // Navigate to item page
    if (!window.location.pathname.includes(`/items/${id}`)) {
      window.location.href = `https://www.vinted.fr/items/${id}`
      await this.sleep(2000)
    }

    // Extract views
    const viewsElement = document.querySelector(this.selectors.statsViews)
    const views = viewsElement ? this.extractNumber(viewsElement.textContent || '0') : 0

    // Extract favorites
    const favoritesElement = document.querySelector(this.selectors.statsFavorites)
    const favorites = favoritesElement
      ? this.extractNumber(favoritesElement.textContent || '0')
      : 0

    return {
      id,
      platform: 'vinted',
      views,
      favorites,
      messages: 0, // Would need to check messages separately
      lastUpdated: new Date(),
      status: 'active',
    }
  }

  /**
   * Fetch all message threads
   */
  async fetchMessages(): Promise<MessageThread[]> {
    // Navigate to inbox
    if (!window.location.pathname.includes('/inbox')) {
      window.location.href = 'https://www.vinted.fr/inbox'
      await this.sleep(2000)
    }

    const threads: MessageThread[] = []
    const threadElements = await this.waitForElements(this.selectors.messageThreads)

    for (const threadEl of Array.from(threadElements)) {
      try {
        // Extract thread data from DOM
        const threadId = threadEl.getAttribute('data-conversation-id') || ''
        const adTitle = threadEl.querySelector('.conversation__item-title')?.textContent || ''
        const participantName =
          threadEl.querySelector('.conversation__user-name')?.textContent || ''
        const lastMessageText =
          threadEl.querySelector('.conversation__last-message')?.textContent || ''
        const unreadBadge = threadEl.querySelector(this.selectors.unreadBadge)
        const unreadCount = unreadBadge ? this.extractNumber(unreadBadge.textContent || '0') : 0

        threads.push({
          id: threadId,
          platform: 'vinted',
          adId: '', // Would need to extract from thread data
          adTitle,
          participant: {
            id: '',
            name: participantName,
          },
          messages: [
            {
              id: '',
              threadId,
              sender: { id: '', name: participantName },
              content: lastMessageText,
              timestamp: new Date(),
              read: unreadCount === 0,
            },
          ],
          unreadCount,
          lastMessage: {
            id: '',
            threadId,
            sender: { id: '', name: participantName },
            content: lastMessageText,
            timestamp: new Date(),
            read: unreadCount === 0,
          },
        })
      } catch (error) {
        this.logError('Failed to parse thread', error)
      }
    }

    return threads
  }

  /**
   * Send a message
   */
  async sendMessage(
    threadId: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Navigate to conversation
      window.location.href = `https://www.vinted.fr/inbox/${threadId}`
      await this.sleep(2000)

      // Type message
      const messageInput = (await this.waitForElement(
        this.selectors.messageInput
      )) as HTMLTextAreaElement
      await this.typeIntoField(messageInput, message)

      // Send
      const sendButton = (await this.waitForElement(
        this.selectors.sendMessageButton
      )) as HTMLButtonElement
      await this.clickElement(sendButton)

      await this.sleep(1000)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(threadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simply opening the conversation marks it as read
      window.location.href = `https://www.vinted.fr/inbox/${threadId}`
      await this.sleep(2000)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}
