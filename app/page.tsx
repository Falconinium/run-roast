import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { getCurrentUser } from '@/lib/supabase/server'
import { HeroAnimation } from '@/components/landing/HeroAnimation'

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <>
      {/* Hero Section with Animation */}
      <div className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Container maxWidth="lg" className="relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center md:text-left space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold animate-bounce">
                  🏃 Nouveau : Challenges en temps réel
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Défiez vos amis sur{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  Strava
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                Créez des défis sportifs privés, invitez vos amis et suivez qui domine le classement en temps réel.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center pt-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="primary" size="lg" className="group">
                      Accéder au Dashboard
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button variant="primary" size="lg" className="group">
                        Commencer gratuitement
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="secondary" size="lg">
                        Se connecter
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 justify-center md:justify-start pt-8 text-center md:text-left">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Défis créés</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">10k+</div>
                  <div className="text-sm text-gray-600">Activités trackées</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Kilomètres parcourus</div>
                </div>
              </div>
            </div>

            {/* Right: Animation */}
            <div className="hidden md:block">
              <HeroAnimation />
            </div>
          </div>
        </Container>
      </div>

      {/* How it works section */}
      <div className="relative py-24 bg-gradient-to-br from-blue-50/20 via-white to-orange-50/30 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <Container maxWidth="lg" className="relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full text-sm font-semibold">
                Simple et rapide
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Lancez votre premier défi en 3 étapes simples et commencez à challenger vos amis
            </p>
          </div>

          <div className="relative">
            {/* Connection line - curved path */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 -z-10">
              <svg className="w-full h-24" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path
                  d="M0,50 Q250,20 500,50 T1000,50"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fed7aa" />
                    <stop offset="50%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#fed7aa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="relative group">
                <div className="relative bg-white rounded-3xl p-8 pt-12 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-orange-200 overflow-hidden">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating badge - inside card */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        1
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </div>
                  </div>

                  <div className="relative mt-4 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-orange-200 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                      Connectez Strava
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Créez un compte et connectez votre profil Strava en un clic. Vos données restent privées et sécurisées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group md:mt-8">
                <div className="relative bg-white rounded-3xl p-8 pt-12 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-200 overflow-hidden">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating badge - inside card */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        2
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </div>
                  </div>

                  <div className="relative mt-4 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-blue-200 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      Créez votre défi
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Définissez le type de sport, la métrique (distance, temps, dénivelé) et la durée. Obtenez un lien d'invitation unique.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="relative bg-white rounded-3xl p-8 pt-12 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-200 overflow-hidden">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating badge - inside card */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        3
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </div>
                  </div>

                  <div className="relative mt-4 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-green-200 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                      Suivez le classement
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Invitez vos amis et regardez le leaderboard se mettre à jour automatiquement avec vos activités Strava.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            {!user && (
              <div className="inline-flex flex-col items-center gap-4">
                <Link href="/signup">
                  <Button variant="primary" size="lg" className="group shadow-xl hover:shadow-2xl">
                    Créer mon premier défi gratuitement
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">Aucune carte bancaire requise</p>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Features section */}
      <div className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <Container maxWidth="lg" className="relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold">
                Plateforme complète
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi Run&Roast ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Toutes les fonctionnalités dont vous avez besoin pour créer des défis sportifs engageants et suivre vos performances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="relative p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-orange-50/50 transition-all duration-500 border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Synchronisation automatique</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Vos activités Strava se synchronisent automatiquement. Pas besoin de saisir manuellement vos performances.
                  </p>
                  <div className="mt-4 inline-flex items-center text-orange-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="relative p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50 transition-all duration-500 border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Privé et sécurisé</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Vos défis restent privés. Seuls les invités peuvent y accéder. Vos données sont protégées.
                  </p>
                  <div className="mt-4 inline-flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="relative p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50/50 transition-all duration-500 border-2 border-gray-100 hover:border-green-200 hover:shadow-2xl overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Leaderboard en temps réel</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Le classement se met à jour en temps réel. Suivez la compétition et voyez qui domine !
                  </p>
                  <div className="mt-4 inline-flex items-center text-green-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="relative p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-purple-50/50 transition-all duration-500 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Système d'achievements</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Débloquez des trophées et montez de niveau. Gamification complète pour rester motivé.
                  </p>
                  <div className="mt-4 inline-flex items-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className="relative p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-yellow-50/50 transition-all duration-500 border-2 border-gray-100 hover:border-yellow-200 hover:shadow-2xl overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">Défis multi-sports</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Course, vélo, natation et plus. Créez des défis pour tous les types de sport.
                  </p>
                  <div className="mt-4 inline-flex items-center text-yellow-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative">
              <div className="relative p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-pink-50/50 transition-all duration-500 border-2 border-gray-100 hover:border-pink-200 hover:shadow-2xl overflow-hidden">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">Statistiques détaillées</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Graphiques de progression, stats en temps réel et analyse de vos performances.
                  </p>
                  <div className="mt-4 inline-flex items-center text-pink-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    En savoir plus
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Pricing section */}
      <div className="py-24 bg-white">
        <Container maxWidth="lg">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tarification simple et transparente
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement. Passez à la version premium uniquement si vous en avez besoin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative p-8 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">0€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Jusqu'à 3 défis actifs</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Participants illimités</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Synchronisation Strava</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Leaderboard en temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Statistiques basiques</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="secondary" className="w-full">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 shadow-xl scale-105 hover:scale-110 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg">
                  POPULAIRE
                </span>
              </div>
              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">4,99€</span>
                  <span className="text-gray-600">/mois</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Défis illimités</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Statistiques avancées</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Achievements et niveaux</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Graphiques de progression</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Historique complet</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Support prioritaire</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="primary" className="w-full">
                  Essayer premium
                </Button>
              </Link>
            </div>

            {/* Team Plan */}
            <div className="relative p-8 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Équipe</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">19,99€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Jusqu'à 10 utilisateurs</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Tout de Premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Dashboard d'équipe</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Gestion des membres</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Rapports personnalisés</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Support dédié</span>
                </li>
              </ul>
              <Link href="/contact">
                <Button variant="secondary" className="w-full">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <Container maxWidth="lg">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R&R</span>
                </div>
                <span className="text-xl font-bold text-white">Run&Roast</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Créez des défis sportifs privés et suivez vos performances en temps réel avec vos amis.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/features" className="hover:text-orange-400 transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-orange-400 transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-orange-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-orange-400 transition-colors">
                    Commencer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/docs" className="hover:text-orange-400 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-orange-400 transition-colors">
                    Centre d'aide
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-orange-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <a href="https://strava.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                    Strava
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-orange-400 transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-orange-400 transition-colors">
                    Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-orange-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Run&Roast. Tous droits réservés.
              </p>
              <div className="flex gap-6">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </>
  )
}
