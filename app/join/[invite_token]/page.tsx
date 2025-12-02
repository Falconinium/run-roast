import { redirect } from 'next/navigation'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { JoinChallengeButton } from '@/components/challenges/JoinChallengeButton'

interface JoinPageProps {
  params: Promise<{
    invite_token: string
  }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { invite_token } = await params
  const user = await getCurrentUser()

  // Si l'utilisateur n'est pas connecté, le rediriger vers la page de login
  if (!user) {
    redirect(`/login?redirect=/join/${invite_token}`)
  }

  const supabase = await createClient()

  // Récupérer le défi via le token d'invitation
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*, profiles(*)')
    .eq('invite_token', invite_token)
    .single()

  if (challengeError || !challenge) {
    return (
      <Container maxWidth="md" className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Défi introuvable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Ce lien d'invitation n'est pas valide ou a expiré.
            </p>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Vérifier si l'utilisateur est déjà membre
  const { data: existingMember } = await supabase
    .from('challenge_members')
    .select('*')
    .eq('challenge_id', challenge.id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    redirect(`/challenges/${challenge.id}`)
  }

  return (
    <Container maxWidth="md" className="py-12">
      <Card>
        <CardHeader>
          <CardTitle>Rejoindre un défi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {challenge.title}
            </h2>
            {challenge.description && (
              <p className="text-gray-600 mb-4">{challenge.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Sport:</span>
              <p className="font-medium capitalize">{challenge.sport}</p>
            </div>
            <div>
              <span className="text-gray-500">Métrique:</span>
              <p className="font-medium capitalize">{challenge.metric}</p>
            </div>
            <div>
              <span className="text-gray-500">Début:</span>
              <p className="font-medium">
                {new Date(challenge.start_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Fin:</span>
              <p className="font-medium">
                {new Date(challenge.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Créé par: <span className="font-medium">{challenge.profiles.full_name || challenge.profiles.email}</span>
            </p>
            <JoinChallengeButton challengeId={challenge.id} />
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
