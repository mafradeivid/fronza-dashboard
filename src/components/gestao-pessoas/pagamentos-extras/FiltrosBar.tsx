'use client'

import { Search, Filter, X, Building2, User, Wallet } from 'lucide-react'
import { Empresa, Funcionario, TIPOS_PAGAMENTO_EXTRA, TipoPagamentoExtra } from '@/types/pessoas'

interface FiltrosBarProps {
  busca: string
  empresa: number | null
  funcionario: number | null
  tipo: TipoPagamentoExtra | null
  empresas: Empresa[]
  funcionarios: Funcionario[]
  temFiltrosAtivos: boolean
  mostrarFiltros: boolean
  onBuscaChange: (valor: string) => void
  onEmpresaChange: (valor: number | null) => void
  onFuncionarioChange: (valor: number | null) => void
  onTipoChange: (valor: TipoPagamentoExtra | null) => void
  onToggleFiltros: () => void
  onLimpar: () => void
}

export function FiltrosBar({
  busca,
  empresa,
  funcionario,
  tipo,
  empresas,
  funcionarios,
  temFiltrosAtivos,
  mostrarFiltros,
  onBuscaChange,
  onEmpresaChange,
  onFuncionarioChange,
  onTipoChange,
  onToggleFiltros,
  onLimpar,
}: FiltrosBarProps) {
  // Funcionários filtrados por empresa
  const funcionariosFiltrados = empresa 
    ? funcionarios.filter(f => f.empresa_id === empresa)
    : funcionarios

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar por funcionário ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>

        {/* Botão Filtros */}
        <button
          onClick={onToggleFiltros}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
            temFiltrosAtivos 
              ? 'border-orange-500 bg-orange-50 text-orange-700' 
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {temFiltrosAtivos && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {[empresa, funcionario, tipo].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Limpar Filtros */}
        {temFiltrosAtivos && (
          <button
            onClick={onLimpar}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros Expandidos */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Building2 className="w-4 h-4" />
              Empresa
            </label>
            <select
              value={empresa || ''}
              onChange={(e) => {
                onEmpresaChange(e.target.value ? Number(e.target.value) : null)
                onFuncionarioChange(null)
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.razao_social}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <User className="w-4 h-4" />
              Funcionário
            </label>
            <select
              value={funcionario || ''}
              onChange={(e) => onFuncionarioChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              <option value="">Todos</option>
              {funcionariosFiltrados.map((f) => (
                <option key={f.id} value={f.id}>{f.nome_completo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Wallet className="w-4 h-4" />
              Tipo
            </label>
            <select
              value={tipo || ''}
              onChange={(e) => onTipoChange(e.target.value as TipoPagamentoExtra || null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              <option value="">Todos</option>
              {TIPOS_PAGAMENTO_EXTRA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}