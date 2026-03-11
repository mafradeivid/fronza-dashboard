import { Sidebar } from '@/components/layout/Sidebar'

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </>
  )
}