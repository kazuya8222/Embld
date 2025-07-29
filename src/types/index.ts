export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  google_avatar_url?: string
  auth_provider: string
  is_admin: boolean
  is_premium: boolean
  created_at: string
}

export interface CoreFeature {
  title: string
  description: string
}

export interface Idea {
  id: string
  user_id: string
  title: string
  problem: string
  solution: string
  target_users?: string
  category: string
  tags: string[]
  sketch_urls: string[]
  status: 'open' | 'in_development' | 'completed'
  created_at: string
  updated_at: string
  // 企画書フィールド
  service_name?: string
  catch_copy?: string
  service_description?: string
  background_problem?: string
  current_solution_problems?: string
  main_target?: string
  usage_scene?: string
  value_proposition?: string
  differentiators?: string
  core_features?: CoreFeature[]
  nice_to_have_features?: string
  initial_flow?: string
  important_operations?: string
  monetization_method?: string
  price_range?: string
  free_paid_boundary?: string
  similar_services?: string
  design_atmosphere?: string
  reference_urls?: string
  expected_release?: string
  priority_points?: string
  device_type?: string
  external_services?: string
  one_month_goal?: string
  success_metrics?: string
  // リレーション
  user?: User
  wants_count?: number
  comments_count?: number
  user_has_wanted?: boolean
}

export interface Want {
  id: string
  idea_id: string
  user_id: string
  created_at: string
  user?: User
}

export interface Comment {
  id: string
  idea_id: string
  user_id: string
  content: string
  created_at: string
  user?: User
}

export interface CompletedApp {
  id: string
  idea_id: string
  admin_id?: string
  app_name: string
  description?: string
  app_url?: string
  store_urls?: {
    ios?: string
    android?: string
  }
  screenshots: string[]
  released_at: string
  is_published: boolean
  created_at: string
  idea?: Idea
  reviews_count?: number
  average_rating?: number
}

export interface RevenueShare {
  id: string
  app_id: string
  user_id: string
  share_type: 'idea_creator' | 'want' | 'comment'
  share_percentage: number
  created_at: string
}

export interface AppRevenue {
  id: string
  app_id: string
  month: string
  revenue: number
  currency: string
  created_at: string
}

export interface RevenueDistribution {
  id: string
  app_id: string
  user_id: string
  revenue_id: string
  amount: number
  share_type: string
  status: 'pending' | 'paid' | 'failed'
  paid_at?: string
  created_at: string
}

export interface Review {
  id: string
  app_id: string
  user_id: string
  rating: number
  content?: string
  created_at: string
  user?: User
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export const CATEGORIES = [
  '仕事効率化',
  'エンタメ',
  '健康・フィットネス',
  '教育',
  'ライフスタイル',
  'ゲーム',
  'SNS・コミュニケーション',
  'ツール',
  'その他'
] as const

export type Category = typeof CATEGORIES[number]