'use client'

import { LayoutGrid, Calendar, Building2, Layers, Users } from 'lucide-react'
import { VisualizacaoCusto } from '@/types/custoPessoal'

interface SeletorVisualizacaoProps {
  visualizacao: VisualizacaoCusto
  onChange: (vis: VisualizacaoCusto) => void
}

const OPCOES: { value: VisualizacaoCusto; label: string; icone: React.ElementType }[] = [
  { value: 'consolidado', label: 'Consolidado', icone: LayoutGrid },
  { value: 'mensal', label: 'Por Mês', icone: Calendar },
  { value: 'empresa', label: 'Por Empresa', icone: Building2 },
  { value: 'setor', label: 'Por Setor', icone: Layers },
  { value: 'funcionario', label: 'Por Funcionário', icone: Users },
]

export function SeletorVisualizacao({ visualizacao, onChange }: SeletorVisualizacaoProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6">
      {OPCOES.map((opcao) => {
        const Icon = opcao.icone
        const ativo = visualizacao === opcao.value

        return (
          <button
            key={opcao.value}
            onClick={() => onChange(opcao.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${ativo 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {opcao.label}
          </button>
        )
      })}
    </div>
  )
}