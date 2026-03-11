'use client'

import { ChevronLeft, ChevronRight, Building2, FolderTree, Briefcase, User, X } from 'lucide-react'
import { FiltrosCustoPessoal } from '@/types/custoPessoal'
import { Empresa, Setor, Cargo, Funcionario } from '@/types/pessoas'

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

const ANOS = [2024, 2025, 2026, 2027]

interface FiltrosPeriodoProps {
  filtros: FiltrosCustoPessoal
  empresas: Empresa[]
  setores: Setor[]
  cargos: Cargo[]
  funcionarios: Funcionario[]
  temFiltrosAtivos: boolean
  onFiltroChange: <K extends keyof FiltrosCustoPessoal>(campo: K, valor: FiltrosCustoPessoal[K]) => void
  onLimparFiltros: () => void
  onPeriodoAnterior: () => void
  onPeriodoProximo: () => void
}

export function FiltrosPeriodo({
  filtros,
  empresas,
  setores,
  cargos,
  funcionarios,
  temFiltrosAtivos,
  onFiltroChange,
  onLimparFiltros,
  onPeriodoAnterior,
  onPeriodoProximo,
}: FiltrosPeriodoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
      {/* Linha 1: Período */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPeriodoAnterior}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            title="Período anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 whitespace-nowrap">Período:</span>
            
            {/* Mês/Ano Início */}
            <select
              value={filtros.mesInicio}
              onChange={(e) => onFiltroChange('mesInicio', Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={filtros.anoInicio}
              onChange={(e) => onFiltroChange('anoInicio', Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {ANOS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <span className="text-slate-400">até</span>

            {/* Mês/Ano Fim */}
            <select
              value={filtros.mesFim}
              onChange={(e) => onFiltroChange('mesFim', Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={filtros.anoFim}
              onChange={(e) => onFiltroChange('anoFim', Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {ANOS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onPeriodoProximo}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            title="Próximo período"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Linha 2: Filtros de Dimensão */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Empresa */}
        <div className="flex items-center gap-2 flex-1">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={filtros.empresaId || ''}
            onChange={(e) => onFiltroChange('empresaId', e.target.value ? Number(e.target.value) : null)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Todas as Empresas</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.razao_social}</option>
            ))}
          </select>
        </div>

        {/* Setor */}
        <div className="flex items-center gap-2 flex-1">
          <FolderTree className="w-4 h-4 text-slate-400" />
          <select
            value={filtros.setorId || ''}
            onChange={(e) => onFiltroChange('setorId', e.target.value || null)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Todos os Setores</option>
            {setores.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>

        {/* Cargo */}
        <div className="flex items-center gap-2 flex-1">
          <Briefcase className="w-4 h-4 text-slate-400" />
          <select
            value={filtros.cargoId || ''}
            onChange={(e) => onFiltroChange('cargoId', e.target.value ? Number(e.target.value) : null)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Todos os Cargos</option>
            {cargos.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {/* Funcionário */}
        <div className="flex items-center gap-2 flex-1">
          <User className="w-4 h-4 text-slate-400" />
          <select
            value={filtros.funcionarioId || ''}
            onChange={(e) => onFiltroChange('funcionarioId', e.target.value ? Number(e.target.value) : null)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Todos os Funcionários</option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome_completo}</option>
            ))}
          </select>
        </div>

        {/* Limpar Filtros */}
        {temFiltrosAtivos && (
          <button
            onClick={onLimparFiltros}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>
    </div>
  )
}