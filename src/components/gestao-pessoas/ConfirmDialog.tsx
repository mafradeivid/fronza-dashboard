import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  aberto: boolean
  titulo: string
  mensagem: string
  onConfirmar: () => void
  onCancelar: () => void
  labelConfirmar?: string
  labelCancelar?: string
  tipo?: 'perigo' | 'aviso' | 'info'
}

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  tipo = 'perigo'
}: ConfirmDialogProps) {
  if (!aberto) return null

  const cores = {
    perigo: {
      icone: 'bg-red-100 text-red-600',
      botao: 'bg-red-600 hover:bg-red-700',
    },
    aviso: {
      icone: 'bg-amber-100 text-amber-600',
      botao: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icone: 'bg-blue-100 text-blue-600',
      botao: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${cores[tipo].icone}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{titulo}</h3>
            <p className="text-sm text-slate-600">{mensagem}</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            {labelCancelar}
          </button>
          <button
            onClick={onConfirmar}
            className={`flex-1 px-4 py-2.5 ${cores[tipo].botao} text-white rounded-xl transition-colors font-medium text-sm`}
          >
            {labelConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}