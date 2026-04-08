'use client'

import { useState } from 'react'
import { Building2, Printer } from 'lucide-react'
import { Modal } from '@/components/gestao-pessoas'
import { Empresa } from '@/types/pessoas'

interface ModalEmpresaReciboProps {
  aberto: boolean
  empresas: Empresa[]
  empresaPadrao?: Empresa | null
  quantidade: number
  onFechar: () => void
  onConfirmar: (empresa: Empresa) => void
}

export function ModalEmpresaRecibo({
  aberto,
  empresas,
  empresaPadrao,
  quantidade,
  onFechar,
  onConfirmar,
}: ModalEmpresaReciboProps) {
  // Calcula empresa inicial: padrão > ID 1 > primeira da lista
  const empresaInicial = 
    empresaPadrao?.id || 
    empresas.find(e => e.id === 1)?.id || 
    empresas[0]?.id || 
    null

  const [empresaId, setEmpresaId] = useState<number | null>(empresaInicial)

  // Atualiza quando abre com nova empresa padrão
  const empresaIdAtual = aberto ? (empresaId || empresaInicial) : empresaInicial

  const empresaSelecionada = empresas.find(e => e.id === empresaIdAtual)

  function handleConfirmar() {
    if (empresaSelecionada) {
      onConfirmar(empresaSelecionada)
    }
  }

  function handleFechar() {
    setEmpresaId(empresaInicial) // Reset ao fechar
    onFechar()
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={handleFechar}
      titulo="Gerar Recibo"
      largura="sm"
    >
      <div className="p-6 space-y-4">
        {/* Info */}
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-sm text-orange-600 font-medium">
            {quantidade === 1 
              ? '1 recibo será gerado' 
              : `${quantidade} recibos serão gerados`
            }
          </p>
        </div>

        {/* Seleção de Empresa */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Building2 className="w-4 h-4 inline mr-1" />
            Empresa Pagadora
          </label>
          <select
            value={empresaIdAtual || ''}
            onChange={(e) => setEmpresaId(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          >
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razao_social}
              </option>
            ))}
          </select>
        </div>

        {/* Preview dos dados */}
        {empresaSelecionada && (
          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 space-y-1">
            <p><strong>CNPJ:</strong> {empresaSelecionada.cnpj || '-'}</p>
            {empresaSelecionada.inscricao_estadual && (
              <p><strong>IE:</strong> {empresaSelecionada.inscricao_estadual}</p>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleFechar}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!empresaSelecionada}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Gerar PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}