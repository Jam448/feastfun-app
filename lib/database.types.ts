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
      players: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string
          coins: number
          stars: number
          current_level: number
          lives: number
          lives_updated_at: string
          daily_streak: number
          last_login_date: string | null
          season_points: number
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          avatar_url?: string
          coins?: number
          stars?: number
          current_level?: number
          lives?: number
          lives_updated_at?: string
          daily_streak?: number
          last_login_date?: string | null
          season_points?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string
          coins?: number
          stars?: number
          current_level?: number
          lives?: number
          lives_updated_at?: string
          daily_streak?: number
          last_login_date?: string | null
          season_points?: number
          created_at?: string
        }
      }
      level_completions: {
        Row: {
          id: string
          player_id: string
          level_number: number
          stars_earned: number
          high_score: number
          times_played: number
          completed_at: string
        }
        Insert: {
          id?: string
          player_id: string
          level_number: number
          stars_earned?: number
          high_score?: number
          times_played?: number
          completed_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          level_number?: number
          stars_earned?: number
          high_score?: number
          times_played?: number
          completed_at?: string
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          theme_key: string
          start_date: string
          end_date: string
          is_active: boolean
          background_color: string
          accent_color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          theme_key: string
          start_date: string
          end_date: string
          is_active?: boolean
          background_color?: string
          accent_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          theme_key?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          background_color?: string
          accent_color?: string
          created_at?: string
        }
      }
      monthly_leaderboards: {
        Row: {
          id: string
          player_id: string
          month_key: string
          total_stars: number
          total_score: number
          levels_completed: number
          rank: number
          prize_tier: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          month_key: string
          total_stars?: number
          total_score?: number
          levels_completed?: number
          rank?: number
          prize_tier?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          month_key?: string
          total_stars?: number
          total_score?: number
          levels_completed?: number
          rank?: number
          prize_tier?: string | null
          updated_at?: string
        }
      }
      power_ups: {
        Row: {
          id: string
          type: string
          name: string
          description: string
          coin_cost: number
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          name: string
          description?: string
          coin_cost?: number
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          name?: string
          description?: string
          coin_cost?: number
          icon?: string
          created_at?: string
        }
      }
      player_power_ups: {
        Row: {
          player_id: string
          power_up_id: string
          quantity: number
        }
        Insert: {
          player_id: string
          power_up_id: string
          quantity?: number
        }
        Update: {
          player_id?: string
          power_up_id?: string
          quantity?: number
        }
      }
      daily_rewards: {
        Row: {
          id: string
          player_id: string
          day: number
          claimed_at: string
          reward_coins: number
          reward_power_ups: Json
        }
        Insert: {
          id?: string
          player_id: string
          day: number
          claimed_at?: string
          reward_coins?: number
          reward_power_ups?: Json
        }
        Update: {
          id?: string
          player_id?: string
          day?: number
          claimed_at?: string
          reward_coins?: number
          reward_power_ups?: Json
        }
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string
          level_number: number
          score: number
          moves_used: number
          power_ups_used: Json
          completed: boolean
          stars_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          level_number: number
          score?: number
          moves_used?: number
          power_ups_used?: Json
          completed?: boolean
          stars_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          level_number?: number
          score?: number
          moves_used?: number
          power_ups_used?: Json
          completed?: boolean
          stars_earned?: number
          created_at?: string
        }
      }
    }
  }
}
