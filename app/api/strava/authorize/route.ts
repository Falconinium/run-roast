import { NextResponse } from 'next/server'
import { getStravaAuthorizationUrl } from '@/lib/strava'
import { createClient } from '@/lib/supabase/server'

/**
 * Route API pour initier le flow OAuth Strava
 * GET /api/strava/authorize
 * Redirige l'utilisateur vers la page d'autorisation Strava
 */
export async function GET() {
  // Vérifier que l'utilisateur est authentifié
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Générer un state unique pour sécuriser le flow OAuth (CSRF protection)
  const state = user.id

  // Obtenir l'URL d'autorisation Strava
  const authUrl = getStravaAuthorizationUrl(state)

  // Rediriger vers Strava
  return NextResponse.redirect(authUrl)
}
