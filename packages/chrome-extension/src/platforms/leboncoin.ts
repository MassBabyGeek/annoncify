import { BasePlatformAdapter } from './base-adapter'
import type { AdPayload, AdStats, MessageThread, PlatformName } from '../types'
import { getCategoryPath, getCategoryById } from '@annoncify/shared/categories'

/**
 * LeBonCoin Platform Adapter - Multi-step form
 */
export class LeBonCoinAdapter extends BasePlatformAdapter {
  protected platformName: PlatformName = 'leboncoin'

  private selectors = {
    // Category selection
    categoryButton: 'button[data-test-id]', // Category buttons with data-test-id

    // Ad Creation - Multi-step
    titleInput: 'input[name="subject"]',
    continueButton: 'button[type="submit"]',
    descriptionTextarea: 'textarea',
    priceInput: 'input[type="number"]',
    locationInput: 'input[placeholder*="ville"], input[placeholder*="Ville"], input[placeholder*="localisation"]',
    photoInput: 'input[type="file"]',

    // Stats
    statsContainer: '[data-qa-id="adview-stats"]',
    viewsCount: '[data-qa-id="stat-views"]',
    favoritesCount: '[data-qa-id="stat-favorites"]',

    // Messages
    messagesLink: 'a[href*="/messages"]',
    threadList: '[data-qa-id="thread-list"]',
    threadItem: '[data-qa-id="thread-item"]',
    messageInput: 'textarea[data-qa-id="message-input"]',
    sendButton: 'button[data-qa-id="send-message"]',
  }

  detect(): boolean {
    return window.location.hostname.includes('leboncoin.fr')
  }

  async createAd(data: AdPayload): Promise<{ success: boolean; adId?: string; error?: string }> {
    try {
      this.log('Creating ad on LeBonCoin (multi-step)', data)
      this.log('DEBUG - full data keys:', Object.keys(data))

      // Extract LeBonCoin-specific data from new structure or fallback to old structure
      const leboncoinData = data.customFields?.LEBONCOIN
      const categoryId = leboncoinData?.categoryId || data.leboncoinCategory
      const customFieldsData = leboncoinData?.fields || {}

      this.log('DEBUG - categoryId:', categoryId)
      this.log('DEBUG - customFields:', customFieldsData)

      // Navigate to create ad page if not already there
      if (!window.location.pathname.includes('/deposer-une-annonce')) {
        window.location.href = 'https://www.leboncoin.fr/deposer-une-annonce'
        await this.sleep(2000)
      }

      // Step 1: Fill title FIRST
      this.log('Step 1: Filling title')
      const titleInput = (await this.waitForElement(
        this.selectors.titleInput,
        5000
      )) as HTMLInputElement
      await this.typeIntoField(titleInput, data.title)
      await this.sleep(500)

      // Step 2: Open category dropdown modal
      this.log('Step 2: Opening category dropdown modal')
      // Find button that contains "Choisissez" text
      const buttons = document.querySelectorAll('button')
      let categoryDropdownButton: HTMLButtonElement | null = null
      for (const btn of Array.from(buttons)) {
        if (btn.textContent?.includes('Choisissez')) {
          categoryDropdownButton = btn as HTMLButtonElement
          break
        }
      }

      if (!categoryDropdownButton) {
        throw new Error('Category dropdown button not found')
      }

      this.log('Found category dropdown button, clicking it')
      await this.clickElement(categoryDropdownButton)
      await this.sleep(500)

      // Step 3: Select category from opened modal
      if (categoryId) {
        await this.selectCategory(categoryId)
      } else {
        this.log('No LeBonCoin category provided - skipping category selection')
        this.log('User must manually select category before continuing')
        return {
          success: false,
          error: 'LeBonCoin category is required. Please select a category in the form.',
        }
      }

      // Step 4: Upload photos (REQUIRED by LeBonCoin)
      if (!data.images || data.images.length === 0) {
        this.log('ERROR: LeBonCoin requires at least one photo')
        return {
          success: false,
          error: 'LeBonCoin exige au moins une photo pour publier une annonce',
        }
      }

      this.log('Step 4: Uploading photos')
      await this.uploadPhotos(data.images)

      // Step 5: Fill custom fields (platform-specific)
      if (Object.keys(customFieldsData).length > 0) {
        this.log('Step 5: Filling custom fields')
        await this.fillCustomFields(customFieldsData)
      }

      // Step 6: Fill title and description (separate step after custom fields)
      this.log('Step 6: Filling title and description')
      await this.fillTitleAndDescriptionStep(data.title, data.description)

      // Step 7: Fill price and location
      await this.fillPriceAndLocationStep(data.price, data.location)

      // Extract ad ID from URL if available
      const adIdMatch = window.location.pathname.match(/\/(\d+)\.htm/)
      const adId = adIdMatch && adIdMatch[1] ? adIdMatch[1] : undefined

      this.log('Ad creation completed', { adId })
      return { success: true, adId }
    } catch (error) {
      this.logError('Failed to create ad', error)
      return { success: false, error: (error as Error).message }
    }
  }

