import { TopBar } from '@/components/common/TopBar'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      <TopBar />
      
      <main className="flex-1 bg-[#1a1a1a]">
        {children}
      </main>
    </div>
  )
}