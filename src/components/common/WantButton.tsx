'use client'

import { useEffect, useOptimistic, useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleWantForm } from '@/app/actions/wantPost'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { useFormStatus, useFormState } from 'react-dom'

interface WantButtonProps {
  ideaId: string
  initialWanted: boolean
  initialCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WantButton({ ideaId, initialWanted, initialCount, className, size = 'md' }: WantButtonProps) {
  const router = useRouter()

  const [base, setBase] = useState({ wanted: initialWanted, count: initialCount })
  const [optimistic, addOptimistic] = useOptimistic(
    base,
    (state, action: { type: 'toggle' }) => {
      if (action.type === 'toggle') {
        const nextWanted = !state.wanted
        return {
          wanted: nextWanted,
          count: state.count + (nextWanted ? 1 : -1),
        }
      }
      return state
    }
  )

  type ToggleResult = { wanted: boolean; count: number } | null
  const [serverState, formAction] = useFormState<ToggleResult, FormData>(toggleWantForm as any, null)

  // サーバー応答後に真値で整合（再描画のみ・refreshしない）
  useEffect(() => {
    if (serverState) {
      setBase({ wanted: serverState.wanted, count: serverState.count })
    }
  }, [serverState])

  const onAction = async (formData: FormData) => {
    // 即時反映
    addOptimistic({ type: 'toggle' })
    // サーバーへ
    await formAction(formData)
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <form action={onAction}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <SubmitButton
        className={cn(
          "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200",
          sizeClasses[size],
          optimistic.wanted
            ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
          className
        )}
        onPointerDown={() => addOptimistic({ type: 'toggle' })}
      >
        <Heart className={cn(
          iconSizes[size],
          'transition-transform duration-100',
          optimistic.wanted && 'fill-current scale-110'
        )} />
        <span>{optimistic.wanted ? 'ほしい済み' : 'ほしい！'}</span>
        <span className="font-semibold bg-white/50 px-2 py-0.5 rounded-full text-xs transition-transform duration-100" aria-live="polite">
          {optimistic.count}
        </span>
      </SubmitButton>
    </form>
  )
}

function SubmitButton({ className, children, onPointerDown }: { className?: string; children: React.ReactNode; onPointerDown?: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} onPointerDown={onPointerDown} className={cn(className, pending && 'opacity-50 cursor-not-allowed')}>
      {children}
    </button>
  )
}