// ============================================
// CARD DE FUNCIONÁRIOS AFASTADOS
// ============================================

import { UserX, Calendar, Building2, CheckCircle } from 'lucide-react'
import { Funcionario } from '@/types/pessoas'

interface CardAfastadosProps {
  lista: Funcionario[]
}

export function CardAfastados({ lista }: CardAfastadosProps) {
  // Agrupar por empresa
  const porEmpresa = lista.reduce((acc, func) => {
    const empresaNome = func.empresa?.razao_social || 'Sem Empresa'
    if (!acc[empresaNome]) acc[empresaNome] = []
    acc[empresaNome].push(func)
    return acc
  }, {} as Record<string, Funcionario[]>)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Funcionários Afastados
          </h2>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {lista.length} afastado{lista.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      {/* Lista */}
      <div className="max-h-80 overflow-y-auto">
        {lista.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p>Nenhum funcionário afastado</p>
          </div>
        ) : (
          <div>
            {Object.entries(porEmpresa).map(([empresaNome, funcionarios]) => (
              <div key={empresaNome}>
                {/* Header da empresa */}
                <div className="px-4 py-2 bg-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">{empresaNome}</span>
                  <span className="text-xs text-slate-400">({funcionarios.length})</span>
                </div>
                
                {/* Funcionários */}
                <div className="divide-y divide-slate-100">
                  {funcionarios.map((func) => (
                    <div 
                      key={func.id}
                      className="p-4 flex items-center gap-3 hover:bg-amber-50"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <UserX className="w-5 h-5" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {func.nome_completo}
                        </p>
                        <p className="text-xs text-slate-500">
                          {func.cargo?.nome || 'Sem cargo'}
                          {func.setor && ` • ${func.setor.nome}`}
                        </p>
                      </div>
                      
                      {/* Data de admissão */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>Admissão</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {new Date(func.admissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}