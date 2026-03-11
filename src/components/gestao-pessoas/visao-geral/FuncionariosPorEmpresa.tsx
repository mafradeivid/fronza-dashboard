import { Building2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { EmpresaResumo } from '@/hooks/useVisaoGeralRH'

interface FuncionariosPorEmpresaProps {
  dados: EmpresaResumo[]
}

export function FuncionariosPorEmpresa({ dados }: FuncionariosPorEmpresaProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Funcionários por Empresa
        </h2>
        <Link 
          href="/gestao-pessoas/funcionarios"
          className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          Ver todos <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dados.map((emp, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
          >
            <span className="text-slate-700 font-medium truncate mr-2">{emp.nome}</span>
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold">
              {emp.quantidade}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}