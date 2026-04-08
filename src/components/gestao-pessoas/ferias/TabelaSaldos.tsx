// ============================================
// TABELA: SALDOS DE FÉRIAS
// ============================================

'use client'

import { Calendar, AlertTriangle, Search } from 'lucide-react'
import { SaldoFeriasFuncionario } from '@/types/ferias'

interface TabelaSaldosProps {
  saldos: SaldoFeriasFuncionario[]
  filtroNome: string
  setFiltroNome: (value: string) => void
  filtroStatus: 'todos' | 'com_saldo' | 'sem_saldo' | 'vencidas' | 'alerta'
  setFiltroStatus: (value: 'todos' | 'com_saldo' | 'sem_saldo' | 'vencidas' | 'alerta') => void
  onSelecionar?: (funcionarioId: number) => void
  carregando?: boolean
}

const OPCOES_FILTRO = [
  { value: 'todos', label: 'Todos' },
  { value: 'com_saldo', label: 'Com Saldo' },
  { value: 'sem_saldo', label: 'Sem Saldo' },
  { value: 'alerta', label: 'Com Alerta' },
  { value: 'vencidas', label: 'Vencidas' },
] as const

export function TabelaSaldos({
  saldos,
  filtroNome,
  setFiltroNome,
  filtroStatus,
  setFiltroStatus,
  onSelecionar,
  carregando,
}: TabelaSaldosProps) {
  if (carregando) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
          Carregando saldos...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Filtros */}
      <div className="p-4 border-b border-slate-200 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
          />
        </div>

        {/* Filtro de Status */}
        <div className="flex gap-2 flex-wrap">
          {OPCOES_FILTRO.map((opcao) => (
            <button
              key={opcao.value}
              onClick={() => setFiltroStatus(opcao.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === opcao.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {saldos.length === 0 ? (
        <div className="p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum funcionário encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Funcionário</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Empresa</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Direito</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Gozados</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Vendidos</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Programados</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Saldo</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Alertas</th>
              </tr>
            </thead>
            <tbody>
              {saldos.map((saldo) => (
                <tr
                  key={saldo.funcionario_id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    onSelecionar ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onSelecionar?.(saldo.funcionario_id)}
                >
                  {/* Funcionário */}
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{saldo.nome_completo}</p>
                  </td>

                  {/* Empresa */}
                  <td className="p-4 text-sm text-slate-600">
                    {saldo.empresa_nome}
                  </td>

                  {/* Direito */}
                  <td className="p-4 text-center">
                    <span className="font-medium text-slate-700">{saldo.total_dias_direito}</span>
                  </td>

                  {/* Gozados */}
                  <td className="p-4 text-center">
                    <span className="text-slate-600">{saldo.total_dias_gozados}</span>
                  </td>

                  {/* Vendidos */}
                  <td className="p-4 text-center">
                    <span className="text-slate-600">{saldo.total_dias_vendidos}</span>
                  </td>

                  {/* Programados */}
                  <td className="p-4 text-center">
                    <span className="text-blue-600">{saldo.total_dias_programados}</span>
                  </td>

                  {/* Saldo */}
                  <td className="p-4 text-center">
                    <span className={`text-lg font-bold ${
                      saldo.saldo_disponivel === 0 ? 'text-slate-400' :
                      saldo.saldo_disponivel <= 10 ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {saldo.saldo_disponivel}
                    </span>
                  </td>

                  {/* Alertas */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {saldo.tem_ferias_vencidas && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Vencidas
                        </span>
                      )}
                      {saldo.alerta_vencendo && !saldo.tem_ferias_vencidas && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Vencendo
                        </span>
                      )}
                      {!saldo.tem_ferias_vencidas && !saldo.alerta_vencendo && (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
        {saldos.length} funcionário{saldos.length !== 1 ? 's' : ''} encontrado{saldos.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
