import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard Financeiro - Top Haus',
  description: 'Painel de controle financeiro DRE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100">
        {children}
      </body>
    </html>
  )
}