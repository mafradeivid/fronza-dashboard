'use client'

import { ChevronDown, ChevronRight, User, Building2, Briefcase } from 'lucide-react'
import { CustoPorFuncionario } from '@/types/custoPessoal'
import { formatarMoeda } from '@/utils/formatters'

interface VisaoPorFuncionarioProps {
  custosPorFuncionario: CustoPorFuncionario[]
  funcionarioExpandido: number | null
  onToggleExpandir: (id: number) => void
}

export function VisaoPorFuncionario({
  custosPorFuncionario,
  funcionarioExpandido,
  onToggleExpandir,
}: VisaoPorFuncionarioProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Custo por Funcionário</h3>
        <p className="text-sm text-slate-500">Clique para expandir e ver o detalhamento mensal</p>
      </div>

      <div className="divide-y divide-slate-100">
        {custosPorFuncionario.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum funcionário encontrado com os filtros selecionados
          </div>
        ) : (
          custosPorFuncionario.map((func) => {
            const expandido = funcionarioExpandido === func.funcionarioId
            const encargos = func.fgts + func.inssPatronal
            const provisoes = func.provisao13 + func.provisaoFerias + func.provisao13Ferias + func.provisaoRescisao

            return (
              <div key={func.funcionarioId}>
                {/* Linha Principal */}
                <button
                  onClick={() => onToggleExpandir(func.funcionarioId)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  {/* Chevron */}
                  <div className="text-slate-400">
                    {expandido ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-violet-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{func.funcionarioNome}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {func.empresaNome}
                      </span>
                      {func.cargoNome && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {func.cargoNome}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Salário Base */}
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-500">Salário Base</p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatarMoeda(func.salarioBase)}
                    </p>
                  </div>

                  {/* Custo Total */}
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Custo Total</p>
                    <p className="text-lg font-bold text-slate-800">
                      {formatarMoeda(func.custoTotal)}
                    </p>
                  </div>
                </button>

                {/* Detalhes Expandidos */}
                {expandido && (
                  <div className="bg-slate-50 px-4 pb-4">
                    <div className="ml-14">
                      {/* Resumo do Período */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Salários</p>
                          <p className="text-sm font-semibold text-blue-600">{formatarMoeda(func.salarios)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Outros</p>
                          <p className="text-sm font-semibold text-violet-600">{formatarMoeda(func.outrosProventos)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Encargos</p>
                          <p className="text-sm font-semibold text-amber-600">{formatarMoeda(encargos)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Provisões</p>
                          <p className="text-sm font-semibold text-emerald-600">{formatarMoeda(provisoes)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500">Extras</p>
                          <p className="text-sm font-semibold text-pink-600">{formatarMoeda(func.pagamentosExtras)}</p>
                        </div>
                      </div>

                      {/* Tabela Mensal */}
                      {func.custosMensais.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left py-2 px-3 font-medium text-slate-600">Mês</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-600">Salário</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-600">Encargos</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-600">Provisões</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-600">Extras</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-800">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {func.custosMensais.map((mes) => {
                                const encMes = mes.fgts + mes.inssPatronal
                                const provMes = mes.provisao13 + mes.provisaoFerias + mes.provisao13Ferias + mes.provisaoRescisao

                                return (
                                  <tr key={mes.competenciaLabel} className="border-b border-slate-100">
                                    <td className="py-2 px-3 text-slate-700">{mes.competenciaLabel}</td>
                                    <td className="text-right py-2 px-3 text-slate-600">{formatarMoeda(mes.salarios)}</td>
                                    <td className="text-right py-2 px-3 text-slate-600">{formatarMoeda(encMes)}</td>
                                    <td className="text-right py-2 px-3 text-slate-600">{formatarMoeda(provMes)}</td>
                                    <td className="text-right py-2 px-3 text-slate-600">{formatarMoeda(mes.pagamentosExtras)}</td>
                                    <td className="text-right py-2 px-3 font-semibold text-slate-800">{formatarMoeda(mes.custoTotal)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}