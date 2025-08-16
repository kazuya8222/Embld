'use client';

import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  // YouTube URL handling
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Vimeo URL handling
  const getVimeoVideoId = (url: string) => {
    const regex = /(?:vimeo\.com\/)(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeVideoId(videoUrl);
  const vimeoId = getVimeoVideoId(videoUrl);
  
  // Check if it's a direct video file
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);

  if (youtubeId) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden group">
        {!showVideo ? (
          <div 
            className="relative w-full h-full cursor-pointer flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg)` }}
            onClick={() => setShowVideo(true)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all"></div>
            <div className="relative z-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white text-sm">
              <ExternalLink className="w-4 h-4" />
              YouTube
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={title || 'Demo Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title || 'Demo Video'}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  if (isDirectVideo) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full object-cover"
          poster=""
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          お使いのブラウザは動画の再生をサポートしていません。
        </video>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  // Fallback for other URL types
  return (
    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      <div className="text-center">
        <Play className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-3">動画プレビューを利用できません</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          動画を開く
        </a>
      </div>
    </div>
  );
}