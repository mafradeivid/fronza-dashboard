// ============================================
// COMPONENTE: MODAL FUNCIONÁRIO
// ============================================

import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { PeriodoParaProgramacao, CalculoProgramacao } from '@/types/ferias'
import { DetalhesFuncionario } from './DetalhesFuncionario'
import { FormularioProgramacao } from './FormularioProgramacao'
import { FuncionarioAgrupado } from './types'

interface ModalFuncionarioProps {
  funcionario: FuncionarioAgrupado
  periodoInicial?: PeriodoParaProgramacao | null
  salvando: boolean
  onFechar: () => void
  onCalcular: (diasGozo: number, diasAbono: number, dataInicio: string, salario?: number, saldo?: number) => CalculoProgramacao | null
  onSalvar: (periodoId: number, funcionarioId: number, dados: { data_inicio: string; dias_gozo: number; dias_abono: number }) => Promise<{ sucesso: boolean; erro?: string }>
  onAtualizar: () => void
}

export function ModalFuncionario({
  funcionario,
  periodoInicial,
  salvando,
  onFechar,
  onCalcular,
  onSalvar,
  onAtualizar,
}: ModalFuncionarioProps) {
  // Estado
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoParaProgramacao | null>(periodoInicial || null)
  const [diasGozo, setDiasGozo] = useState(periodoInicial ? Math.min(30, periodoInicial.saldo) : 30)
  const [diasAbono, setDiasAbono] = useState(0)
  const [dataInicio, setDataInicio] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  // Cálculo
  const calculo = periodoSelecionado && dataInicio
    ? onCalcular(diasGozo, diasAbono, dataInicio, funcionario.salario, periodoSelecionado.saldo)
    : null

  // Handlers
  const handleProgramar = (periodo: PeriodoParaProgramacao) => {
    setPeriodoSelecionado(periodo)
    setDiasGozo(Math.min(30, periodo.saldo))
    setDiasAbono(0)
    setDataInicio('')
    setErro(null)
  }

  const handleVoltar = () => {
    setPeriodoSelecionado(null)
    setErro(null)
  }

  const handleSalvar = async () => {
    if (!dataInicio) {
      setErro('Informe a data de início')
      return
    }

    if (!periodoSelecionado) {
      setErro('Nenhum período selecionado')
      return
    }

    const resultado = await onSalvar(
      periodoSelecionado.id,
      periodoSelecionado.funcionario_id,
      {
        data_inicio: dataInicio,
        dias_gozo: diasGozo,
        dias_abono: diasAbono,
      }
    )

    if (resultado.sucesso) {
      onAtualizar()
      setPeriodoSelecionado(null)
    } else {
      setErro(resultado.erro || 'Erro ao programar férias')
    }
  }

  // Título dinâmico
  const titulo = periodoSelecionado 
    ? 'Programar Férias' 
    : funcionario.funcionario_nome

  const subtitulo = periodoSelecionado
    ? `${periodoSelecionado.numero}º Período Aquisitivo`
    : funcionario.empresa_nome

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onFechar} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {periodoSelecionado && (
              <button onClick={handleVoltar} className="p-1 rounded hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
              <p className="text-sm text-slate-500">{subtitulo}</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {periodoSelecionado ? (
            <FormularioProgramacao
              periodo={periodoSelecionado}
              diasGozo={diasGozo}
              diasAbono={diasAbono}
              dataInicio={dataInicio}
              erro={erro}
              calculo={calculo}
              onDiasGozoChange={setDiasGozo}
              onDiasAbonoChange={setDiasAbono}
              onDataInicioChange={setDataInicio}
            />
          ) : (
            <DetalhesFuncionario
              funcionario={funcionario}
              onProgramar={handleProgramar}
            />
          )}
        </div>

        {/* Footer (só no formulário) */}
        {periodoSelecionado && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={handleVoltar}
              disabled={salvando}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando || !dataInicio}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar Programação'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}