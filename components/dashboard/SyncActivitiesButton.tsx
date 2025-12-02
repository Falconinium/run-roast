'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function SyncActivitiesButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState<string[]>([])
  const router = useRouter()

  const handleSync = async () => {
    setLoading(true)
    setMessage('')
    setErrorDetails([])

    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Erreur lors de la synchronisation')
        if (data.details && Array.isArray(data.details)) {
          setErrorDetails(data.details)
        }
        return
      }

      setMessage(data.message || 'Synchronisation réussie')
      router.refresh()
    } catch (error) {
      setMessage('Erreur lors de la synchronisation')
      console.error('Sync error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        onClick={handleSync}
        disabled={loading}
      >
        {loading ? 'Synchronisation...' : 'Synchroniser mes activités'}
      </Button>
      {message && (
        <div className={`text-sm ${message.includes('Erreur') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
          <p>{message}</p>
          {errorDetails.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs underline">
                Voir les détails des erreurs
              </summary>
              <ul className="mt-1 ml-4 text-xs list-disc">
                {errorDetails.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
