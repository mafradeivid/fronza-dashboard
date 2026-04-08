// ============================================
// CARD DE PERÍODOS DE EXPERIÊNCIA
// ============================================

import { Clock, AlertTriangle, CheckCircle, User } from 'lucide-react'
import { Funcionario,  } from '@/types/pessoas'

interface FuncionarioExperiencia {
  funcionario: Funcionario
  tipo: '1º período' | '2º período'
  diasRestantes: number
  dataFim: Date
}

interface CardExperienciasProps {
  lista: FuncionarioExperiencia[]
}

export function CardExperiencias({ lista }: CardExperienciasProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Períodos de Experiência
          </h2>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {lista.length} vencendo
          </div>
        </div>
      </div>
      
      {/* Lista */}
      <div className="max-h-80 overflow-y-auto">
        {lista.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p>Nenhum período vencendo nos próximos 30 dias</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lista.map((item, index) => {
              const isUrgente = item.diasRestantes <= 7
              const isHoje = item.diasRestantes === 0
              
              return (
                <div 
                  key={`${item.funcionario.id}-${index}`}
                  className={`p-4 flex items-center gap-3 ${isUrgente ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                >
                  {/* Ícone de urgência */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isUrgente ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-600'}
                  `}>
                    {isUrgente ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {item.funcionario.nome_completo}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.funcionario.empresa?.razao_social}
                      {item.funcionario.cargo && ` • ${item.funcionario.cargo.nome}`}
                    </p>
                  </div>
                  
                  {/* Status */}
                  <div className="text-right">
                    <span className={`
                      inline-block px-2 py-1 rounded-full text-xs font-medium
                      ${item.tipo === '1º período' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}
                    `}>
                      {item.tipo}
                    </span>
                    <p className={`text-sm font-medium mt-1 ${isUrgente ? 'text-red-600' : 'text-slate-600'}`}>
                    {item.diasRestantes === 0 && (
                        <span className="text-red-600 font-bold">Vence hoje!</span>
                    )}
                    {item.diasRestantes === 1 && (
                        <span className="text-amber-600 font-bold">Amanhã</span>
                    )}
                    {item.diasRestantes > 1 && (
                        <>em {item.diasRestantes} dias</>
                    )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.dataFim.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}