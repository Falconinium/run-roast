'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface DeleteChallengeButtonProps {
  challengeId: string
}

export function DeleteChallengeButton({ challengeId }: DeleteChallengeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
        setDeleting(false)
        setShowConfirm(false)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Erreur lors de la suppression')
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (!showConfirm) {
    return (
      <Button
        variant="secondary"
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:bg-red-50 border-red-200 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Supprimer</span>
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm">
        <p className="text-red-800 font-semibold mb-2">Êtes-vous sûr ?</p>
        <p className="text-red-600 text-xs mb-3">
          Cette action est irréversible. Tous les membres perdront l'accès au défi.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Suppression...' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  )
}
