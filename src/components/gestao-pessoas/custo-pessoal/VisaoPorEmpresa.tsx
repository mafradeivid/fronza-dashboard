'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Building2 } from 'lucide-react'
import { CustoPorEmpresa } from '@/types/custoPessoal'
import { formatarMoeda } from '@/utils/formatters'

interface VisaoPorEmpresaProps {
  custosPorEmpresa: CustoPorEmpresa[]
}

const CORES_EMPRESAS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#14b8a6',
]

export function VisaoPorEmpresa({ custosPorEmpresa }: VisaoPorEmpresaProps) {
  // Dados para o gráfico
  const dadosGrafico = custosPorEmpresa.map((emp, index) => ({
    name: emp.empresaNome.length > 25 ? emp.empresaNome.substring(0, 22) + '...' : emp.empresaNome,
    nomeCompleto: emp.empresaNome,
    valor: emp.custoTotal,
    cor: CORES_EMPRESAS[index % CORES_EMPRESAS.length],
  }))

  const maxValor = Math.max(...custosPorEmpresa.map(e => e.custoTotal), 0)
  const escalaMax = Math.ceil(maxValor / 1000) * 1000 + 2000

  const formatarEixoX = (valor: number) => {
    if (valor >= 1000000) return `${(valor / 1000000).toFixed(1)}M`
    if (valor >= 1000) return `${(valor / 1000).toFixed(0)}k`
    return valor.toString()
  }

  // Calcular totais para a tabela
  const totais = custosPorEmpresa.reduce(
    (acc, emp) => ({
      salarios: acc.salarios + emp.salarios,
      outrosProventos: acc.outrosProventos + emp.outrosProventos,
      encargos: acc.encargos + emp.totalEncargos,
      provisoes: acc.provisoes + emp.totalProvisoes,
      pagamentosExtras: acc.pagamentosExtras + emp.pagamentosExtras,
      custoTotal: acc.custoTotal + emp.custoTotal,
      funcionarios: acc.funcionarios + emp.quantidadeFuncionarios,
    }),
    { salarios: 0, outrosProventos: 0, encargos: 0, provisoes: 0, pagamentosExtras: 0, custoTotal: 0, funcionarios: 0 }
  )

  if (custosPorEmpresa.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Nenhuma empresa encontrada para o período selecionado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Barras Horizontal */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Custo por Empresa</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico} layout="vertical" margin={{ top: 10, right: 80, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tickFormatter={formatarEixoX} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[0, escalaMax]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={140} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => formatarMoeda(Number(value) || 0)} labelFormatter={(label, payload) => payload?.[0]?.payload?.nomeCompleto || label} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={30}>
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
                <LabelList dataKey="valor" position="right" formatter={(value) => formatarMoeda(Number(value) || 0)} style={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Detalhamento por Empresa</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <th className="text-left py-4 px-5 font-semibold text-sm">Empresa</th>
                <th className="text-center py-4 px-3 font-semibold text-sm">Func.</th>
                <th className="text-right py-4 px-4 font-semibold text-sm">Salários</th>
                <th className="text-right py-4 px-4 font-semibold text-sm">Outros Prov.</th>
                <th className="text-right py-4 px-4 font-semibold text-sm">Encargos</th>
                <th className="text-right py-4 px-4 font-semibold text-sm">Provisões</th>
                <th className="text-right py-4 px-4 font-semibold text-sm">Pag. Extras</th>
                <th className="text-right py-4 px-4 font-semibold text-sm bg-slate-900">Total</th>
                <th className="text-center py-4 px-4 font-semibold text-sm bg-slate-900">%</th>
              </tr>
            </thead>
            <tbody>
              {custosPorEmpresa.map((empresa, index) => {
                const cor = CORES_EMPRESAS[index % CORES_EMPRESAS.length]
                const isUltimo = index === custosPorEmpresa.length - 1
                
                return (
                  <tr 
                    key={empresa.empresaId} 
                    className={`hover:bg-slate-50 transition-colors ${!isUltimo ? 'border-b border-slate-100' : ''}`}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: cor }}
                        />
                        <span className="font-medium text-slate-800">{empresa.empresaNome}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                        {empresa.quantidadeFuncionarios}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4 text-slate-600 tabular-nums">
                      {formatarMoeda(empresa.salarios)}
                    </td>
                    <td className="text-right py-4 px-4 text-slate-600 tabular-nums">
                      {formatarMoeda(empresa.outrosProventos)}
                    </td>
                    <td className="text-right py-4 px-4 text-slate-600 tabular-nums">
                      {formatarMoeda(empresa.totalEncargos)}
                    </td>
                    <td className="text-right py-4 px-4 text-slate-600 tabular-nums">
                      {formatarMoeda(empresa.totalProvisoes)}
                    </td>
                    <td className="text-right py-4 px-4 text-slate-600 tabular-nums">
                      {formatarMoeda(empresa.pagamentosExtras)}
                    </td>
                    <td className="text-right py-4 px-4 font-semibold text-slate-800 bg-slate-50 tabular-nums">
                      {formatarMoeda(empresa.custoTotal)}
                    </td>
                    <td className="text-center py-4 px-4 bg-slate-50">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${empresa.percentualTotal}%`,
                              backgroundColor: cor 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-12 text-right">
                          {empresa.percentualTotal.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-600 text-white">
                <td className="py-4 px-5 font-bold">TOTAL GERAL</td>
                <td className="text-center py-4 px-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold">
                    {totais.funcionarios}
                  </span>
                </td>
                <td className="text-right py-4 px-4 font-semibold tabular-nums">
                  {formatarMoeda(totais.salarios)}
                </td>
                <td className="text-right py-4 px-4 font-semibold tabular-nums">
                  {formatarMoeda(totais.outrosProventos)}
                </td>
                <td className="text-right py-4 px-4 font-semibold tabular-nums">
                  {formatarMoeda(totais.encargos)}
                </td>
                <td className="text-right py-4 px-4 font-semibold tabular-nums">
                  {formatarMoeda(totais.provisoes)}
                </td>
                <td className="text-right py-4 px-4 font-semibold tabular-nums">
                  {formatarMoeda(totais.pagamentosExtras)}
                </td>
                <td className="text-right py-4 px-4 font-bold bg-slate-800 tabular-nums">
                  {formatarMoeda(totais.custoTotal)}
                </td>
                <td className="text-center py-4 px-4 font-bold bg-slate-800">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}