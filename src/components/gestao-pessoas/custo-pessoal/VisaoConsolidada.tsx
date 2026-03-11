'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CustoMensal } from '@/types/custoPessoal'
import { formatarMoeda } from '@/utils/formatters'

interface VisaoConsolidadaProps {
  custosMensais: CustoMensal[]
}

// Cores para o gráfico
const CORES = {
  salarios: '#3b82f6',
  outrosProventos: '#8b5cf6',
  encargos: '#f59e0b',
  provisoes: '#10b981',
  pagamentosExtras: '#ec4899',
}

export function VisaoConsolidada({ custosMensais }: VisaoConsolidadaProps) {
  // Calcular totais consolidados
  const totais = custosMensais.reduce(
    (acc, mes) => ({
      salarios: acc.salarios + mes.salarios,
      outrosProventos: acc.outrosProventos + mes.outrosProventos,
      encargos: acc.encargos + mes.totalEncargos,
      provisoes: acc.provisoes + mes.totalProvisoes,
      pagamentosExtras: acc.pagamentosExtras + mes.pagamentosExtras,
      custoTotal: acc.custoTotal + mes.custoTotal,
    }),
    {
      salarios: 0,
      outrosProventos: 0,
      encargos: 0,
      provisoes: 0,
      pagamentosExtras: 0,
      custoTotal: 0,
    }
  )

  // Dados para o gráfico de pizza (agrupados)
  const dadosGrafico = [
    { name: 'Salários', value: totais.salarios, color: CORES.salarios },
    { name: 'Outros Proventos', value: totais.outrosProventos, color: CORES.outrosProventos },
    { name: 'Encargos', value: totais.encargos, color: CORES.encargos },
    { name: 'Provisões', value: totais.provisoes, color: CORES.provisoes },
    { name: 'Pagamentos Extras', value: totais.pagamentosExtras, color: CORES.pagamentosExtras },
  ].filter(d => d.value > 0)

  // Linhas da tabela (agrupadas)
  const linhasTabela = [
    { chave: 'salarios', label: 'Salários', cor: CORES.salarios },
    { chave: 'outrosProventos', label: 'Outros Proventos', cor: CORES.outrosProventos },
    { chave: 'encargos', label: 'Encargos (FGTS + INSS)', cor: CORES.encargos },
    { chave: 'provisoes', label: 'Provisões (13º + Férias + 1/3 + Rescisão)', cor: CORES.provisoes },
    { chave: 'pagamentosExtras', label: 'Pagamentos Extras', cor: CORES.pagamentosExtras },
  ]

  // Função para obter valor do mês por chave agrupada
  const getValorMes = (mes: CustoMensal, chave: string): number => {
    switch (chave) {
      case 'salarios': return mes.salarios
      case 'outrosProventos': return mes.outrosProventos
      case 'encargos': return mes.totalEncargos
      case 'provisoes': return mes.totalProvisoes
      case 'pagamentosExtras': return mes.pagamentosExtras
      default: return 0
    }
  }

  // Função para obter valor total por chave
  const getValorTotal = (chave: string): number => {
    switch (chave) {
      case 'salarios': return totais.salarios
      case 'outrosProventos': return totais.outrosProventos
      case 'encargos': return totais.encargos
      case 'provisoes': return totais.provisoes
      case 'pagamentosExtras': return totais.pagamentosExtras
      default: return 0
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Composição do Custo</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatarMoeda(Number(value) || 0)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda manual */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {dadosGrafico.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Detalhamento por Componente</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Componente</th>
                {custosMensais.map(mes => (
                  <th key={mes.competenciaLabel} className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                    {mes.competenciaLabel}
                  </th>
                ))}
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-800 bg-slate-50">TOTAL</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">%</th>
              </tr>
            </thead>
            <tbody>
              {linhasTabela.map((linha) => (
                <tr key={linha.chave} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-700 flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: linha.cor }}
                    />
                    <span className="truncate">{linha.label}</span>
                  </td>
                  {custosMensais.map(mes => (
                    <td key={mes.competenciaLabel} className="text-right py-3 px-4 text-sm text-slate-600">
                      {formatarMoeda(getValorMes(mes, linha.chave))}
                    </td>
                  ))}
                  <td className="text-right py-3 px-4 text-sm font-medium text-slate-800 bg-slate-50">
                    {formatarMoeda(getValorTotal(linha.chave))}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-500">
                    {totais.custoTotal > 0 ? ((getValorTotal(linha.chave) / totais.custoTotal) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-700 text-white">
                <td className="py-3 px-4 text-sm font-bold">CUSTO TOTAL</td>
                {custosMensais.map(mes => (
                  <td key={mes.competenciaLabel} className="text-right py-3 px-4 text-sm font-bold">
                    {formatarMoeda(mes.custoTotal)}
                  </td>
                ))}
                <td className="text-right py-3 px-4 text-sm font-bold bg-slate-800">
                  {formatarMoeda(totais.custoTotal)}
                </td>
                <td className="text-right py-3 px-4 text-sm font-bold">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}