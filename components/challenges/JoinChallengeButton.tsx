'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface JoinChallengeButtonProps {
  challengeId: string
}

export function JoinChallengeButton({ challengeId }: JoinChallengeButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Vous devez être connecté')
        return
      }

      // Ajouter l'utilisateur comme membre du défi
      const { error: insertError } = await supabase
        .from('challenge_members')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          role: 'member',
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Rediriger vers la page du défi
      router.push(`/challenges/${challengeId}`)
    } catch (err) {
      console.error('Error joining challenge:', err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="primary"
        onClick={handleJoin}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Inscription...' : 'Rejoindre ce défi'}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
