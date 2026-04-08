import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
  largura?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function Modal({ aberto, onFechar, titulo, children, largura = 'md' }: ModalProps) {
  if (!aberto) return null

  const larguras = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${larguras[largura]} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <button 
            onClick={onFechar} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}