  private async selectCategory(categoryId: string): Promise<void> {
    try {
      this.log('Step 3: Selecting category', { categoryId })

      // Get the full path of categories to navigate
      const categoryPath = getCategoryPath(categoryId)

      if (categoryPath.length === 0) {
        throw new Error(`Invalid category ID: ${categoryId}`)
      }

      this.log('Category path to navigate:', categoryPath)

      // Navigate through each level of the category tree
      for (let i = 0; i < categoryPath.length; i++) {
        const catId = categoryPath[i]
        const category = getCategoryById(catId)

        if (!category) {
          throw new Error(`Category not found: ${catId}`)
        }

        this.log(`Navigating level ${i + 1}/${categoryPath.length}: ${category.label}`)

        // Wait a bit for the page to be ready
        await this.sleep(300)

        // Find the button for this category
        // Search through ALL buttons to find category button
        const allButtons = document.querySelectorAll('button')
        this.log(`Total buttons on page: ${allButtons.length}`)

        let foundButton: HTMLElement | null = null
        const categoryLabel = category.label.toLowerCase().trim()

        // Search through all buttons
        for (const button of Array.from(allButtons)) {
          const buttonText = button.textContent?.toLowerCase().trim() || ''
          const testId = button.getAttribute('data-test-id') || ''

          // Skip buttons without text (avoid matching empty strings)
          if (buttonText.length === 0) {
            continue
          }

          // Try to match by text content or data-test-id
          if (
            buttonText.includes(categoryLabel) ||
            categoryLabel.includes(buttonText) ||
            testId.includes(catId) ||
            testId.includes(categoryLabel)
          ) {
            this.log(`Found matching button: "${buttonText}" (testId: ${testId})`)
            foundButton = button as HTMLElement
            break
          }
        }

        if (!foundButton) {
          this.log(`Button not found for category: ${category.label}`)
          // Log all visible buttons for debugging
          this.log('All buttons with text:', Array.from(allButtons)
            .filter(b => b.textContent && b.textContent.trim().length > 0)
            .slice(0, 20) // First 20 only
            .map(b => ({
              testId: b.getAttribute('data-test-id'),
              text: b.textContent?.trim().substring(0, 50),
              visible: (b as HTMLElement).offsetParent !== null
            })))
          throw new Error(`Category button not found: ${category.label}`)
        }

        // Click the button
        this.log(`Clicking button: ${category.label}`)
        await this.clickElement(foundButton)

        // Wait for the page to update
        await this.sleep(300)
      }

      this.log('Step 3: Category selected successfully')

      // Click "Continuer" button to confirm category selection
      this.log('Looking for "Continuer" button')
      await this.sleep(300)
      const buttons = document.querySelectorAll('button[type="submit"]')
      let continueButton: HTMLButtonElement | null = null
      for (const btn of Array.from(buttons)) {
        if (btn.textContent?.includes('Continuer')) {
          continueButton = btn as HTMLButtonElement
          break
        }
      }

      if (continueButton) {
        this.log('Clicking "Continuer" button')
        await this.clickElement(continueButton)
        await this.sleep(500)
      } else {
        this.log('Warning: "Continuer" button not found')
      }
    } catch (error) {
      this.logError('Failed to select category', error)
      throw error
    }
  }


