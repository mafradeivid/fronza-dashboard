'use client'

import { Printer, X } from 'lucide-react'

interface BarraSelecaoProps {
  quantidade: number
  onGerarRecibos: () => void
  onLimpar: () => void
}

export function BarraSelecao({
  quantidade,
  onGerarRecibos,
  onLimpar,
}: BarraSelecaoProps) {
  if (quantidade === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 px-6 py-3 bg-slate-800 text-white rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
            {quantidade}
          </span>
          <span className="text-slate-300">selecionado(s)</span>
        </div>
        
        <div className="w-px h-6 bg-slate-600" />
        
        <button
          onClick={onGerarRecibos}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors font-medium"
        >
          <Printer className="w-4 h-4" />
          Gerar Recibos ({quantidade})
        </button>
        
        <button
          onClick={onLimpar}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Limpar seleção"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}