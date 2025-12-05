import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { InviteLinkSection } from '@/components/challenges/InviteLinkSection'
import { Leaderboard } from '@/components/challenges/Leaderboard'
import { DeleteChallengeButton } from '@/components/challenges/DeleteChallengeButton'
import { calculateLeaderboard } from '@/lib/leaderboard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChallengePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Récupérer le défi avec les informations du propriétaire
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (challengeError || !challenge) {
    return (
      <Container maxWidth="lg" className="py-12">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Défi introuvable</p>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Vérifier que l'utilisateur est membre du défi
  const { data: membership } = await supabase
    .from('challenge_members')
    .select('*')
    .eq('challenge_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect(`/join/${challenge.invite_token}`)
  }

  // Récupérer tous les membres du défi avec leurs profils
  const { data: members } = await supabase
    .from('challenge_members')
    .select('user_id, profiles(*)')
    .eq('challenge_id', id)

  // Récupérer toutes les activités des membres dans la période du défi
  const memberIds = members?.map(m => m.user_id) || []

  const { data: activities } = await supabase
    .from('activity_snapshots')
    .select('*')
    .in('user_id', memberIds)

  // Récupérer les connexions Strava des membres pour les photos de profil
  const { data: stravaConnections } = await supabase
    .from('strava_connections')
    .select('user_id, athlete_firstname, athlete_lastname, athlete_profile_image')
    .in('user_id', memberIds)

  // Calculer le leaderboard
  const leaderboardData = calculateLeaderboard(
    challenge,
    members || [],
    activities || []
  )

  const isOwner = challenge.owner_id === user.id

  return (
    <Container maxWidth="lg" className="py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Bouton retour */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base">Retour au dashboard</span>
        </Link>

        {/* En-tête du défi */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl break-words">{challenge.title}</CardTitle>
                {challenge.description && (
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">{challenge.description}</p>
                )}
              </div>
              {isOwner && (
                <div className="flex-shrink-0">
                  <DeleteChallengeButton challengeId={challenge.id} />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Sport</span>
                <p className="font-medium capitalize text-sm sm:text-base">{challenge.sport}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Métrique</span>
                <p className="font-medium capitalize text-sm sm:text-base">{challenge.metric}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Début</span>
                <p className="font-medium text-sm sm:text-base">
                  {format(new Date(challenge.start_date), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Fin</span>
                <p className="font-medium text-sm sm:text-base">
                  {format(new Date(challenge.end_date), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section d'invitation (uniquement pour le propriétaire) */}
        {isOwner && (
          <InviteLinkSection inviteToken={challenge.invite_token} />
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent>
            <Leaderboard
              entries={leaderboardData}
              metric={challenge.metric}
              currentUserId={user.id}
              stravaConnections={stravaConnections || []}
            />
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Participants ({members?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2">
              {members?.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {member.profiles.full_name || 'Athlète'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {member.profiles.email}
                    </p>
                  </div>
                  {member.user_id === challenge.owner_id && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded whitespace-nowrap flex-shrink-0">
                      Organisateur
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
