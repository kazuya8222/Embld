'use client'

import Link from 'next/link'
import { CompletedApp } from '@/types'
import { 
  Star, 
  ExternalLink, 
  User, 
  Calendar, 
  Smartphone,
  Globe
} from 'lucide-react'

interface AppCardProps {
  app: CompletedApp & {
    idea: {
      title: string
      category: string
    }
    developer: {
      username: string
      avatar_url?: string
    }
    reviews_count: number
    average_rating: number
  }
}

export function AppCard({ app }: AppCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {app.idea.category}
            </span>
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              完成
            </span>
          </div>
          
          <h3 className="font-semibold text-lg text-gray-900">
            {app.app_name}
          </h3>
          
          <p className="text-sm text-gray-500">
            元アイデア: {app.idea.title}
          </p>
          
          {app.description && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {app.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{app.developer.username}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(app.created_at)}</span>
          </div>
        </div>

        {app.reviews_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(app.average_rating)}
            </div>
            <span className="text-sm text-gray-600">
              {app.average_rating.toFixed(1)} ({app.reviews_count} レビュー)
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {app.app_url && (
            <a
              href={app.app_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              ウェブ
            </a>
          )}
          
          {app.store_urls?.ios && (
            <a
              href={app.store_urls.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              iOS
            </a>
          )}
          
          {app.store_urls?.android && (
            <a
              href={app.store_urls.android}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Android
            </a>
          )}
        </div>

        <Link
          href={`/apps/${app.id}`}
          className="block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          詳細を見る
        </Link>
      </div>
    </div>
  )
}