import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import type { ExtensionSettings } from '../types'

const Options: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettings>({
    apiUrl: 'http://localhost:3000',
    apiKey: '',
    autoSync: true,
    syncInterval: 30,
    notifications: true,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const result = await browser.storage.local.get('settings')
    if (result && result.settings) {
      setSettings(result.settings ? { ...settings, ...result.settings } : settings)
    }
  }

  const saveSettings = async () => {
    await browser.storage.local.set({ settings })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '30px' }}>⚙️ Annoncify - Options</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          URL de l'API Annoncify
        </label>
        <input
          type="text"
          value={settings.apiUrl}
          onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
        <small style={{ color: '#666' }}>URL de votre instance Next.js</small>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Clé API (optionnel)
        </label>
        <input
          type="password"
          value={settings.apiKey || ''}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          style={{ width: '100%', padding: '8px', fontSize: '14px' }}
        />
        <small style={{ color: '#666' }}>Clé d'authentification si requise</small>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={settings.autoSync}
            onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
          />
          <span>Synchronisation automatique</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Intervalle de synchronisation (minutes)
        </label>
        <input
          type="number"
          value={settings.syncInterval}
          onChange={(e) =>
            setSettings({ ...settings, syncInterval: parseInt(e.target.value) || 30 })
          }
          disabled={!settings.autoSync}
          style={{ width: '200px', padding: '8px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
          />
          <span>Activer les notifications</span>
        </label>
      </div>

      <button
        onClick={saveSettings}
        style={{
          padding: '12px 24px',
          background: '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        💾 Sauvegarder
      </button>

      {saved && (
        <span style={{ marginLeft: '15px', color: 'green', fontWeight: 'bold' }}>
          ✓ Paramètres sauvegardés
        </span>
      )}
    </div>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<Options />)
}
