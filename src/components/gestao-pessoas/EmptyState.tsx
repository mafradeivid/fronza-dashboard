import { LucideIcon, Inbox } from 'lucide-react'

interface EmptyStateProps {
  titulo?: string
  descricao?: string
  icone?: LucideIcon
  acao?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  titulo = 'Nenhum registro encontrado',
  descricao = 'Comece adicionando um novo item.',
  icone: Icone = Inbox,
  acao
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-slate-100 p-4 rounded-full mb-4">
        <Icone className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-700 mb-1">{titulo}</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-4">{descricao}</p>
      {acao && (
        <button
          onClick={acao.onClick}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          {acao.label}
        </button>
      )}
    </div>
  )
}