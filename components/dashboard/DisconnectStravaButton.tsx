'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function DisconnectStravaButton() {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDisconnect = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/strava/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      // Rafraîchir la page pour mettre à jour l'UI
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      console.error('Error disconnecting Strava:', error)
      alert('Erreur lors de la déconnexion de Strava')
    } finally {
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
      >
        Déconnecter Strava
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">
        Êtes-vous sûr de vouloir déconnecter votre compte Strava ?
      </p>
      <div className="flex gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDisconnect}
          disabled={loading}
        >
          {loading ? 'Déconnexion...' : 'Oui, déconnecter'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </div>
  )
}
