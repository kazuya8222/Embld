'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallback?: React.ReactNode
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '',
  priority = false,
  fallback
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Supabase画像URLをCDN用に最適化
  const optimizedSrc = src.includes('supabase.co') 
    ? `${src}?quality=80&format=webp`
    : src

  if (error) {
    return fallback || (
      <div className={`bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center ${className}`}>
        <Lightbulb className="w-12 h-12 text-white opacity-50" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={80}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        // 画像最適化設定
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
      />
    </div>
  )
}