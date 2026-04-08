// ============================================
// MODAL: LANÇAMENTO DE FÉRIAS
// ============================================

'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Calendar, Calculator, AlertTriangle } from 'lucide-react'
import { 
  NovoLancamentoFerias,
  PeriodoAquisitivoComSaldo,
  calcularValoresFerias,
  validarAbono,
  REGRAS_FRACIONAMENTO,
  REGRAS_ABONO,
} from '@/types/ferias'
import { formatarMoeda, formatarData } from '@/utils/formatters'

interface ModalLancamentoFeriasProps {
  aberto: boolean
  onFechar: () => void
  onSalvar: (dados: NovoLancamentoFerias) => Promise<boolean>
  funcionarioId: number
  funcionarioNome: string
  salarioBase: number
  periodos: PeriodoAquisitivoComSaldo[]
  salvando?: boolean
}

export function ModalLancamentoFerias({
  aberto,
  onFechar,
  onSalvar,
  funcionarioId,
  funcionarioNome,
  salarioBase,
  periodos,
  salvando,
}: ModalLancamentoFeriasProps) {
  // Estado do formulário
  const [periodoId, setPeriodoId] = useState<number | null>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [diasGozados, setDiasGozados] = useState(30)
  const [diasAbono, setDiasAbono] = useState(0)
  
  // Adicionais
  const [mediaHorasExtras, setMediaHorasExtras] = useState(0)
  const [mediaComissoes, setMediaComissoes] = useState(0)
  const [mediaAdicionalNoturno, setMediaAdicionalNoturno] = useState(0)
  const [mediaPericulosidade, setMediaPericulosidade] = useState(0)
  const [mediaInsalubridade, setMediaInsalubridade] = useState(0)
  const [outrosAdicionais, setOutrosAdicionais] = useState(0)
  const [descricaoOutros, setDescricaoOutros] = useState('')
  
  const [observacoes, setObservacoes] = useState('')
  const [mostrarAdicionais, setMostrarAdicionais] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Período selecionado
  const periodoSelecionado = useMemo(() => {
    return periodos.find(p => p.id === periodoId) || null
  }, [periodos, periodoId])

  // Resetar ao abrir
  useEffect(() => {
    if (!aberto) return
    
    const primeiroPeriodo = periodos[0]
    setPeriodoId(primeiroPeriodo?.id || null)
    setDataInicio('')
    setDiasGozados(Math.min(primeiroPeriodo?.dias_saldo || 30, 30))
    setDiasAbono(0)
    setMediaHorasExtras(0)
    setMediaComissoes(0)
    setMediaAdicionalNoturno(0)
    setMediaPericulosidade(0)
    setMediaInsalubridade(0)
    setOutrosAdicionais(0)
    setDescricaoOutros('')
    setObservacoes('')
    setMostrarAdicionais(false)
    setErro(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  // Calcular data fim
  const dataFim = useMemo(() => {
    if (!dataInicio || diasGozados <= 0) return ''
    const inicio = new Date(dataInicio)
    inicio.setDate(inicio.getDate() + diasGozados - 1)
    return inicio.toISOString().split('T')[0]
  }, [dataInicio, diasGozados])

  // Calcular valores
  const calculo = useMemo(() => {
    return calcularValoresFerias({
      salario_base: salarioBase,
      media_horas_extras: mediaHorasExtras,
      media_comissoes: mediaComissoes,
      media_adicional_noturno: mediaAdicionalNoturno,
      media_periculosidade: mediaPericulosidade,
      media_insalubridade: mediaInsalubridade,
      outros_adicionais: outrosAdicionais,
      dias_gozados: diasGozados,
      dias_abono: diasAbono,
    })
  }, [
    salarioBase, mediaHorasExtras, mediaComissoes, mediaAdicionalNoturno,
    mediaPericulosidade, mediaInsalubridade, outrosAdicionais, diasGozados, diasAbono
  ])

  // Validar abono
  const validacaoAbono = useMemo(() => {
    if (!periodoSelecionado) return { valido: true }
    return validarAbono(diasAbono, periodoSelecionado.dias_saldo)
  }, [diasAbono, periodoSelecionado])

  // Máximo de dias permitido
  const maxDias = periodoSelecionado?.dias_saldo || 30
  const maxAbono = Math.min(REGRAS_ABONO.maximoDias, Math.floor(maxDias / 3))

  // Salvar
  async function handleSalvar() {
    setErro(null)

    // Validações
    if (!periodoId) {
      setErro('Selecione um período aquisitivo')
      return
    }
    if (!dataInicio) {
      setErro('Informe a data de início')
      return
    }
    if (diasGozados < REGRAS_FRACIONAMENTO.minimoDiasPrimeiraParcela) {
      setErro(`Mínimo de ${REGRAS_FRACIONAMENTO.minimoDiasPrimeiraParcela} dias para férias`)
      return
    }
    if (!validacaoAbono.valido) {
      setErro(validacaoAbono.erro || null)
      return
    }

    const dados: NovoLancamentoFerias = {
      periodo_aquisitivo_id: periodoId,
      funcionario_id: funcionarioId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      dias_gozados: diasGozados,
      dias_abono: diasAbono,
      media_horas_extras: mediaHorasExtras,
      media_comissoes: mediaComissoes,
      media_adicional_noturno: mediaAdicionalNoturno,
      media_periculosidade: mediaPericulosidade,
      media_insalubridade: mediaInsalubridade,
      outros_adicionais: outrosAdicionais,
      descricao_outros_adicionais: descricaoOutros || undefined,
      observacoes: observacoes || undefined,
    }

    const sucesso = await onSalvar(dados)
    if (!sucesso) {
      setErro('Erro ao salvar. Verifique os dados e tente novamente.')
    }
  }

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Programar Férias</h2>
            <p className="text-sm text-slate-500 mt-1">{funcionarioNome}</p>
          </div>
          <button
            onClick={onFechar}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Erro */}
          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {erro}
            </div>
          )}

          {/* Período Aquisitivo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Período Aquisitivo
            </label>
            <select
              value={periodoId || ''}
              onChange={(e) => setPeriodoId(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numero}º período ({formatarData(p.data_inicio)} - {formatarData(p.data_fim)}) — {p.dias_saldo} dias disponíveis
                </option>
              ))}
            </select>
          </div>

          {/* Datas e Dias */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Término
              </label>
              <input
                type="date"
                value={dataFim}
                readOnly
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dias de Férias
              </label>
              <input
                type="number"
                min={REGRAS_FRACIONAMENTO.minimoDiasPrimeiraParcela}
                max={maxDias - diasAbono}
                value={diasGozados}
                onChange={(e) => setDiasGozados(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Mínimo {REGRAS_FRACIONAMENTO.minimoDiasPrimeiraParcela} dias
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Abono Pecuniário (vender)
              </label>
              <input
                type="number"
                min={0}
                max={maxAbono}
                value={diasAbono}
                onChange={(e) => setDiasAbono(Number(e.target.value))}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none ${
                  !validacaoAbono.valido ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              <p className="text-xs text-slate-400 mt-1">
                Máximo {maxAbono} dias (1/3)
              </p>
            </div>
          </div>

          {/* Adicionais (colapsável) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMostrarAdicionais(!mostrarAdicionais)}
              className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="font-medium text-slate-700">Adicionais (médias)</span>
              <span className="text-sm text-slate-500">
                {mostrarAdicionais ? '▲ Ocultar' : '▼ Expandir'}
              </span>
            </button>

            {mostrarAdicionais && (
              <div className="p-4 space-y-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Horas Extras</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={mediaHorasExtras}
                      onChange={(e) => setMediaHorasExtras(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Comissões</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={mediaComissoes}
                      onChange={(e) => setMediaComissoes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Adicional Noturno</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={mediaAdicionalNoturno}
                      onChange={(e) => setMediaAdicionalNoturno(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Periculosidade</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={mediaPericulosidade}
                      onChange={(e) => setMediaPericulosidade(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Insalubridade</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={mediaInsalubridade}
                      onChange={(e) => setMediaInsalubridade(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Outros</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={outrosAdicionais}
                      onChange={(e) => setOutrosAdicionais(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                {outrosAdicionais > 0 && (
                  <input
                    type="text"
                    value={descricaoOutros}
                    onChange={(e) => setDescricaoOutros(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Descrição dos outros adicionais"
                  />
                )}
              </div>
            )}
          </div>

          {/* Resumo de Valores */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-slate-500" />
              <h4 className="font-medium text-slate-700">Resumo de Valores</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Base de cálculo</span>
                <span className="font-medium">{formatarMoeda(calculo.base_calculo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Férias ({diasGozados} dias)</span>
                <span className="font-medium">{formatarMoeda(calculo.valor_ferias)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">1/3 Constitucional</span>
                <span className="font-medium">{formatarMoeda(calculo.valor_terco)}</span>
              </div>
              {diasAbono > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Abono ({diasAbono} dias)</span>
                    <span className="font-medium">{formatarMoeda(calculo.valor_abono)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">1/3 sobre Abono</span>
                    <span className="font-medium">{formatarMoeda(calculo.valor_terco_abono)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Total Bruto</span>
                <span className="font-bold text-lg text-emerald-600">{formatarMoeda(calculo.valor_total)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
              placeholder="Observações sobre este lançamento..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Programar Férias'}
          </button>
        </div>
      </div>
    </div>
  )
}