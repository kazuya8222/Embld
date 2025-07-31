import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}