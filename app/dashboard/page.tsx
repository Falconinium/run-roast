import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { StravaConnectionStatus } from '@/components/dashboard/StravaConnectionStatus'
import { SyncActivitiesButton } from '@/components/dashboard/SyncActivitiesButton'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { UserStats } from '@/components/dashboard/UserStats'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { AchievementsSection } from '@/components/dashboard/AchievementsSection'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Récupérer la connexion Strava
  const { data: stravaConnection } = await supabase
    .from('strava_connections')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  // Récupérer les défis dont l'utilisateur est propriétaire
  const { data: ownedChallenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false })

  // Récupérer les défis auxquels l'utilisateur participe
  const { data: memberChallenges } = await supabase
    .from('challenge_members')
    .select('*, challenges(*)')
    .eq('user_id', profile.id)
    .neq('role', 'owner')
    .order('created_at', { ascending: false })

  // Récupérer les 3 dernières activités de l'utilisateur si Strava est connecté
  let recentActivities: any[] = []
  if (stravaConnection) {
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_snapshots')
      .select('*')
      .eq('user_id', profile.id)
      .order('start_date', { ascending: false })
      .limit(3)

    if (activitiesError) {
      console.error('Error fetching recent activities:', activitiesError)
    } else {
      console.log('Recent activities fetched:', activities?.length || 0)
    }

    recentActivities = activities || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30">
      <Container className="py-8">
        <div className="space-y-8">
          {/* Header with gradient background */}
          <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 shadow-xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Bienvenue, {profile.full_name || 'Athlète'} 👋
                </h1>
                <p className="text-orange-100 mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {profile.email}
                </p>
              </div>
              {stravaConnection ? (
                <Link href="/challenges/new">
                  <div className="group relative">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-white rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Button */}
                    <div className="relative px-8 py-4 bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:scale-105">
                      <div className="flex items-center gap-3">
                        {/* Icon with gradient background */}
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>

                        {/* Text */}
                        <div className="flex flex-col">
                          <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                            Créer un défi
                          </span>
                          <span className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                            Lancez un nouveau challenge
                          </span>
                        </div>

                        {/* Arrow */}
                        <svg className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="group relative" title="Connectez Strava pour créer des défis">
                  {/* Disabled glow effect */}
                  <div className="absolute -inset-1 bg-gray-200 rounded-2xl blur-lg opacity-50"></div>

                  {/* Disabled Button */}
                  <div className="relative px-8 py-4 bg-gray-100 rounded-xl shadow-lg opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      {/* Icon with gray background */}
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>

                      {/* Text */}
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-500">
                          Créer un défi
                        </span>
                        <span className="text-xs text-gray-400">
                          Connectez Strava d'abord
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats en temps réel */}
          {stravaConnection && (
            <div>
              <div className="mb-6">
                <div className="inline-block mb-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-semibold">
                    📊 Performance
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Vos statistiques</h2>
              </div>
              <UserStats userId={profile.id} />
            </div>
          )}

          {/* Statut de connexion Strava */}
          <Card className="border-2 hover:border-orange-200 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Connexion Strava</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <StravaConnectionStatus stravaConnection={stravaConnection} />
              {stravaConnection && (
                <div className="mt-4">
                  <SyncActivitiesButton />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graph de progression + Activités récentes */}
          {stravaConnection && recentActivities.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-xl group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">Progression (30 derniers jours)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivityChart userId={profile.id} />
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-xl group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <CardTitle className="text-xl group-hover:text-green-600 transition-colors">Dernières activités</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <RecentActivities activities={recentActivities} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mes défis */}
          <div>
            <div className="mb-6">
              <div className="inline-block mb-2">
                <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full text-sm font-semibold">
                  🏆 Organisateur
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Mes défis</h2>
            </div>
            {ownedChallenges && ownedChallenges.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {ownedChallenges.map((challenge) => (
                  stravaConnection ? (
                    <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                      <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-300 hover:scale-[1.02] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative">
                          <CardTitle className="text-xl group-hover:text-orange-600 transition-colors">{challenge.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm mb-4">
                            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-lg font-semibold">
                              {challenge.sport}
                            </span>
                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg font-semibold">
                              {challenge.metric}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(challenge.start_date), 'dd MMM', { locale: fr })} - {format(new Date(challenge.end_date), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <div key={challenge.id} className="relative" title="Connectez Strava pour accéder à ce défi">
                      <Card className="relative border-2 border-gray-200 overflow-hidden opacity-60 cursor-not-allowed">
                        {/* Lock overlay */}
                        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Connectez Strava</p>
                            <p className="text-xs text-gray-500">pour accéder à ce défi</p>
                          </div>
                        </div>

                        {/* Blurred card content */}
                        <CardHeader className="relative">
                          <CardTitle className="text-xl text-gray-500">{challenge.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm mb-4">
                            <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg font-semibold">
                              {challenge.sport}
                            </span>
                            <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg font-semibold">
                              {challenge.metric}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(challenge.start_date), 'dd MMM', { locale: fr })} - {format(new Date(challenge.end_date), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 hover:border-orange-300 transition-all duration-300">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">
                    Vous n'avez pas encore créé de défi
                  </p>
                  {stravaConnection ? (
                    <Link href="/challenges/new">
                      <Button variant="primary" className="shadow-lg hover:shadow-xl">
                        Créer mon premier défi
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      disabled
                      className="shadow-lg opacity-60 cursor-not-allowed"
                      title="Connectez Strava pour créer des défis"
                    >
                      Créer mon premier défi
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Achievements et niveaux */}
          {stravaConnection && (
            <div>
              <div className="mb-6">
                <div className="inline-block mb-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold">
                    🎮 Gamification
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Vos achievements</h2>
              </div>
              <AchievementsSection userId={profile.id} />
            </div>
          )}

          {/* Défis auxquels je participe */}
          {memberChallenges && memberChallenges.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="inline-block mb-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-sm font-semibold">
                    🎯 Participant
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Mes participations</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {memberChallenges.map((member) => {
                  const challenge = member.challenges
                  if (!challenge) return null

                  return stravaConnection ? (
                    <Link key={member.id} href={`/challenges/${challenge.id}`}>
                      <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-green-300 hover:scale-[1.02] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative">
                          <CardTitle className="text-xl group-hover:text-green-600 transition-colors">{challenge.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm mb-4">
                            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-lg font-semibold">
                              {challenge.sport}
                            </span>
                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg font-semibold">
                              {challenge.metric}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(challenge.start_date), 'dd MMM', { locale: fr })} - {format(new Date(challenge.end_date), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <div key={member.id} className="relative" title="Connectez Strava pour accéder à ce défi">
                      <Card className="relative border-2 border-gray-200 overflow-hidden opacity-60 cursor-not-allowed">
                        {/* Lock overlay */}
                        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Connectez Strava</p>
                            <p className="text-xs text-gray-500">pour accéder à ce défi</p>
                          </div>
                        </div>

                        {/* Blurred card content */}
                        <CardHeader className="relative">
                          <CardTitle className="text-xl text-gray-500">{challenge.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm mb-4">
                            <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg font-semibold">
                              {challenge.sport}
                            </span>
                            <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg font-semibold">
                              {challenge.metric}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(challenge.start_date), 'dd MMM', { locale: fr })} - {format(new Date(challenge.end_date), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
