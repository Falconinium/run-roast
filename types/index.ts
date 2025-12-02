import { Database } from './database.types'

// Alias pour faciliter l'utilisation
export type Profile = Database['public']['Tables']['profiles']['Row']
export type StravaConnection = Database['public']['Tables']['strava_connections']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeMember = Database['public']['Tables']['challenge_members']['Row']
export type ActivitySnapshot = Database['public']['Tables']['activity_snapshots']['Row']

// Types pour les inserts
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type StravaConnectionInsert = Database['public']['Tables']['strava_connections']['Insert']
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert']
export type ChallengeMemberInsert = Database['public']['Tables']['challenge_members']['Insert']
export type ActivitySnapshotInsert = Database['public']['Tables']['activity_snapshots']['Insert']

// Enums
export type SportType = 'run' | 'ride' | 'hike' | 'walk' | 'swim' | 'other'
export type MetricType = 'distance' | 'time' | 'elevation' | 'count'
export type VisibilityType = 'private' | 'unlisted' | 'public'
export type RoleType = 'owner' | 'member'

// Types pour les API Strava
export interface StravaTokenResponse {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
  athlete: StravaAthlete
}

export interface StravaAthlete {
  id: number
  username: string | null
  firstname: string
  lastname: string
  profile: string
}

export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  timezone: string
}

// Types pour le leaderboard
export interface LeaderboardEntry {
  user_id: string
  full_name: string | null
  email: string
  total_distance: number
  total_time: number
  total_elevation: number
  count: number
  score: number
  rank: number
}

// Type pour un défi avec ses informations étendues
export interface ChallengeWithOwner extends Challenge {
  profiles: Profile
}

export interface ChallengeWithMembers extends Challenge {
  challenge_members: (ChallengeMember & { profiles: Profile })[]
}

// Export du type Database
export type { Database }
