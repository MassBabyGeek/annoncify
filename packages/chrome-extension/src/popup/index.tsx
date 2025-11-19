import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'

const Popup: React.FC = () => {
  const [platform, setPlatform] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    detectPlatform()
  }, [])

  const detectPlatform = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id) {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
          action: 'GET_ACTIVE_PLATFORM',
          timestamp: Date.now(),
          requestId: crypto.randomUUID(),
        }) as { success: boolean; data?: { platform: string }; error?: string }

        if (response && response.success && response.data?.platform) {
          setPlatform(response.data.platform)
        } else {
          setPlatform(null)
        }
      }
    } catch (error) {
      console.error('Failed to detect platform:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement...</div>
      </div>
    )
  }

  if (!platform) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Annoncify</h1>
        </div>
        <div style={styles.content}>
          <div style={styles.emptyState}>
            <div style={styles.icon}>📦</div>
            <p style={styles.message}>
              Naviguez vers Vinted ou LeBonCoin pour utiliser l'extension
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Annoncify</h1>
        <div style={styles.badge}>{platform}</div>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Actions Rapides</h2>

          <button
            style={styles.button}
            onClick={async () => {
              const tabs = await browser.tabs.query({ active: true, currentWindow: true })
              if (tabs[0]?.id) {
                // Redirect to create ad page based on platform
                const createUrls: Record<string, string> = {
                  vinted: 'https://www.vinted.fr/items/new',
                  leboncoin: 'https://www.leboncoin.fr/deposer-une-annonce',
                }
                const url = createUrls[platform || '']
                if (url) {
                  await browser.tabs.update(tabs[0].id, { url })
                  window.close()
                }
              }
            }}
          >
            📝 Créer une annonce
          </button>

          <button
            style={styles.button}
            onClick={async () => {
              const tabs = await browser.tabs.query({ active: true, currentWindow: true })
              if (tabs[0]?.id) {
                const statsUrls: Record<string, string> = {
                  vinted: 'https://www.vinted.fr/member/general/my_items',
                  leboncoin: 'https://www.leboncoin.fr/mes-annonces',
                }
                const url = statsUrls[platform || '']
                if (url) {
                  await browser.tabs.update(tabs[0].id, { url })
                  window.close()
                }
              }
            }}
          >
            📊 Voir les statistiques
          </button>

          <button
            style={styles.button}
            onClick={async () => {
              const tabs = await browser.tabs.query({ active: true, currentWindow: true })
              if (tabs[0]?.id) {
                const messagesUrls: Record<string, string> = {
                  vinted: 'https://www.vinted.fr/inbox',
                  leboncoin: 'https://www.leboncoin.fr/messages',
                }
                const url = messagesUrls[platform || '']
                if (url) {
                  await browser.tabs.update(tabs[0].id, { url })
                  window.close()
                }
              }
            }}
          >
            💬 Gérer les messages
          </button>

          <button
            style={styles.button}
            onClick={async () => {
              try {
                const tabs = await browser.tabs.query({ active: true, currentWindow: true })
                if (tabs[0]?.id) {
                  const response = await browser.tabs.sendMessage(tabs[0].id, {
                    action: 'SYNC_TO_SERVER',
                    payload: { platform },
                    timestamp: Date.now(),
                    requestId: crypto.randomUUID(),
                  }) as { success: boolean; error?: string }

                  if (response && response.success) {
                    alert('Synchronisation réussie !')
                  } else {
                    alert('Erreur de synchronisation')
                  }
                }
              } catch (error) {
                console.error('Sync error:', error)
                alert('Erreur de synchronisation')
              }
            }}
          >
            🔄 Synchroniser
          </button>
        </div>

        <div style={styles.footer}>
          <a
            href="http://localhost:3000/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            Ouvrir le Dashboard →
          </a>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '350px',
    minHeight: '400px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    color: '#ffffff',
  },
  header: {
    padding: '20px',
    background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  badge: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  content: {
    padding: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  message: {
    color: '#888',
    lineHeight: '1.5',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#f59e0b',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginBottom: '8px',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  footer: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  link: {
    color: '#f59e0b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
  },
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<Popup />)
}

export {}