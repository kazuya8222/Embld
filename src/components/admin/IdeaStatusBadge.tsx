'use client'

interface IdeaStatusBadgeProps {
  status: string
}

export function IdeaStatusBadge({ status }: IdeaStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          label: '下書き',
          className: 'bg-gray-100 text-gray-800'
        }
      case 'open':
        return {
          label: '公開中',
          className: 'bg-green-100 text-green-800'
        }
      case 'in_development':
        return {
          label: '開発中',
          className: 'bg-blue-100 text-blue-800'
        }
      case 'completed':
        return {
          label: '完了',
          className: 'bg-purple-100 text-purple-800'
        }
      default:
        return {
          label: '不明',
          className: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}