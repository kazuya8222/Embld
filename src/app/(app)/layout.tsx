'use client'

import { TopBar } from '@/components/common/TopBar'
import { Sidebar } from '@/components/common/Sidebar'
import { Footer } from '@/components/common/Footer'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  const handleMenuToggle = () => {
    const newLockState = !isSidebarLocked
    setIsSidebarLocked(newLockState)
    setIsSidebarOpen(newLockState)
  }

  const handleMenuHover = (isHovering: boolean) => {
    setIsSidebarHovered(isHovering)
    if (!isSidebarLocked) {
      setIsSidebarOpen(isHovering)
    }
  }

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} isMenuLocked={isSidebarLocked} />
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-14 z-50"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar isLocked={isSidebarLocked} onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}