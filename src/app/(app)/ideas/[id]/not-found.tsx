import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="mb-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          アイデアが見つかりません
        </h1>
        <p className="text-gray-600">
          お探しのアイデアは存在しないか、削除された可能性があります。
        </p>
      </div>
      
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        アイデア一覧に戻る
      </Link>
    </div>
  )
}