import { redirect } from 'next/navigation'
import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { Container } from '@/components/layout/Container'
import { Card, CardContent } from '@/components/ui/Card'

export default async function DebugActivitiesPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Tester la récupération des activités
  const { data: activities, error: activitiesError } = await supabase
    .from('activity_snapshots')
    .select('*')
    .eq('user_id', profile.id)
    .order('start_date', { ascending: false })

  // Récupérer l'utilisateur authentifié
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Container className="py-8">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Debug - Activités</h1>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold">Profile ID:</h2>
              <p className="text-sm text-gray-600">{profile.id}</p>
            </div>

            <div>
              <h2 className="font-semibold">Auth User ID:</h2>
              <p className="text-sm text-gray-600">{user?.id || 'Not found'}</p>
            </div>

            <div>
              <h2 className="font-semibold">IDs Match:</h2>
              <p className="text-sm text-gray-600">
                {user?.id === profile.id ? '✅ Yes' : '❌ No'}
              </p>
            </div>

            {activitiesError && (
              <div>
                <h2 className="font-semibold text-red-600">Error:</h2>
                <pre className="text-xs bg-red-50 p-2 rounded">
                  {JSON.stringify(activitiesError, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <h2 className="font-semibold">Activities Count:</h2>
              <p className="text-sm text-gray-600">
                {activities?.length || 0} activités trouvées
              </p>
            </div>

            {activities && activities.length > 0 && (
              <div>
                <h2 className="font-semibold">Activities:</h2>
                <div className="text-xs bg-gray-50 p-2 rounded max-h-96 overflow-auto">
                  <pre>{JSON.stringify(activities, null, 2)}</pre>
                </div>
              </div>
            )}

            {activities && activities.length === 0 && !activitiesError && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ Aucune activité trouvée pour user_id = {profile.id}
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Vérifiez que les activités ont bien été synchronisées et que
                  les RLS policies permettent de les lire.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
