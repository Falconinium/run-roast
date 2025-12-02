// Types générés pour les tables Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      strava_connections: {
        Row: {
          id: string
          user_id: string
          strava_athlete_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          athlete_firstname: string | null
          athlete_lastname: string | null
          athlete_profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strava_athlete_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          athlete_firstname?: string | null
          athlete_lastname?: string | null
          athlete_profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strava_athlete_id?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string
          athlete_firstname?: string | null
          athlete_lastname?: string | null
          athlete_profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          sport: string
          metric: string
          start_date: string
          end_date: string
          visibility: string
          invite_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          sport: string
          metric: string
          start_date: string
          end_date: string
          visibility?: string
          invite_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          sport?: string
          metric?: string
          start_date?: string
          end_date?: string
          visibility?: string
          invite_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      challenge_members: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      activity_snapshots: {
        Row: {
          id: string
          user_id: string
          strava_activity_id: string
          sport_type: string
          distance: number
          moving_time: number
          elapsed_time: number
          total_elevation_gain: number
          start_date: string
          raw_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strava_activity_id: string
          sport_type: string
          distance: number
          moving_time: number
          elapsed_time: number
          total_elevation_gain: number
          start_date: string
          raw_payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strava_activity_id?: string
          sport_type?: string
          distance?: number
          moving_time?: number
          elapsed_time?: number
          total_elevation_gain?: number
          start_date?: string
          raw_payload?: Json | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
