'use client'

import { TipoPagamentoExtra, TIPOS_PAGAMENTO_EXTRA } from '@/types/pessoas'
import { formatarMoeda } from '@/utils/formatters'
import { LayoutGrid } from 'lucide-react'

// Cores por tipo
const CORES_TIPO: Record<string, { bg: string; bgHover: string; border: string; text: string; ring: string }> = {
  todos: { 
    bg: 'bg-orange-50', 
    bgHover: 'hover:bg-orange-100', 
    border: 'border-orange-300', 
    text: 'text-orange-700',
    ring: 'ring-orange-500'
  },
  horas_extras: { 
    bg: 'bg-blue-50', 
    bgHover: 'hover:bg-blue-100', 
    border: 'border-blue-300', 
    text: 'text-blue-700',
    ring: 'ring-blue-500'
  },
  bonificacao: { 
    bg: 'bg-emerald-50', 
    bgHover: 'hover:bg-emerald-100', 
    border: 'border-emerald-300', 
    text: 'text-emerald-700',
    ring: 'ring-emerald-500'
  },
  adiantamento: { 
    bg: 'bg-amber-50', 
    bgHover: 'hover:bg-amber-100', 
    border: 'border-amber-300', 
    text: 'text-amber-700',
    ring: 'ring-amber-500'
  },
  ajuda_custo: { 
    bg: 'bg-purple-50', 
    bgHover: 'hover:bg-purple-100', 
    border: 'border-purple-300', 
    text: 'text-purple-700',
    ring: 'ring-purple-500'
  },
  comissao: { 
    bg: 'bg-pink-50', 
    bgHover: 'hover:bg-pink-100', 
    border: 'border-pink-300', 
    text: 'text-pink-700',
    ring: 'ring-pink-500'
  },
  outros: { 
    bg: 'bg-slate-50', 
    bgHover: 'hover:bg-slate-100', 
    border: 'border-slate-300', 
    text: 'text-slate-700',
    ring: 'ring-slate-500'
  },
}

interface ResumoTipo {
  tipo: string
  total: number
  quantidade: number
  label?: string
}

interface TipoFilterCardsProps {
  resumoPorTipo: ResumoTipo[]
  tipoSelecionado: TipoPagamentoExtra | null
  onTipoChange: (tipo: TipoPagamentoExtra | null) => void
}

export function TipoFilterCards({
  resumoPorTipo,
  tipoSelecionado,
  onTipoChange,
}: TipoFilterCardsProps) {
  // Criar mapa de resumos para acesso rápido
  const resumoMap = new Map(resumoPorTipo.map(r => [r.tipo, r]))

  // Calcular totais gerais
  const totalGeral = resumoPorTipo.reduce((acc, r) => acc + r.total, 0)
  const quantidadeGeral = resumoPorTipo.reduce((acc, r) => acc + r.quantidade, 0)

  // Verificar se "Todos" está selecionado (nenhum tipo específico)
  const todosSelecionado = tipoSelecionado === null

  return (
    <div className="mb-6">
      <p className="text-sm text-slate-500 mb-2">Filtrar por tipo (clique para selecionar)</p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card "Todos" */}
        <button
          onClick={() => onTipoChange(null)}
          className={`
            p-3 rounded-xl border-2 transition-all text-left relative
            ${CORES_TIPO.todos.bg} ${CORES_TIPO.todos.bgHover} ${CORES_TIPO.todos.text}
            ${todosSelecionado 
              ? `${CORES_TIPO.todos.border} ring-2 ${CORES_TIPO.todos.ring} shadow-md` 
              : 'border-transparent'
            }
          `}
        >
          <div className="flex items-center gap-1 mb-1">
            <LayoutGrid className="w-3 h-3" />
            <p className="text-xs font-medium opacity-80">Todos</p>
          </div>
          <p className="text-lg font-bold">{formatarMoeda(totalGeral)}</p>
          <p className="text-xs opacity-60">{quantidadeGeral}x</p>
        </button>

        {/* Cards por tipo */}
        {TIPOS_PAGAMENTO_EXTRA.map(tipo => {
          const cores = CORES_TIPO[tipo.value] || CORES_TIPO.outros
          const resumo = resumoMap.get(tipo.value as TipoPagamentoExtra)
          const total = resumo?.total || 0
          const quantidade = resumo?.quantidade || 0
          const selecionado = tipoSelecionado === tipo.value

          return (
            <button
              key={tipo.value}
              onClick={() => onTipoChange(selecionado ? null : tipo.value as TipoPagamentoExtra)}
              className={`
                p-3 rounded-xl border-2 transition-all text-left
                ${cores.bg} ${cores.bgHover} ${cores.text}
                ${selecionado 
                  ? `${cores.border} ring-2 ${cores.ring} shadow-md` 
                  : 'border-transparent'
                }
              `}
            >
              <p className="text-xs font-medium opacity-80">{tipo.label}</p>
              <p className="text-lg font-bold">{formatarMoeda(total)}</p>
              <p className="text-xs opacity-60">{quantidade}x</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}