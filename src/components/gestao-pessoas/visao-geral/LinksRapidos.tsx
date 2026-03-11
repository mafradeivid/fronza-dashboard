import Link from 'next/link'
import { Users, Calendar, Briefcase, Gift } from 'lucide-react'

export function LinksRapidos() {
  const links = [
    {
      href: '/gestao-pessoas/funcionarios',
      icone: Users,
      cor: 'violet',
      titulo: 'Funcionários',
      descricao: 'Gerenciar cadastros',
    },
    {
      href: '/gestao-pessoas/encargos',
      icone: Calendar,
      cor: 'purple',
      titulo: 'Encargos',
      descricao: 'Cálculos trabalhistas',
    },
    {
      href: '/gestao-pessoas/custo-pessoal',
      icone: Briefcase,
      cor: 'emerald',
      titulo: 'Custo de Pessoal',
      descricao: 'Visão consolidada',
    },
    {
      href: '/gestao-pessoas/pagamentos-extras',
      icone: Gift,
      cor: 'amber',
      titulo: 'Pagamentos Extras',
      descricao: 'Lançamentos avulsos',
    },
  ]

  const cores: Record<string, { bg: string; hover: string; border: string }> = {
    violet: { bg: 'bg-violet-100', hover: 'group-hover:bg-violet-200', border: 'hover:border-violet-300' },
    purple: { bg: 'bg-purple-100', hover: 'group-hover:bg-purple-200', border: 'hover:border-purple-300' },
    emerald: { bg: 'bg-emerald-100', hover: 'group-hover:bg-emerald-200', border: 'hover:border-emerald-300' },
    amber: { bg: 'bg-amber-100', hover: 'group-hover:bg-amber-200', border: 'hover:border-amber-300' },
  }

  const iconesCores: Record<string, string> = {
    violet: 'text-violet-600',
    purple: 'text-purple-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link) => {
        const Icone = link.icone
        const cor = cores[link.cor]
        const iconeCor = iconesCores[link.cor]

        return (
          <Link 
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 ${cor.border} hover:shadow-md transition-all group`}
          >
            <div className={`w-10 h-10 ${cor.bg} rounded-lg flex items-center justify-center ${cor.hover} transition-colors`}>
              <Icone className={`w-5 h-5 ${iconeCor}`} />
            </div>
            <div>
              <p className="font-medium text-slate-800">{link.titulo}</p>
              <p className="text-xs text-slate-500">{link.descricao}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}