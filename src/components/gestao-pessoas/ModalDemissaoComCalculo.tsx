// ============================================
// MODAL DE DEMISSÃO COM CÁLCULOS
// ============================================

'use client'

import { useState, useMemo } from 'react'
import { X, AlertTriangle, Calendar, FileText, Info, Calculator, DollarSign } from 'lucide-react'
import { Funcionario, TipoDemissao, DadosDemissao } from '@/types/pessoas'
import { useCalculoProporcional } from '@/hooks/useCalculoProporcional'

interface ModalDemissaoProps {
  funcionario: Funcionario
  tiposDemissao: TipoDemissao[]
  aberto: boolean
  salvando: boolean
  onFechar: () => void
  onConfirmar: (dados: DadosDemissao) => Promise<boolean>
}

// Formatar valor em BRL
const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Calcular último dia do mês baseado na data
const calcularUltimoDiaMes = (data: string): string => {
  if (!data) return ''
  const d = new Date(data)
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return ultimoDia.toISOString().split('T')[0]
}

// Mapeia nome do tipo para código interno
const mapearTipoDemissao = (nome: string): string => {
  const nomeLower = nome.toLowerCase()
  if (nomeLower.includes('justa causa')) return 'justa_causa'
  if (nomeLower.includes('sem justa') || nomeLower.includes('iniciativa empresa')) return 'sem_justa_causa'
  if (nomeLower.includes('pedido') || nomeLower.includes('iniciativa funcionário')) return 'pedido_demissao'
  if (nomeLower.includes('acordo') || nomeLower.includes('comum acordo')) return 'acordo'
  return 'outros'
}

