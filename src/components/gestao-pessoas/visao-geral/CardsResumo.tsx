import { Users, Building2, Cake, Award, UserX, Clock } from 'lucide-react'

interface CardsResumoProps {
  totalFuncionarios: number
  totalEmpresas: number
  totalAniversariosProximos: number
  totalAniversariosEmpresaProximos: number
  totalAfastados?: number
  totalExperiencias?: number
}

export function CardsResumo({
  totalFuncionarios,
  totalEmpresas,
  totalAniversariosProximos,
  totalAniversariosEmpresaProximos,
  totalAfastados = 0,
  totalExperiencias = 0,
}: CardsResumoProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Total de Funcionários */}
      <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-sm font-medium">Funcionários Ativos</p>
            <p className="text-4xl font-bold mt-1">{totalFuncionarios}</p>
          </div>
          <Users className="w-10 h-10 text-violet-300" />
        </div>
      </div>

      {/* Total de Empresas */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Empresas</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totalEmpresas}</p>
          </div>
          <Building2 className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      {/* Aniversariantes */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Aniversários</p>
            <p className="text-3xl font-bold text-pink-600 mt-1">{totalAniversariosProximos}</p>
          </div>
          <Cake className="w-8 h-8 text-pink-500" />
        </div>
      </div>

      {/* Aniversários de Empresa */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Aniv. Empresa</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{totalAniversariosEmpresaProximos}</p>
          </div>
          <Award className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      {/* Experiências Vencendo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Experiências</p>
            <p className={`text-3xl font-bold mt-1 ${totalExperiencias > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
              {totalExperiencias}
            </p>
          </div>
          <Clock className={`w-8 h-8 ${totalExperiencias > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
        </div>
      </div>

      {/* Afastados */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Afastados</p>
            <p className={`text-3xl font-bold mt-1 ${totalAfastados > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {totalAfastados}
            </p>
          </div>
          <UserX className={`w-8 h-8 ${totalAfastados > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
        </div>
      </div>
    </div>
  )
}