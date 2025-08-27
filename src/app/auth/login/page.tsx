'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import './login-animation.css'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated background dots */}
      <div className="absolute inset-0">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-[-80px]">
        <div className="mb-20">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}