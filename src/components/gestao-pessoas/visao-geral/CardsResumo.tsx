import { Users, Building2, Cake, Award } from 'lucide-react'

interface CardsResumoProps {
  totalFuncionarios: number
  totalEmpresas: number
  totalAniversariosProximos: number
  totalAniversariosEmpresaProximos: number
}

export function CardsResumo({
  totalFuncionarios,
  totalEmpresas,
  totalAniversariosProximos,
  totalAniversariosEmpresaProximos,
}: CardsResumoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Funcionários */}
      <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-sm font-medium">Funcionários Ativos</p>
            <p className="text-4xl font-bold mt-1">{totalFuncionarios}</p>
          </div>
          <Users className="w-12 h-12 text-violet-300" />
        </div>
      </div>

      {/* Total de Empresas */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Empresas</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totalEmpresas}</p>
          </div>
          <Building2 className="w-10 h-10 text-blue-500" />
        </div>
      </div>

      {/* Aniversariantes */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Aniversários (30 dias)</p>
            <p className="text-3xl font-bold text-pink-600 mt-1">{totalAniversariosProximos}</p>
          </div>
          <Cake className="w-10 h-10 text-pink-500" />
        </div>
      </div>

      {/* Aniversários de Empresa */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Aniv. Empresa (30 dias)</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{totalAniversariosEmpresaProximos}</p>
          </div>
          <Award className="w-10 h-10 text-amber-500" />
        </div>
      </div>
    </div>
  )
}