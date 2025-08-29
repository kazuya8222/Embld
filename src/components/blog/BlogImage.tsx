'use client'

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BlogImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
}

const DEFAULT_PLACEHOLDER = '/images/blog-placeholder.svg';

export function BlogImage({ 
  src, 
  alt = 'Blog image', 
  className, 
  priority = false,
  width = 800,
  height = 400,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 画像のソースを決定する処理
  const getImageSource = () => {
    if (!src || imageError) {
      return DEFAULT_PLACEHOLDER;
    }
    
    // Supabase Storage URL の処理
    if (src.includes('.supabase.co/storage/')) {
      return src;
    }
    
    // 相対パス（/から始まる）の場合
    if (src.startsWith('/')) {
      return src;
    }
    
    // 外部URLの場合はプレースホルダーを使用
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return DEFAULT_PLACEHOLDER;
    }
    
    // その他の場合もプレースホルダーを使用
    return DEFAULT_PLACEHOLDER;
  };

  const imageSrc = getImageSource();
  const isPlaceholder = imageSrc === DEFAULT_PLACEHOLDER;
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className={cn('relative overflow-hidden bg-[#2a2a2a]', className)}>
      {isLoading && !isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading && !isPlaceholder ? 'opacity-0' : 'opacity-100'
        )}
        priority={priority}
        sizes={sizes}
        quality={quality}
        onLoad={handleImageLoad}
        onError={handleImageError}
        placeholder={isPlaceholder ? undefined : 'blur'}
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}

export default BlogImage;