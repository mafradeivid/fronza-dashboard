import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  titulo: string
  descricao: string
  icone: LucideIcon
  cor: string // ex: "blue", "emerald", "amber", "violet"
  acaoPrincipal?: {
    label: string
    onClick: () => void
    icone?: LucideIcon
  }
}

export function PageHeader({ titulo, descricao, icone: Icone, cor, acaoPrincipal }: PageHeaderProps) {
  const cores: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
    purple: 'from-purple-500 to-purple-600',
  }

  const coresBotao: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    violet: 'bg-violet-600 hover:bg-violet-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${cores[cor] || cores.blue} p-2 rounded-xl`}>
              <Icone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{titulo}</h1>
              <p className="text-sm text-slate-500">{descricao}</p>
            </div>
          </div>
          {acaoPrincipal && (
            <button
              onClick={acaoPrincipal.onClick}
              className={`flex items-center gap-2 ${coresBotao[cor] || coresBotao.blue} text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm`}
            >
              {acaoPrincipal.icone && <acaoPrincipal.icone className="w-4 h-4" />}
              {acaoPrincipal.label}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}