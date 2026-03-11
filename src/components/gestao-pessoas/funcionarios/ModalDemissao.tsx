// ============================================
// MODAL DE DEMISSÃO
// ============================================

'use client'

import { useState } from 'react'
import { X, AlertTriangle, Calendar, FileText, Info } from 'lucide-react'
import { Funcionario, TipoDemissao, DadosDemissao } from '@/types/pessoas'

interface ModalDemissaoProps {
  funcionario: Funcionario
  tiposDemissao: TipoDemissao[]
  aberto: boolean
  salvando: boolean
  onFechar: () => void
  onConfirmar: (dados: DadosDemissao) => Promise<boolean>
}

// Calcular último dia do mês baseado na data
const calcularUltimoDiaMes = (data: string): string => {
  if (!data) return ''
  const d = new Date(data)
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return ultimoDia.toISOString().split('T')[0]
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

  // Handler para fechar e resetar
  const handleFechar = () => {
    setTipoDemissaoId(null)
    setDataDesligamento('')
    setDataUltimoDia('')
    setErro(null)
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

    const sucesso = await onConfirmar({
      tipo_demissao_id: tipoDemissaoId,
      data_desligamento: dataDesligamento,
      data_ultimo_dia: dataUltimoDia,
    })

    if (sucesso) {
      setTipoDemissaoId(null)
      setDataDesligamento('')
      setDataUltimoDia('')
      setErro(null)
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
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
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
          <button
            onClick={handleFechar}
            disabled={salvando}
            className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={salvando}
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