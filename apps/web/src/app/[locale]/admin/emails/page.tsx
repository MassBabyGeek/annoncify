'use client'

import { useEffect, useState } from 'react'
import { Button } from '@annoncify/ui'
import { Plus, Mail, Send, Edit, Trash2, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  trigger: string
  status: string
  createdAt: string
  _count: {
    logs: number
  }
}

interface EmailStats {
  totalTemplates: number
  totalCampaigns: number
  totalEmailsSent: number
  openRate: number
  clickRate: number
}

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
    fetchStats()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/admin/email/templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/email/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const res = await fetch(`/api/admin/email/templates/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('Erreur lors de la suppression du template')
    }
  }

  async function sendTestEmail(id: string) {
    const email = prompt('Entrez votre adresse email pour recevoir un email de test:')
    if (!email) return

    try {
      const res = await fetch(`/api/admin/email/templates/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success) {
        alert('Email de test envoyé avec succès !')
      } else {
        alert(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      alert('Erreur lors de l\'envoi de l\'email de test')
    }
  }

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      USER_CREATED: 'Création de compte',
      USER_VERIFIED: 'Email vérifié',
      SUBSCRIPTION_STARTED: 'Nouvel abonnement',
      SUBSCRIPTION_RENEWED: 'Renouvellement',
      SUBSCRIPTION_CANCELLED: 'Annulation',
      SUBSCRIPTION_ENDING: 'Abonnement expire bientôt',
      LISTING_PUBLISHED: 'Annonce publiée',
      LISTING_SOLD: 'Annonce vendue',
      LISTING_EXPIRED: 'Annonce expirée',
      IMPORT_COMPLETED: 'Import terminé',
      INACTIVE_USER: 'Utilisateur inactif',
      MANUAL: 'Manuel',
    }
    return labels[trigger] || trigger
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-500',
      ACTIVE: 'bg-green-500',
      PAUSED: 'bg-yellow-500',
      ARCHIVED: 'bg-gray-400',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs text-white ${colors[status] || 'bg-gray-500'}`}
      >
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-brand-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Gestion des Emails</h1>
        <p className="text-brand-gray-400 mt-2">
          Gérez les templates d'email et les campagnes marketing
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-brand-gray-800 rounded-lg p-6 border border-brand-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-brand-primary" />
              <span className="text-sm text-brand-gray-400">Templates</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalTemplates}</div>
          </div>

          <div className="bg-brand-gray-800 rounded-lg p-6 border border-brand-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-brand-gray-400">Campagnes</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalCampaigns}</div>
          </div>

          <div className="bg-brand-gray-800 rounded-lg p-6 border border-brand-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Send className="h-5 w-5 text-green-500" />
              <span className="text-sm text-brand-gray-400">Emails envoyés</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalEmailsSent}</div>
          </div>

          <div className="bg-brand-gray-800 rounded-lg p-6 border border-brand-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-brand-gray-400">Taux d'ouverture</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.openRate}%</div>
          </div>

          <div className="bg-brand-gray-800 rounded-lg p-6 border border-brand-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-brand-gray-400">Taux de clic</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.clickRate}%</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/emails/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
        </Link>
        <Link href="/admin/emails/campaigns/new">
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Nouvelle Campagne
          </Button>
        </Link>
      </div>

      {/* Templates Table */}
      <div className="bg-brand-gray-800 rounded-lg border border-brand-gray-700 overflow-hidden">
        <div className="p-6 border-b border-brand-gray-700">
          <h2 className="text-xl font-semibold text-white">Templates d'Email</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-400 uppercase tracking-wider">
                  Déclencheur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-400 uppercase tracking-wider">
                  Emails envoyés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-400 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-brand-gray-800 divide-y divide-brand-gray-700">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-gray-500">
                    Aucun template trouvé. Créez votre premier template !
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-brand-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{template.name}</div>
                        <div className="text-xs text-brand-gray-400 mt-1">{template.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-brand-gray-300">
                        {getTriggerLabel(template.trigger)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(template.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-brand-gray-300">{template._count.logs}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-brand-gray-300">
                        {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sendTestEmail(template.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/emails/templates/${template.id}`}>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
