'use client'

interface UserStatusBadgeProps {
  status: string
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: '有効',
          className: 'bg-green-100 text-green-800'
        }
      case 'inactive':
        return {
          label: '無効',
          className: 'bg-gray-100 text-gray-800'
        }
      case 'suspended':
        return {
          label: '凍結',
          className: 'bg-red-100 text-red-800'
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