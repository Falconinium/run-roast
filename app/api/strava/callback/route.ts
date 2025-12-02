import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/strava'
import { createClient } from '@/lib/supabase/server'

/**
 * Route API pour le callback OAuth Strava
 * GET /api/strava/callback?code=XXX&state=YYY
 * Reçoit le code d'autorisation, l'échange contre un token, et le stocke en base
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Si l'utilisateur a refusé l'autorisation
  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${error}`, request.url)
    )
  }

  // Vérifier que le code est présent
  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?error=missing_code', request.url)
    )
  }

  // Vérifier que l'utilisateur est authentifié
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.redirect(
      new URL('/login?error=unauthorized', request.url)
    )
  }

  // Vérifier le state pour la protection CSRF
  if (state !== user.id) {
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_state', request.url)
    )
  }

  try {
    // Échanger le code contre un token
    const tokenResponse = await exchangeCodeForToken(code)

    // Calculer la date d'expiration
    const expiresAt = new Date(tokenResponse.expires_at * 1000).toISOString()

    // Stocker ou mettre à jour la connexion Strava en base
    const { error: dbError } = await supabase
      .from('strava_connections')
      .upsert(
        {
          user_id: user.id,
          strava_athlete_id: tokenResponse.athlete.id.toString(),
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_at: expiresAt,
          athlete_firstname: tokenResponse.athlete.firstname,
          athlete_lastname: tokenResponse.athlete.lastname,
          athlete_profile_image: tokenResponse.athlete.profile,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )

    if (dbError) {
      console.error('Error storing Strava connection:', dbError)
      return NextResponse.redirect(
        new URL('/dashboard?error=database_error', request.url)
      )
    }

    // Rediriger vers le dashboard avec succès
    return NextResponse.redirect(
      new URL('/dashboard?strava=connected', request.url)
    )
  } catch (err) {
    console.error('Error in Strava callback:', err)
    return NextResponse.redirect(
      new URL('/dashboard?error=token_exchange_failed', request.url)
    )
  }
}