  private async fillTitleAndDescriptionStep(title: string, description: string): Promise<void> {
    try {
      this.log('Filling title and description on separate step')

      // Wait for the page to load
      await this.sleep(2000)

      // Fill title field (name="subject" or id="subject")
      let titleInput = document.querySelector('input[name="subject"]') as HTMLInputElement
      if (!titleInput) {
        titleInput = document.querySelector('input[id="subject"]') as HTMLInputElement
      }

      if (titleInput) {
        this.log('Found title input, filling it')
        await this.typeIntoField(titleInput, title)
        await this.sleep(300)
      } else {
        this.log('Warning: Title input not found')
      }

      // Fill description field (name="body" or id="body")
      let descTextarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement
      if (!descTextarea) {
        descTextarea = document.querySelector('textarea[id="body"]') as HTMLTextAreaElement
      }

      if (descTextarea) {
        this.log('Found description textarea, filling it')
        await this.typeIntoField(descTextarea, description)
        await this.sleep(1000) // Wait longer for button to become enabled
      } else {
        this.log('Warning: Description textarea not found')
      }

      // Click continue button to go to next step
      this.log('Looking for continue button after title/description')
      const continueButton = await this.findContinueButton()
      if (continueButton) {
        this.log('Found continue button, clicking it')
        await this.clickElement(continueButton)
        await this.sleep(2000)
      } else {
        this.log('WARNING: Continue button not found after title/description!')
      }

      this.log('Title and description step completed')
    } catch (error) {
      this.log('Title/description step failed', error)
      // Don't throw, continue to next step
    }
  }

  // Mapping field IDs to French labels on LeBonCoin
  private fieldLabelMapping: Record<string, string[]> = {
    argus_moto_brand: ['Marque', 'Brand'],
    argus_moto_model: ['Modèle', 'Model'],
    type: ['Type de véhicule', 'Type'],
    color: ['Couleur', 'Color'],
    critair: ['Vignette Crit\'Air', 'Critair'],
    mileage: ['Kilométrage', 'Mileage'],
    regdate: ['Année-modèle', 'Année modèle', 'Mise en circulation'],
    finition: ['Finition'],
    puissance: ['Puissance fiscale', 'Puissance'],
    type_permis: ['Type de permis', 'Permis'],
    boite_vitesse: ['Boîte de vitesse', 'Boite de vitesse'],
    cubic_capacity: ['Cylindrée', 'Cubic capacity'],
    classe_emission: ['Classe d\'émission', 'Classe emission'],
    date_circulation: ['Date de mise en circulation', 'Première mise en circulation'],
  }

  private async findFieldByLabel(fieldId: string): Promise<HTMLElement | null> {
    // Try by name/id first (for standard inputs)
    const selectors = [
      `[name="${fieldId}"]`,
      `[id="${fieldId}"]`,
      `[data-qa-id="${fieldId}"]`,
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        this.log(`Found field ${fieldId} with selector: ${selector}`)
        return element
      }
    }

    // Try to find by label text
    const labelTexts = this.fieldLabelMapping[fieldId] || []

    for (const labelText of labelTexts) {
      // Find all labels containing this text
      const labels = Array.from(document.querySelectorAll('label'))
      const matchingLabel = labels.find(label =>
        label.textContent?.toLowerCase().includes(labelText.toLowerCase())
      )

      if (matchingLabel) {
        const labelId = matchingLabel.getAttribute('id')

        if (labelId) {
          // Find input with aria-labelledby pointing to this label
          const input = document.querySelector(`[aria-labelledby="${labelId}"]`) as HTMLElement
          if (input) {
            this.log(`Found field ${fieldId} by label "${labelText}" (aria-labelledby)`)
            return input
          }
        }

        // Try to find input by "for" attribute
        const forAttr = matchingLabel.getAttribute('for')
        if (forAttr) {
          const input = document.getElementById(forAttr) as HTMLElement
          if (input) {
            this.log(`Found field ${fieldId} by label "${labelText}" (for attribute)`)
            return input
          }
        }

        // Try to find input as sibling or child
        const parentDiv = matchingLabel.closest('div')
        if (parentDiv) {
          const input = parentDiv.querySelector('input, select, textarea') as HTMLElement
          if (input) {
            this.log(`Found field ${fieldId} by label "${labelText}" (sibling search)`)
            return input
          }
        }
      }
    }

