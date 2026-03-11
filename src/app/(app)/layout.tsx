"use client"

import { Sidebar } from '@/components/layout/Sidebar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("auth")

    if (!auth) {
      router.push("/login")
    }
  }, [router])

  return (
    <>
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </>
  )
}