import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAthleteActivities,
  refreshAccessToken,
  isTokenExpired,
  normalizeStravaType,
} from '@/lib/strava'
import { updateUserAchievements } from '@/lib/actions/achievements'

/**
 * Route API pour synchroniser les activités Strava
 * POST /api/strava/sync
 * Récupère les dernières activités depuis Strava et les stocke en base
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
    // Récupérer la connexion Strava de l'utilisateur
    const { data: stravaConnection, error: connectionError } = await supabase
      .from('strava_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !stravaConnection) {
      return NextResponse.json(
        { error: 'Strava not connected' },
        { status: 400 }
      )
    }

    let accessToken = stravaConnection.access_token
    let expiresAt = stravaConnection.expires_at

    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    if (isTokenExpired(expiresAt)) {
      const tokenResponse = await refreshAccessToken(
        stravaConnection.refresh_token
      )

      accessToken = tokenResponse.access_token
      expiresAt = new Date(tokenResponse.expires_at * 1000).toISOString()

      // Mettre à jour le token en base
      await supabase
        .from('strava_connections')
        .update({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    // Récupérer les activités des 90 derniers jours
    const ninetyDaysAgo = Math.floor(
      Date.now() / 1000 - 90 * 24 * 60 * 60
    )

    const activities = await getAthleteActivities(accessToken, {
      after: ninetyDaysAgo,
      perPage: 200,
    })

    // Si aucune activité, retourner succès immédiatement
    if (activities.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'No activities found in the last 90 days',
      })
    }

    // Préparer les données pour l'insertion
    const activitySnapshots = activities.map((activity) => ({
      user_id: user.id,
      strava_activity_id: activity.id.toString(),
      sport_type: normalizeStravaType(activity.sport_type || activity.type),
      distance: Number(activity.distance) || 0,
      moving_time: Number(activity.moving_time) || 0,
      elapsed_time: Number(activity.elapsed_time) || 0,
      total_elevation_gain: Number(activity.total_elevation_gain) || 0,
      start_date: activity.start_date,
      raw_payload: activity as any,
    }))

    // Insérer les activités une par une en vérifiant d'abord si elles existent
    let successCount = 0
    let updatedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const snapshot of activitySnapshots) {
      try {
        // Vérifier si l'activité existe déjà
        const { data: existing } = await supabase
          .from('activity_snapshots')
          .select('id')
          .eq('user_id', snapshot.user_id)
          .eq('strava_activity_id', snapshot.strava_activity_id)
          .single()

        if (existing) {
          // Mettre à jour l'activité existante
          const { error: updateError } = await supabase
            .from('activity_snapshots')
            .update({
              sport_type: snapshot.sport_type,
              distance: snapshot.distance,
              moving_time: snapshot.moving_time,
              elapsed_time: snapshot.elapsed_time,
              total_elevation_gain: snapshot.total_elevation_gain,
              start_date: snapshot.start_date,
              raw_payload: snapshot.raw_payload,
            })
            .eq('id', existing.id)

          if (updateError) {
            console.error(`Error updating activity ${snapshot.strava_activity_id}:`, updateError)
            errors.push(`Update ${snapshot.strava_activity_id}: ${updateError.message}`)
            errorCount++
          } else {
            updatedCount++
          }
        } else {
          // Insérer une nouvelle activité
          const { error: insertError } = await supabase
            .from('activity_snapshots')
            .insert(snapshot)

          if (insertError) {
            console.error(`Error inserting activity ${snapshot.strava_activity_id}:`, insertError)
            errors.push(`Insert ${snapshot.strava_activity_id}: ${insertError.message}`)
            errorCount++
          } else {
            successCount++
          }
        }
      } catch (err) {
        console.error(`Error processing activity ${snapshot.strava_activity_id}:`, err)
        errors.push(`Process ${snapshot.strava_activity_id}: ${err}`)
        errorCount++
      }
    }

    if (errorCount > 0 && successCount === 0 && updatedCount === 0) {
      return NextResponse.json(
        {
          error: `Failed to store any activities (${errorCount} errors)`,
          details: errors.slice(0, 5), // Retourne les 5 premières erreurs pour debug
        },
        { status: 500 }
      )
    }

    const totalProcessed = successCount + updatedCount

    // Update user achievements after syncing activities
    if (totalProcessed > 0) {
      try {
        await updateUserAchievements(user.id)
      } catch (achievementError) {
        console.error('Error updating achievements:', achievementError)
        // Don't fail the sync if achievements update fails
      }
    }

    return NextResponse.json({
      success: true,
      count: totalProcessed,
      inserted: successCount,
      updated: updatedCount,
      message: `Successfully synced ${totalProcessed} activities (${successCount} new, ${updatedCount} updated)${errorCount > 0 ? ` with ${errorCount} errors` : ''}`,
    })
  } catch (err) {
    console.error('Error syncing Strava activities:', err)
    return NextResponse.json(
      { error: 'Failed to sync activities' },
      { status: 500 }
    )
  }
}