export function ModalDemissao({
  funcionario,
  tiposDemissao,
  aberto,
  salvando,
  onFechar,
  onConfirmar,
}: ModalDemissaoProps) {
  const [tipoDemissaoId, setTipoDemissaoId] = useState<number | null>(null)
  const [dataDesligamento, setDataDesligamento] = useState('')
  const [dataUltimoDia, setDataUltimoDia] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const { resultado, loading: calculando, calcular, limpar } = useCalculoProporcional()

  // Busca o tipo selecionado e mapeia para código
  const tipoSelecionado = tiposDemissao.find(t => t.id === tipoDemissaoId)
  const codigoTipo = tipoSelecionado ? mapearTipoDemissao(tipoSelecionado.nome) : ''

  // Verifica se pode calcular
  const podeCalcular = !!(
    tipoDemissaoId && 
    dataUltimoDia && 
    funcionario.salario && 
    funcionario.admissao &&
    funcionario.id
  )

  // Calcula automaticamente quando dados mudam
  useMemo(() => {
    if (podeCalcular && aberto && funcionario.id) {
      calcular({
        empresaId: funcionario.empresa_id,
        funcionarioId: funcionario.id,
        salarioBase: funcionario.salario,
        dataAdmissao: funcionario.admissao,
        dataDemissao: dataUltimoDia,
        tipoDemissao: codigoTipo,
        salvarLog: false,
      })
    } else {
      limpar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoDemissaoId, dataUltimoDia, aberto])

  // Handler para fechar e resetar
  const handleFechar = () => {
    setTipoDemissaoId(null)
    setDataDesligamento('')
    setDataUltimoDia('')
    setErro(null)
    limpar()
    onFechar()
  }

  // Handler para mudança de data de desligamento
  const handleDataDesligamentoChange = (novaData: string) => {
    setDataDesligamento(novaData)
    // Auto-preenche último dia se ainda não tiver valor
    if (novaData && !dataUltimoDia) {
      setDataUltimoDia(calcularUltimoDiaMes(novaData))
    }
  }

  const handleConfirmar = async () => {
    setErro(null)

    // Validações
    if (!tipoDemissaoId) {
      setErro('Selecione o tipo de demissão')
      return
    }
    if (!dataDesligamento) {
      setErro('Informe a data de desligamento')
      return
    }
    if (!dataUltimoDia) {
      setErro('Informe a data do último dia')
      return
    }

    // Salva log do cálculo antes de confirmar
    if (resultado && funcionario.id) {
      await calcular({
        empresaId: funcionario.empresa_id,
        funcionarioId: funcionario.id,
        salarioBase: funcionario.salario,
        dataAdmissao: funcionario.admissao,
        dataDemissao: dataUltimoDia,
        tipoDemissao: codigoTipo,
        salvarLog: true,
      })
    }

    const sucesso = await onConfirmar({
      tipo_demissao_id: tipoDemissaoId,
      data_desligamento: dataDesligamento,
      data_ultimo_dia: dataUltimoDia,
    })

    if (sucesso) {
      handleFechar()
    } else {
      setErro('Erro ao registrar demissão')
    }
  }

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleFechar}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Registrar Demissão</h2>
              <p className="text-sm text-slate-500">{funcionario.nome_completo}</p>
            </div>
          </div>
          <button
            onClick={handleFechar}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Erro */}
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {erro}
            </div>
          )}

          {/* Tipo de Demissão */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <FileText className="w-4 h-4" />
              Tipo de Demissão
            </label>
            <select
              value={tipoDemissaoId || ''}
              onChange={(e) => setTipoDemissaoId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {tiposDemissao.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data de Desligamento */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4" />
              Data do Desligamento
            </label>
            <input
              type="date"
              value={dataDesligamento}
              onChange={(e) => handleDataDesligamentoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Data da comunicação ou rescisão contratual
            </p>
          </div>

          {/* Data do Último Dia */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4" />
              Último Dia de Trabalho
            </label>
            <input
              type="date"
              value={dataUltimoDia}
              onChange={(e) => setDataUltimoDia(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Último dia que conta no custo (fim do aviso prévio)
            </p>
          </div>

          {/* Prévia de Cálculos */}
          {podeCalcular && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
                <Calculator className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Prévia dos Valores</span>
                {calculando && (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin ml-auto" />
                )}
              </div>

              {resultado && (
                <div className="p-3 space-y-2">
                  {/* Saldo de Salário */}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      Saldo de Salário ({resultado.saldo_salario.dias_trabalhados} dias)
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatarMoeda(resultado.saldo_salario.valor_proporcional)}
                    </span>
                  </div>

                  {/* Férias Proporcionais */}
                  {resultado.ferias_proporcionais && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        Férias Prop. ({resultado.ferias_proporcionais.meses_direito}/12 + 1/3)
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatarMoeda(resultado.ferias_proporcionais.valor_total)}
                      </span>
                    </div>
                  )}

                  {/* 13º Proporcional */}
                  {resultado.decimo_terceiro_proporcional && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        13º Proporcional ({resultado.decimo_terceiro_proporcional.meses_ano}/12)
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatarMoeda(resultado.decimo_terceiro_proporcional.valor_proporcional)}
                      </span>
                    </div>
                  )}

                  {/* Multa FGTS */}
                  {resultado.multa_fgts && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Multa FGTS (40%)</span>
                      <span className="font-medium text-slate-800">
                        {formatarMoeda(resultado.multa_fgts)}
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-200 my-2" />

                  {/* Total */}
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Total Estimado
                    </span>
                    <span className="font-bold text-lg text-emerald-600">
                      {formatarMoeda(resultado.total)}
                    </span>
                  </div>

                  {/* Aviso */}
                  <p className="text-xs text-slate-500 mt-2">
                    * Valores estimados. Consulte o departamento pessoal para cálculo oficial.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Como funciona:</p>
              <p className="mt-1">
                O funcionário será contabilizado nos custos até a competência do 
                &ldquo;último dia de trabalho&rdquo;. A partir da competência seguinte, 
                não aparecerá mais nos cálculos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={handleFechar}
            disabled={salvando}
            className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={salvando || calculando}
            className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {salvando ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar Demissão'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}