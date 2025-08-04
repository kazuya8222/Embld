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
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          google_avatar_url: string | null
          auth_provider: string
          is_admin: boolean
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string | null
          google_avatar_url?: string | null
          auth_provider?: string
          is_admin?: boolean
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          google_avatar_url?: string | null
          auth_provider?: string
          is_admin?: boolean
          is_premium?: boolean
          created_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          problem: string
          solution: string
          target_users: string | null
          category: string
          tags: string[]
          sketch_urls: string[]
          status: string
          revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          problem: string
          solution: string
          target_users?: string | null
          category: string
          tags?: string[]
          sketch_urls?: string[]
          status?: string
          revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          problem?: string
          solution?: string
          target_users?: string | null
          category?: string
          tags?: string[]
          sketch_urls?: string[]
          status?: string
          revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      wants: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      completed_apps: {
        Row: {
          id: string
          idea_id: string
          admin_id: string | null
          app_name: string
          description: string | null
          app_url: string | null
          store_urls: Json | null
          screenshots: string[]
          released_at: string
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          admin_id?: string | null
          app_name: string
          description?: string | null
          app_url?: string | null
          store_urls?: Json | null
          screenshots?: string[]
          released_at?: string
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          admin_id?: string | null
          app_name?: string
          description?: string | null
          app_url?: string | null
          store_urls?: Json | null
          screenshots?: string[]
          released_at?: string
          is_published?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          app_id: string
          user_id: string
          rating: number
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          user_id: string
          rating: number
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          user_id?: string
          rating?: number
          content?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: string
          created_at?: string
        }
      }
      revenue_shares: {
        Row: {
          id: string
          app_id: string
          user_id: string
          share_type: 'idea_creator' | 'want' | 'comment'
          share_percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          user_id: string
          share_type: 'idea_creator' | 'want' | 'comment'
          share_percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          user_id?: string
          share_type?: 'idea_creator' | 'want' | 'comment'
          share_percentage?: number
          created_at?: string
        }
      }
      app_revenues: {
        Row: {
          id: string
          app_id: string
          month: string
          revenue: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          month: string
          revenue: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          month?: string
          revenue?: number
          currency?: string
          created_at?: string
        }
      }
      revenue_distributions: {
        Row: {
          id: string
          app_id: string
          user_id: string
          revenue_id: string
          amount: number
          share_type: string
          status: 'pending' | 'paid' | 'failed'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          user_id: string
          revenue_id: string
          amount: number
          share_type: string
          status?: 'pending' | 'paid' | 'failed'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          user_id?: string
          revenue_id?: string
          amount?: number
          share_type?: string
          status?: 'pending' | 'paid' | 'failed'
          paid_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}