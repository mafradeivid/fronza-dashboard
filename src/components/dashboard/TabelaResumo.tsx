'use client'

import { ResumoMensal } from '@/services/dreService'

interface TabelaResumoProps {
  dados: ResumoMensal[]
}

export function TabelaResumo({ dados }: TabelaResumoProps) {
  const acumulado = {
    receitasOperacionais: dados.reduce((acc, d) => acc + d.receitasOperacionais, 0),
    descontosRecebidos: dados.reduce((acc, d) => acc + d.descontosRecebidos, 0),
    totalReceitas: dados.reduce((acc, d) => acc + d.totalReceitas, 0),
    impostos: dados.reduce((acc, d) => acc + d.impostos, 0),
    despesasOperacionais: dados.reduce((acc, d) => acc + d.despesasOperacionais, 0),
    gestaoPessoas: dados.reduce((acc, d) => acc + d.gestaoPessoas, 0),
    cmv: dados.reduce((acc, d) => acc + d.cmv, 0),
    totalDespesas: dados.reduce((acc, d) => acc + d.totalDespesas, 0),
    resultadoOperacao: dados.reduce((acc, d) => acc + d.resultadoOperacao, 0),
  }

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const calcularPercent = (valor: number, total: number) => {
    if (total === 0) return '0,0%'
    return ((valor / total) * 100).toFixed(1).replace('.', ',') + '%'
  }

  const linhas = [
    { tipo: 'header', label: 'RECEITAS', campo: null },
    { tipo: 'item', label: 'Receitas Operacionais', campo: 'receitasOperacionais' },
    { tipo: 'item', label: 'Descontos Recebidos', campo: 'descontosRecebidos' },
    { tipo: 'total-receita', label: 'TOTAL RECEITAS', campo: 'totalReceitas' },
    { tipo: 'spacer', label: '', campo: null },
    { tipo: 'header', label: 'DESPESAS', campo: null },
    { tipo: 'item-despesa', label: 'Impostos', campo: 'impostos' },
    { tipo: 'item-despesa', label: 'Despesas Operacionais', campo: 'despesasOperacionais' },
    { tipo: 'item-despesa', label: 'Gestão de Pessoas', campo: 'gestaoPessoas' },
    { tipo: 'item-despesa', label: 'CMV (Compra Mercadorias)', campo: 'cmv' },
    { tipo: 'total-despesa', label: 'TOTAL DESPESAS', campo: 'totalDespesas' },
    { tipo: 'spacer', label: '', campo: null },
    { tipo: 'resultado', label: 'RESULTADO OPERAÇÃO', campo: 'resultadoOperacao' },
  ]

  const getEstiloLinha = (tipo: string, valor?: number) => {
    switch (tipo) {
      case 'header':
        return 'bg-slate-800 text-white font-semibold text-sm'
      case 'total-receita':
        return 'bg-emerald-600 text-white font-bold'
      case 'total-despesa':
        return 'bg-red-600 text-white font-bold'
      case 'resultado':
        if (valor !== undefined && valor < 0) {
          return 'bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg'
        }
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg'
      case 'spacer':
        return 'h-2 bg-slate-100'
      default:
        return 'bg-white hover:bg-slate-50 text-slate-700'
    }
  }

  const getEstiloCelulaResultado = (valor: number, isAcumulado: boolean = false) => {
    const isNegativo = valor < 0
    if (isAcumulado) {
      return isNegativo ? 'bg-red-700' : 'bg-blue-700'
    }
    return isNegativo ? 'bg-red-600' : 'bg-blue-600'
  }

  const renderCelula = (keyId: string, valor: number, totalReceita: number, tipo: string, isAcumulado: boolean = false) => {
    const percent = calcularPercent(valor, totalReceita)
    
    const getBgAcumulado = () => {
      if (!isAcumulado) return ''
      if (tipo === 'resultado') return getEstiloCelulaResultado(valor, true)
      if (tipo === 'total-receita') return 'bg-emerald-700'
      if (tipo === 'total-despesa') return 'bg-red-700'
      return 'bg-blue-50'
    }

    const isResultado = tipo === 'resultado'
    const isNegativo = valor < 0

    return (
      <td 
        key={keyId}
        className={`p-3 text-right tabular-nums whitespace-nowrap ${isAcumulado ? `sticky right-0 z-10 ${getBgAcumulado()}` : ''} ${isResultado && !isAcumulado ? getEstiloCelulaResultado(valor) : ''}`}
      >
        <div className={`${isAcumulado ? 'font-bold' : ''} ${isResultado && isNegativo ? 'text-white' : ''}`}>
          {formatarValor(valor)}
        </div>
        <div className={`text-xs ${
          tipo === 'resultado' || tipo === 'total-receita' || tipo === 'total-despesa' 
            ? 'opacity-75' 
            : 'text-slate-400'
        }`}>
          {percent}
        </div>
      </td>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <th className="text-left p-4 sticky left-0 bg-slate-900 min-w-[220px] z-20 font-semibold">
                Conta
              </th>
              {dados.map((d) => (
                <th key={d.mes} className="text-right p-4 min-w-[120px] font-medium whitespace-nowrap">
                  {d.label}
                </th>
              ))}
              <th className="text-right p-4 min-w-[140px] bg-blue-900 sticky right-0 z-20 font-bold">
                ACUMULADO
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, idx) => {
              if (linha.tipo === 'spacer') {
                return <tr key={idx} className={getEstiloLinha(linha.tipo)}><td colSpan={dados.length + 2}></td></tr>
              }

              // Para linha de resultado, passar o valor do acumulado para definir estilo
              const valorResultado = linha.campo === 'resultadoOperacao' ? acumulado.resultadoOperacao : undefined

              return (
                <tr key={idx} className={`${getEstiloLinha(linha.tipo, valorResultado)} border-b border-slate-100 transition-colors`}>
                  <td className={`p-4 sticky left-0 z-10 whitespace-nowrap ${getEstiloLinha(linha.tipo, valorResultado)}`}>
                    {(linha.tipo === 'item' || linha.tipo === 'item-despesa') && <span className="text-slate-400 mr-2">•</span>}
                    {linha.label}
                  </td>
                  {linha.campo ? (
                    <>
                      {dados.map((d) => 
                        renderCelula(
                          d.mes,
                          d[linha.campo as keyof ResumoMensal] as number,
                          d.totalReceitas,
                          linha.tipo
                        )
                      )}
                      {renderCelula(
                        'acumulado',
                        acumulado[linha.campo as keyof typeof acumulado],
                        acumulado.totalReceitas,
                        linha.tipo,
                        true
                      )}
                    </>
                  ) : (
                    <>
                      {dados.map((d) => (
                        <td key={d.mes} className="p-4"></td>
                      ))}
                      <td className={`p-4 sticky right-0 z-10 ${
                        linha.tipo === 'header' ? 'bg-slate-800' : 'bg-blue-900'
                      }`}></td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}