import { StravaTokenResponse, StravaActivity } from '@/types'

// Configuration Strava depuis les variables d'environnement
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI!

// URLs de l'API Strava
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_BASE_URL = 'https://www.strava.com/api/v3'

/**
 * Génère l'URL d'autorisation OAuth Strava
 * @param state - État optionnel pour la sécurité CSRF
 * @returns URL complète pour rediriger l'utilisateur
 */
export function getStravaAuthorizationUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })

  if (state) {
    params.append('state', state)
  }

  return `${STRAVA_AUTH_URL}?${params.toString()}`
}

/**
 * Échange le code d'autorisation contre un access token
 * @param code - Code d'autorisation reçu du callback
 * @returns Réponse contenant access_token, refresh_token, expires_at, etc.
 */
export async function exchangeCodeForToken(
  code: string
): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

/**
 * Rafraîchit un access token expiré
 * @param refreshToken - Refresh token stocké en base
 * @returns Nouvelle réponse avec access_token, refresh_token, expires_at
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

/**
 * Récupère les activités de l'athlète depuis Strava
 * @param accessToken - Access token valide
 * @param after - Timestamp optionnel (epoch) pour récupérer les activités après cette date
 * @param before - Timestamp optionnel (epoch) pour récupérer les activités avant cette date
 * @param page - Numéro de page (défaut: 1)
 * @param perPage - Nombre d'activités par page (défaut: 30, max: 200)
 * @returns Liste d'activités Strava
 */
export async function getAthleteActivities(
  accessToken: string,
  options: {
    after?: number
    before?: number
    page?: number
    perPage?: number
  } = {}
): Promise<StravaActivity[]> {
  const { after, before, page = 1, perPage = 30 } = options

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  if (after) params.append('after', after.toString())
  if (before) params.append('before', before.toString())

  const response = await fetch(
    `${STRAVA_API_BASE_URL}/athlete/activities?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch activities: ${error}`)
  }

  return response.json()
}

/**
 * Vérifie si un token est expiré
 * @param expiresAt - Timestamp d'expiration (en secondes depuis epoch)
 * @returns true si le token est expiré
 */
export function isTokenExpired(expiresAt: string | Date): boolean {
  const expirationDate = new Date(expiresAt)
  const now = new Date()
  return now >= expirationDate
}

/**
 * Convertit un type de sport Strava vers notre enum interne
 * @param stravaType - Type de sport depuis l'API Strava
 * @returns Notre type de sport normalisé
 */
export function normalizeStravaType(stravaType: string): string {
  const typeMap: Record<string, string> = {
    Run: 'run',
    Ride: 'ride',
    Hike: 'hike',
    Walk: 'walk',
    Swim: 'swim',
    VirtualRide: 'ride',
    VirtualRun: 'run',
  }

  return typeMap[stravaType] || 'other'
}
