'use client'

import { ChevronLeft, ChevronRight, Download, Printer, Building2 } from 'lucide-react'
import { formatarMoeda } from '@/utils/formatters'
import { Empresa } from '@/types/pessoas'

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

interface CompetenciaCardProps {
  mes: number
  ano: number
  totalGeral: number
  quantidadeGeral: number
  empresas: Empresa[]
  empresaSelecionada: number | null
  onMesChange: (mes: number) => void
  onAnoChange: (ano: number) => void
  onAnterior: () => void
  onProxima: () => void
  onEmpresaChange: (empresaId: number | null) => void
  onLote: () => void
  onExportar: () => void
}

export function CompetenciaCard({
  mes,
  ano,
  totalGeral,
  quantidadeGeral,
  empresas,
  empresaSelecionada,
  onMesChange,
  onAnoChange,
  onAnterior,
  onProxima,
  onEmpresaChange,
  onLote,
  onExportar,
}: CompetenciaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Navegação de Competência */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAnterior}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Competência:</span>
            <select
              value={mes}
              onChange={(e) => onMesChange(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={ano}
              onChange={(e) => onAnoChange(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {[2024, 2025, 2026, 2027].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onProxima}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filtro Empresa */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={empresaSelecionada || ''}
            onChange={(e) => onEmpresaChange(e.target.value ? Number(e.target.value) : null)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-w-[200px]"
          >
            <option value="">Todas as Empresas</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.razao_social}</option>
            ))}
          </select>
        </div>

        {/* Resumo + Ações */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">{quantidadeGeral} pagamento(s)</p>
            <p className="text-xl font-bold text-slate-800">{formatarMoeda(totalGeral)}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onLote}
              className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              Lançar em Lote
            </button>
            <button
              onClick={onExportar}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}