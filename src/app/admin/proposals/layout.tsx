import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminProposalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-4 max-w-6xl">
        {children}
      </main>
    </div>
  )
}