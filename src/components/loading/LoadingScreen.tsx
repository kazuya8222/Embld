'use client'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 z-[100] flex items-center justify-center">
      {/* 背景のグラデーション効果 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* 回転するEMBLDアイコン */}
        <div className="relative">
          {/* 外側のリング */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-700 animate-pulse"></div>
          
          {/* 回転するアイコン */}
          <div className="animate-spin-slow p-8">
            <img 
              src="/images/EnBld_logo_icon_monochrome.svg"
              alt="Loading..."
              className="h-20 w-20 brightness-0 invert"
            />
          </div>
        </div>
        
        {/* ローディングテキスト */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-gray-400 text-sm font-medium">読み込み中</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}