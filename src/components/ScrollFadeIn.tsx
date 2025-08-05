'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollFadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScrollFadeIn({ children, delay = 0, className = '' }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible')
            }, delay)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px' // 少し早めにトリガー
      }
    )

    const element = ref.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [delay])

  return (
    <div 
      ref={ref}
      className={`scroll-fade-in ${className}`}
    >
      {children}
    </div>
  )
}
