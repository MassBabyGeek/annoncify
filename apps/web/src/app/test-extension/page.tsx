'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@annoncify/ui'

/**
 * Page de test pour l'extension Chrome (sans authentification)
 * Permet de tester directement la publication sur LeBonCoin
 */
export default function TestExtensionPage() {
  const [formData, setFormData] = useState({
    title: 'iPhone 13 Pro Max 256GB',
    description: 'iPhone 13 Pro Max en très bon état, 256GB, couleur graphite. Toujours sous garantie Apple.',
    price: '799',
    category: 'informatique',
    condition: 'good',
    location: 'Paris',
    zipCode: '75001',
    imageUrls: ['https://picsum.photos/400/300?random=1']
  })

  const handlePublishToLeBonCoin = () => {
    console.log('[TEST] Publishing to LeBonCoin...', formData)

    // Format the data as expected by the extension
    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      condition: formData.condition,
      images: formData.imageUrls,
      location: {
        city: formData.location,
        zipCode: formData.zipCode
      }
    }

    // Send message to extension
    window.postMessage({
      type: 'ANNONCIFY_PUBLISH',
      action: 'PUBLISH_LISTING',
      payload: {
        listingId: 'test-' + Date.now(),
        publicationId: 'pub-' + Date.now(),
        platform: 'leboncoin',
        data: payload // Send data directly
      },
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
    }, '*')

    console.log('[TEST] Message sent to extension')
    alert('Message envoyé à l\'extension ! Vérifiez qu\'un nouvel onglet LeBonCoin s\'ouvre.')
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Extension Chrome - LeBonCoin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-brand-gray-400 mb-4">
            Cette page permet de tester l'extension Chrome sans authentification.
            Cliquez sur "Publier sur LeBonCoin" pour envoyer les données à l'extension.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Données de test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Ville</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Code postal</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrls">URL de l'image</Label>
            <Input
              id="imageUrls"
              value={formData.imageUrls[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrls: [e.target.value] }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handlePublishToLeBonCoin}
          size="lg"
          className="bg-orange-600 hover:bg-orange-700"
        >
          🏠 Publier sur LeBonCoin (Test)
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-brand-gray-400">
          <p>1. Assurez-vous que l'extension Chrome est installée et active</p>
          <p>2. Modifiez les données si nécessaire</p>
          <p>3. Cliquez sur "Publier sur LeBonCoin"</p>
          <p>4. Un nouvel onglet LeBonCoin devrait s'ouvrir</p>
          <p>5. L'extension devrait remplir automatiquement le formulaire</p>
        </CardContent>
      </Card>
    </div>
  )
}
