'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileText,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calculator,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  FolderTree,
  Briefcase,
  DollarSign,
  Layers,
  ClipboardList,
  UserCog,
  Calendar,
  Clock,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface SidebarProps {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

// Definição dos módulos
const modulos = [
  {
    id: 'financeiro',
    titulo: 'FINANCEIRO',
    cor: 'blue',
    itens: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: BarChart3,
      },
      {
        id: 'detalhamento',
        label: 'Detalhamento',
        icon: Layers,
        submenu: [
          { label: 'Receitas', href: '/detalhamento/receitas', icon: TrendingUp },
          { label: 'Despesas', href: '/detalhamento/despesas', icon: TrendingDown },
          { label: 'Investimentos', href: '/detalhamento/investimentos', icon: PiggyBank },
          { label: 'Resultados', href: '/detalhamento/resultados', icon: Calculator },
        ]
      },
      {
        id: 'dre',
        label: 'DRE Completo',
        href: '/detalhes',
        icon: FileText,
      },
    ]
  },
  {
    id: 'gestao-pessoas',
    titulo: 'GESTÃO DE PESSOAS',
    cor: 'violet',
    itens: [
      {
        id: 'visao-geral-rh',
        label: 'Visão Geral',
        href: '/gestao-pessoas',
        icon: Users,
      },
      {
        id: 'cadastros',
        label: 'Cadastros',
        icon: ClipboardList,
        submenu: [
          { label: 'Empresas', href: '/gestao-pessoas/empresas', icon: Building2 },
          { label: 'Setores', href: '/gestao-pessoas/setores', icon: FolderTree },
          { label: 'Cargos', href: '/gestao-pessoas/cargos', icon: Briefcase },
          { label: 'Funcionários', href: '/gestao-pessoas/funcionarios', icon: UserCog },
        ]
      },
      {
        id: 'folha',
        label: 'Folha',
        icon: DollarSign,
        submenu: [
          { label: 'Pagamentos Extras', href: '/gestao-pessoas/pagamentos-extras', icon: Calculator },
          { label: 'Custo de Pessoal', href: '/gestao-pessoas/custo-pessoal', icon: DollarSign },
          { label: 'Encargos e Provisões', href: '/gestao-pessoas/encargos', icon: Calculator },
        ]
      },
      {
  id: 'ferias',
  label: 'Férias',
  icon: Calendar,
  submenu: [
    { label: 'Visão Geral', href: '/gestao-pessoas/ferias', icon: BarChart3 },
    { label: 'Períodos e Saldos', href: '/gestao-pessoas/ferias/periodos', icon: Clock },
    { label: 'Programação', href: '/gestao-pessoas/ferias/programacao', icon: Calendar },
  ]
},
    ]
  },
]

export function Sidebar({ menuOpen, setMenuOpen }: SidebarProps) {

  const pathname = usePathname()
  const [expandidos, setExpandidos] = useState<string[]>([])

  // Expande automaticamente o menu ativo
  useEffect(() => {
    modulos.forEach(modulo => {
      modulo.itens.forEach(item => {
        if ('submenu' in item && item.submenu) {
          const isActive = item.submenu.some(sub =>
            pathname === sub.href || pathname.startsWith(sub.href + '/')
          )
          if (isActive && !expandidos.includes(item.id)) {
            setExpandidos(prev => [...prev, item.id])
          }
        }
      })
    })
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const isActive = (href: string) => pathname === href

  const isSubmenuActive = (submenu: { href: string }[]) =>
    submenu.some(item =>
      pathname === item.href || pathname.startsWith(item.href + '/')
    )

  const toggleExpand = (id: string) => {
    setExpandidos(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const isExpanded = (id: string) => expandidos.includes(id)

  const getCorAtiva = (cor: string) => {
    return cor === 'violet' ? 'bg-violet-600' : 'bg-blue-600'
  }

  const getCorTitulo = (cor: string) => {
    return cor === 'violet' ? 'text-violet-400' : 'text-blue-400'
  }

  return (

    <aside
      className={`w-64 bg-slate-900 min-h-screen flex flex-col fixed left-0 top-0 z-50 transform transition-transform duration-300
      ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0`}
    >

      {/* Header Mobile */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 md:hidden">
        <h2 className="text-white font-semibold">Menu</h2>

        <button
          onClick={() => setMenuOpen(false)}
          className="text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Logo */}
      <div className="p-6 border-b border-slate-800 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">Top Haus</h1>
            <p className="text-xs text-slate-400">Dashboard Financeiro</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">

        {modulos.map((modulo, index) => (

          <div key={modulo.id} className={index > 0 ? 'mt-6' : ''}>

            {/* Título módulo */}

            <div className={`px-4 py-2 text-xs font-semibold tracking-wider ${getCorTitulo(modulo.cor)}`}>
              {modulo.titulo}
            </div>

            <ul className="space-y-1 mt-1">

              {modulo.itens.map((item) => (

                <li key={item.id}>

                  {'submenu' in item && item.submenu ? (

                    <div>

                      <button
                        onClick={() => toggleExpand(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors
                        ${isSubmenuActive(item.submenu)
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >

                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </div>

                        {isExpanded(item.id)
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }

                      </button>

                      {isExpanded(item.id) && (

                        <ul className="mt-1 ml-4 space-y-1">

                          {item.submenu.map((subitem) => (

                            <li key={subitem.href}>

                              <Link
                                href={subitem.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors
                                ${isActive(subitem.href)
                                  ? `${getCorAtiva(modulo.cor)} text-white`
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >

                                <subitem.icon className="w-4 h-4" />
                                {subitem.label}

                              </Link>

                            </li>

                          ))}

                        </ul>

                      )}

                    </div>

                  ) : (

                    <Link
                      href={'href' in item ? item.href : '#'}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${'href' in item && isActive(item.href)
                        ? `${getCorAtiva(modulo.cor)} text-white`
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >

                      <item.icon className="w-5 h-5" />
                      {item.label}

                    </Link>

                  )}

                </li>

              ))}

            </ul>

          </div>

        ))}

      </nav>

      {/* Footer */}

      <div className="p-4 border-t border-slate-800">

        <p className="text-xs text-slate-500 text-center">
          © 2025 Top Haus
        </p>

      </div>

    </aside>

  )
}