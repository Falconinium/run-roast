import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Route API pour déconnecter Strava
 * POST /api/strava/disconnect
 * Supprime la connexion Strava de l'utilisateur
 */
export async function POST() {
  // Vérifier que l'utilisateur est authentifié
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Supprimer la connexion Strava
    const { error: deleteError } = await supabase
      .from('strava_connections')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting Strava connection:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disconnect Strava' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Strava disconnected successfully',
    })
  } catch (err) {
    console.error('Error disconnecting Strava:', err)
    return NextResponse.json(
      { error: 'Failed to disconnect Strava' },
      { status: 500 }
    )
  }
}
