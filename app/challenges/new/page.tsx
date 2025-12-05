'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { generateInviteToken } from '@/lib/utils'

const SPORT_OPTIONS = [
  { value: 'run', label: 'Course à pied' },
  { value: 'ride', label: 'Vélo' },
  { value: 'hike', label: 'Randonnée' },
  { value: 'walk', label: 'Marche' },
  { value: 'swim', label: 'Natation' },
  { value: 'other', label: 'Autre' },
]

const METRIC_OPTIONS = [
  { value: 'distance', label: 'Distance totale' },
  { value: 'time', label: 'Temps total' },
  { value: 'elevation', label: 'Dénivelé total' },
  { value: 'count', label: "Nombre d'activités" },
]

export default function NewChallengePage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sport, setSport] = useState('run')
  const [metric, setMetric] = useState('distance')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Vous devez être connecté pour créer un défi')
        return
      }

      // Générer un token d'invitation unique
      const inviteToken = generateInviteToken()

      // Créer le défi
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          owner_id: user.id,
          title,
          description,
          sport,
          metric,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          invite_token: inviteToken,
          visibility: 'private',
        })
        .select()
        .single()

      if (challengeError) {
        setError(challengeError.message)
        return
      }

      // Ajouter le créateur comme membre avec le rôle 'owner'
      const { error: memberError } = await supabase
        .from('challenge_members')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          role: 'owner',
        })

      if (memberError) {
        console.error('Error adding owner as member:', memberError)
      }

      // Rediriger vers la page du défi créé
      router.push(`/challenges/${challenge.id}`)
      router.refresh()
    } catch (err) {
      console.error('Error creating challenge:', err)
      setError('Une erreur est survenue lors de la création du défi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30 py-4 sm:py-8">
      <Container maxWidth="md">
        {/* Header with back button */}
        <div className="mb-4 sm:mb-6 px-4 sm:px-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Retour</span>
          </button>
        </div>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 mx-4 sm:mx-0">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-blue-50 border-b-2 border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl">Créer un nouveau défi</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Lancez un challenge pour vos amis</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Titre du défi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Qui court le plus en janvier ?"
            />

            <Textarea
              label="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre défi..."
              rows={3}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Type de sport"
                options={SPORT_OPTIONS}
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                required
              />

              <Select
                label="Métrique de classement"
                options={METRIC_OPTIONS}
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <DatePicker
                label="Date de début"
                value={startDate}
                onChange={setStartDate}
                required
              />

              <DatePicker
                label="Date de fin"
                value={endDate}
                onChange={setEndDate}
                required
                minDate={startDate}
              />
            </div>

            {/* Submit button */}
            <div className="pt-6 border-t border-gray-100">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-semibold">Créer le défi</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Vous pourrez inviter vos amis après la création
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
    </div>
  )
}