    return null
  }

  private async fillCombobox(input: HTMLInputElement, value: string): Promise<void> {
    // Focus and clear the input
    input.focus()
    input.value = ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await this.sleep(300)

    // Type the value
    await this.typeIntoField(input, value)

    // Wait longer for the dropdown to filter suggestions
    await this.sleep(1000)

    // Find and click the best matching suggestion
    const suggestions = document.querySelectorAll('[role="option"]')

    if (suggestions.length > 0) {
      this.log(`Found ${suggestions.length} suggestions after typing "${value}"`)

      // Find best match (exact or partial match)
      let bestMatch: HTMLElement | null = null
      let bestScore = 0
      const valueLower = value.toLowerCase().trim()

      for (const suggestion of Array.from(suggestions)) {
        const text = (suggestion.textContent || '').toLowerCase().trim()

        // Exact match = highest score
        if (text === valueLower) {
          bestMatch = suggestion as HTMLElement
          bestScore = 100
          this.log(`Found exact match: "${suggestion.textContent}"`)
          break
        }

        // Starts with = high score
        if (text.startsWith(valueLower) && bestScore < 80) {
          bestMatch = suggestion as HTMLElement
          bestScore = 80
        }

        // Contains = medium score
        if (text.includes(valueLower) && bestScore < 50) {
          bestMatch = suggestion as HTMLElement
          bestScore = 50
        }
      }

      if (bestMatch) {
        this.log(`Clicking best match (score ${bestScore}): "${bestMatch.textContent}"`)
        await this.clickElement(bestMatch)
        await this.sleep(400)
      } else {
        // No match found, use first suggestion
        this.log(`No match found for "${value}", using first suggestion: "${suggestions[0].textContent}"`)
        await this.clickElement(suggestions[0] as HTMLElement)
        await this.sleep(400)
      }
    } else {
      this.log(`No suggestions found for combobox, keeping typed value`)
      // Trigger blur to commit the value
      input.blur()
      await this.sleep(200)
    }
  }

  private async fillCustomFields(customFieldsData: Record<string, any>): Promise<void> {
    try {
      this.log('Filling custom fields', customFieldsData)
      await this.sleep(500)

      for (const [fieldId, value] of Object.entries(customFieldsData)) {
        if (value === null || value === undefined || value === '') {
          continue
        }

        this.log(`Filling custom field: ${fieldId} = ${value}`)

        // Find the field element
        const fieldElement = await this.findFieldByLabel(fieldId)

        if (!fieldElement) {
          this.log(`Warning: Field ${fieldId} not found on page, skipping`)
          continue
        }

        // Fill based on field type
        if (fieldElement.tagName === 'SELECT') {
          const selectElement = fieldElement as HTMLSelectElement

          // Try to set the value
          selectElement.value = value

          // If the value doesn't exist in the select options, take the first available option
          if (!selectElement.value || selectElement.value === '') {
            this.log(`Warning: Value "${value}" not found in select options for ${fieldId}`)

            // Find first non-empty option
            const options = Array.from(selectElement.options)
            const firstValidOption = options.find(opt => opt.value && opt.value !== '')

            if (firstValidOption) {
              selectElement.value = firstValidOption.value
              this.log(`Using first available option instead: ${firstValidOption.value} (${firstValidOption.text})`)
            } else {
              this.log(`Error: No valid options found in select ${fieldId}`)
              continue
            }
          }

          // Trigger change event
          selectElement.dispatchEvent(new Event('change', { bubbles: true }))
          this.log(`Set select field ${fieldId} to ${selectElement.value}`)
        } else if (fieldElement.tagName === 'INPUT') {
          const inputElement = fieldElement as HTMLInputElement
          const inputType = inputElement.type

          // Check if it's a combobox
          const isCombobox = inputElement.getAttribute('role') === 'combobox'

          if (isCombobox) {
            this.log(`Field ${fieldId} is a combobox, using special fill method`)
            await this.fillCombobox(inputElement, value.toString())
          } else if (inputType === 'checkbox' || inputType === 'radio') {
            if (value === true || value === 'true' || value === inputElement.value) {
              inputElement.checked = true
              inputElement.dispatchEvent(new Event('change', { bubbles: true }))
            }
          } else {
            await this.typeIntoField(inputElement, value.toString())
          }
          this.log(`Set input field ${fieldId} to ${value}`)
        } else if (fieldElement.tagName === 'TEXTAREA') {
          const textareaElement = fieldElement as HTMLTextAreaElement
          await this.typeIntoField(textareaElement, value.toString())
          this.log(`Set textarea field ${fieldId} to ${value}`)
        }

        await this.sleep(200)
      }

      this.log('Custom fields filled successfully')

      // Click continue button after filling custom fields
      const continueButton = await this.findContinueButton()
      if (continueButton) {
        this.log('Clicking continue after custom fields')
        await this.clickElement(continueButton)
        await this.sleep(500)
      }
    } catch (error) {
      this.log('Custom fields filling failed', error)
      // Don't throw, continue to next step
    }
  }

  private async fillPriceAndLocationStep(
    price: number,
    location: { city: string; zipCode: string }
  ): Promise<void> {
    try {
      this.log('Step 7: Filling price and location')

      // Wait for the page to load
      await this.sleep(2000)

      // Fill price (name="price" or id="price")
      let priceInput = document.querySelector('input[name="price"]') as HTMLInputElement
      if (!priceInput) {
        priceInput = document.querySelector('input[id="price"]') as HTMLInputElement
      }
      if (!priceInput) {
        priceInput = document.querySelector(this.selectors.priceInput) as HTMLInputElement
      }

      if (priceInput) {
        this.log('Found price input, filling it')
        await this.typeIntoField(priceInput, price.toString())
        await this.sleep(300)
      } else {
        this.log('Warning: Price input not found')
      }

      // Click continue to go to next step (Garantie transaction sécurisée)
      const continueAfterPrice = await this.findContinueButton()
      if (continueAfterPrice) {
        this.log('Clicking continue after price (going to guarantee step)')
        await this.clickElement(continueAfterPrice)
        await this.sleep(2000)
      }

      // Step: Garantie transaction sécurisée - just click continue
      this.log('Looking for guarantee step continue button')
      const continueAfterGuarantee = await this.findContinueButton()
      if (continueAfterGuarantee) {
        this.log('Clicking continue after guarantee step (going to location)')
        await this.clickElement(continueAfterGuarantee)
        await this.sleep(2000)
      }

      // Fill location combobox
      let locationInput = document.querySelector('input[name="location"]') as HTMLInputElement
      if (!locationInput) {
        locationInput = document.querySelector('input[role="combobox"][aria-label*="ocation"]') as HTMLInputElement
      }
      if (!locationInput) {
        locationInput = document.querySelector(this.selectors.locationInput) as HTMLInputElement
      }

      if (locationInput) {
        this.log('Found location combobox, filling it')

        // Clear and type location
        locationInput.focus()
        locationInput.value = ''
        locationInput.dispatchEvent(new Event('input', { bubbles: true }))
        await this.sleep(200)

        await this.typeIntoField(locationInput, `${location.city} (${location.zipCode})`)
        await this.sleep(800)

        // Try to select first autocomplete suggestion
        const suggestions = document.querySelectorAll('[role="option"]')
        if (suggestions.length > 0) {
          this.log(`Found ${suggestions.length} location suggestions, clicking first one`)
          await this.clickElement(suggestions[0] as HTMLElement)
          await this.sleep(500)
        } else {
          this.log('No location suggestions found, keeping typed value')
        }
      } else {
        this.log('Warning: Location input not found')
      }

      // Click continue after location to go to phone/email step
      const continueAfterLocation = await this.findContinueButton()
      if (continueAfterLocation) {
        this.log('Clicking continue after location (going to phone/email step)')
        await this.clickElement(continueAfterLocation)
        await this.sleep(2000)
      }

      // Phone/Email step - just click continue (already registered)
      this.log('Looking for continue button on phone/email step')
      const continueAfterPhoneEmail = await this.findContinueButton()
      if (continueAfterPhoneEmail) {
        this.log('Clicking continue after phone/email (already registered)')
        await this.clickElement(continueAfterPhoneEmail)
        await this.sleep(2000)
      }

      // Final step: Click "Déposer sans booster mon annonce" to publish without boosting
      this.log('Looking for "Déposer sans booster mon annonce" button')
      const depositButton = await this.findDepositWithoutBoostButton()
      if (depositButton) {
        this.log('Clicking "Déposer sans booster mon annonce" to finalize')
        await this.clickElement(depositButton)
        await this.sleep(3000) // Attendre plus longtemps pour la confirmation

        // Vérifier le message de confirmation
        const confirmationFound = await this.checkConfirmationMessage()
        if (confirmationFound) {
          this.log('✅ SUCCESS: Confirmation message found - Ad published successfully!')

          // Fermer l'onglet après succès
          this.log('Closing tab in 2 seconds...')
          await this.sleep(2000)
          window.close()
        } else {
          this.log('⚠️ WARNING: Confirmation message not found - Please verify manually')
        }
      } else {
        this.log('Warning: "Déposer sans booster mon annonce" button not found')
      }

      this.log('Step 7: Price and location filled')
    } catch (error) {
      this.log('Step 7: Price/location step failed', error)
      // Don't throw, let it finish
    }
  }

  private async findContinueButton(): Promise<HTMLElement | null> {
    // Try multiple selectors for more robustness
    const selectors = [
      'button[type="submit"]',
      'button[type="button"]',
      'button',
    ]

    for (const selector of selectors) {
      const buttons = Array.from(document.querySelectorAll(selector))
      this.log(`Checking ${buttons.length} buttons with selector: ${selector}`)

      // Find button with "Continuer" or "Suivant" text that is not disabled
      for (const button of buttons) {
        const htmlButton = button as HTMLButtonElement
        const text = htmlButton.textContent?.toLowerCase() || ''
        const isDisabled = htmlButton.disabled || htmlButton.getAttribute('disabled') !== null

        this.log(`Button text: "${text.trim()}", disabled: ${isDisabled}`)

        if ((text.includes('continuer') || text.includes('suivant')) && !isDisabled) {
          this.log(`Found enabled continue button: "${text.trim()}"`)
          return htmlButton
        }
      }
    }

    this.log('No enabled continue/suivant button found')
    return null
  }

  private async findDepositWithoutBoostButton(): Promise<HTMLElement | null> {
    // Look for button with "Déposer sans booster" text
    const selectors = [
      'button[type="button"]',
      'button[type="submit"]',
      'button',
    ]

    for (const selector of selectors) {
      const buttons = Array.from(document.querySelectorAll(selector))
      this.log(`Checking ${buttons.length} buttons for "Déposer sans booster"`)

      for (const button of buttons) {
        const htmlButton = button as HTMLButtonElement
        const text = htmlButton.textContent?.toLowerCase() || ''
        const isDisabled = htmlButton.disabled || htmlButton.getAttribute('disabled') !== null

        this.log(`Button text: "${text.trim()}", disabled: ${isDisabled}`)

        if (text.includes('déposer sans booster') && !isDisabled) {
          this.log(`Found "Déposer sans booster mon annonce" button`)
          return htmlButton
        }
      }
    }

    this.log('No "Déposer sans booster mon annonce" button found')
    return null
  }

  private async checkConfirmationMessage(): Promise<boolean> {
    // Chercher le message de confirmation "Nous avons bien reçu votre annonce"
    this.log('Checking for confirmation message...')

    // Attendre un peu que le message s'affiche
    await this.sleep(1000)

    // Chercher dans tout le body de la page
    const bodyText = document.body.innerText.toLowerCase()

    // Vérifier différentes variantes du message
    const confirmationPhrases = [
      'nous avons bien reçu votre annonce',
      'votre annonce a bien été publiée',
      'votre annonce est en ligne',
      'annonce publiée',
      'annonce déposée',
    ]

    for (const phrase of confirmationPhrases) {
      if (bodyText.includes(phrase)) {
        this.log(`✅ Found confirmation phrase: "${phrase}"`)
        return true
      }
    }

    // Chercher aussi dans les éléments avec des classes spécifiques
    const possibleSelectors = [
      '[class*="success"]',
      '[class*="confirmation"]',
      '[class*="complete"]',
      'h1',
      'h2',
      '[role="alert"]',
    ]

    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector)
      for (const element of Array.from(elements)) {
        const text = element.textContent?.toLowerCase() || ''
        for (const phrase of confirmationPhrases) {
          if (text.includes(phrase)) {
            this.log(`✅ Found confirmation in element with selector "${selector}": "${phrase}"`)
            return true
          }
        }
      }
    }

    this.log('❌ No confirmation message found')
    this.log(`Current page URL: ${window.location.href}`)
    this.log(`Page title: ${document.title}`)

    return false
  }

  private async uploadPhotos(images: string[]) {
    try {
      this.log('Uploading photos')

      // Attendre que la page des photos se charge
      await this.sleep(1000)

      // Debug: afficher tous les inputs file sur la page
      const allFileInputs = document.querySelectorAll('input[type="file"]')
      this.log(`DEBUG: Found ${allFileInputs.length} file input(s) on page`)
      allFileInputs.forEach((input, index) => {
        this.log(`DEBUG: Input ${index}: id="${input.id}", name="${(input as HTMLInputElement).name}", accept="${(input as HTMLInputElement).accept}"`)
      })

      const photoInput = document.querySelector(this.selectors.photoInput) as HTMLInputElement

      if (!photoInput) {
        this.log('ERROR: Photo input not found with selector:', this.selectors.photoInput)
        this.log('Trying alternative selectors...')

        // Essayer des sélecteurs alternatifs
        const alternativeInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement
        if (alternativeInput) {
          this.log('Found photo input with alternative selector!')
          return await this.uploadPhotosToInput(alternativeInput, images)
        }

        this.log('ERROR: No photo input found, cannot upload photos')
        return
      }

      await this.uploadPhotosToInput(photoInput, images)
    } catch (error) {
      this.log('Photo upload failed', error)
    }
  }

  private async uploadPhotosToInput(photoInput: HTMLInputElement, images: string[]) {
    const files: File[] = []
    for (let i = 0; i < images.length && i < 10; i++) {
      // LBC limit is 10 photos
      const image = images[i]
      if (!image) continue

      let file: File

      if (image.startsWith('data:')) {
        file = this.base64ToFile(image, `photo-${i + 1}.jpg`)
      } else {
        const response = await fetch(image)
        const blob = await response.blob()
        file = new File([blob], `photo-${i + 1}.jpg`, { type: 'image/jpeg' })
      }

      files.push(file)
    }

    this.log(`Uploading ${files.length} photo(s)...`)
    await this.uploadFiles(photoInput, files)
    await this.sleep(1500)
    this.log('Photos uploaded successfully')

    // Click "Continuer" button after photo upload
    this.log('Looking for "Continuer" button after photo upload')
    await this.sleep(500)
    const buttons = document.querySelectorAll('button[type="submit"]')
    let continueButton: HTMLButtonElement | null = null
    for (const btn of Array.from(buttons)) {
      if (btn.textContent?.includes('Continuer') || btn.textContent?.includes('Suivant')) {
        continueButton = btn as HTMLButtonElement
        break
      }
    }

    if (continueButton) {
      this.log('Clicking "Continuer" after photos')
      await this.clickElement(continueButton)
      await this.sleep(500)
    } else {
      this.log('Warning: Continue button not found after photos')
    }
  }

  async editAd(
    id: string,
    data: Partial<AdPayload>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      window.location.href = `https://www.leboncoin.fr/mes-annonces/${id}/edit`
      await this.sleep(1000)

      if (data.title) {
        const titleInput = (await this.waitForElement(
          this.selectors.titleInput
        )) as HTMLInputElement
        await this.typeIntoField(titleInput, data.title)
      }

      if (data.description) {
        const descriptionTextarea = document.querySelector(this.selectors.descriptionTextarea) as HTMLTextAreaElement
        if (descriptionTextarea) {
          await this.typeIntoField(descriptionTextarea, data.description)
        }
      }

      if (data.price !== undefined) {
        const priceInput = document.querySelector(this.selectors.priceInput) as HTMLInputElement
        if (priceInput) {
          await this.typeIntoField(priceInput, data.price.toString())
        }
      }

      const submitButton = await this.findContinueButton()
      if (submitButton) {
        await this.clickElement(submitButton)
      }

      await this.sleep(500)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async deleteAd(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      window.location.href = `https://www.leboncoin.fr/mes-annonces/${id}`
      await this.sleep(1000)

      const deleteButton = (await this.waitForElement(
        'button[data-qa-id="delete-ad"]'
      )) as HTMLButtonElement
      await this.clickElement(deleteButton)

      const confirmButton = (await this.waitForElement(
        'button[data-qa-id="confirm-delete"]'
      )) as HTMLButtonElement
      await this.clickElement(confirmButton)

      await this.sleep(500)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async republishAd(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // LeBonCoin has a "Remonter mon annonce" feature
      window.location.href = `https://www.leboncoin.fr/mes-annonces/${id}`
      await this.sleep(1000)

      const boostButton = (await this.waitForElement(
        'button[data-qa-id="boost-ad"]'
      )) as HTMLButtonElement
      await this.clickElement(boostButton)

      // Confirm boost (may require payment)
      const confirmButton = (await this.waitForElement(
        'button[data-qa-id="confirm-boost"]'
      )) as HTMLButtonElement
      await this.clickElement(confirmButton)

      await this.sleep(500)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async fetchStats(id: string): Promise<AdStats> {
    if (!window.location.pathname.includes(id)) {
      window.location.href = `https://www.leboncoin.fr/${id}.htm`
      await this.sleep(1000)
    }

    const statsContainer = document.querySelector(this.selectors.statsContainer)

    if (!statsContainer) {
      return {
        id,
        platform: 'leboncoin',
        views: 0,
        favorites: 0,
        messages: 0,
        lastUpdated: new Date(),
        status: 'active',
      }
    }

    const viewsElement = statsContainer.querySelector(this.selectors.viewsCount)
    const favoritesElement = statsContainer.querySelector(this.selectors.favoritesCount)

    return {
      id,
      platform: 'leboncoin',
      views: viewsElement ? this.extractNumber(viewsElement.textContent || '0') : 0,
      favorites: favoritesElement ? this.extractNumber(favoritesElement.textContent || '0') : 0,
      messages: 0,
      lastUpdated: new Date(),
      status: 'active',
    }
  }

  async fetchMessages(): Promise<MessageThread[]> {
    if (!window.location.pathname.includes('/messages')) {
      window.location.href = 'https://www.leboncoin.fr/messages'
      await this.sleep(1000)
    }

    const threads: MessageThread[] = []
    const threadElements = await this.waitForElements(this.selectors.threadItem)

    for (const threadEl of Array.from(threadElements)) {
      try {
        const threadId = threadEl.getAttribute('data-thread-id') || ''
        const adTitle =
          threadEl.querySelector('[data-qa-id="thread-ad-title"]')?.textContent || ''
        const participantName =
          threadEl.querySelector('[data-qa-id="thread-participant"]')?.textContent || ''
        const lastMessageText =
          threadEl.querySelector('[data-qa-id="last-message"]')?.textContent || ''
        const unreadBadge = threadEl.querySelector('[data-qa-id="unread-badge"]')
        const unreadCount = unreadBadge ? this.extractNumber(unreadBadge.textContent || '0') : 0

        threads.push({
          id: threadId,
          platform: 'leboncoin',
          adId: '',
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

  async sendMessage(
    threadId: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      window.location.href = `https://www.leboncoin.fr/messages/${threadId}`
      await this.sleep(1000)

      const messageInput = (await this.waitForElement(
        this.selectors.messageInput
      )) as HTMLTextAreaElement
      await this.typeIntoField(messageInput, message)

      const sendButton = (await this.waitForElement(
        this.selectors.sendButton
      )) as HTMLButtonElement
      await this.clickElement(sendButton)

      await this.sleep(500)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async markAsRead(threadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      window.location.href = `https://www.leboncoin.fr/messages/${threadId}`
      await this.sleep(500)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}
