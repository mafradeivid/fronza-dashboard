'use client'

import { Users, Cake, Briefcase, Gift, Award } from 'lucide-react'
import { useVisaoGeralRH } from '@/hooks/useVisaoGeralRH'
import { LoadingState } from '@/components/gestao-pessoas'
import { 
  CardsResumo, 
  FuncionariosPorEmpresa, 
  CardAniversarios, 
  LinksRapidos 
} from '@/components/gestao-pessoas/visao-geral'

export default function GestaoVisaoGeralPage() {
  const {
    carregando,
    totalFuncionarios,
    totalEmpresas,
    totalAniversariosProximos,
    totalAniversariosEmpresaProximos,
    funcionariosPorEmpresa,
    aniversariantesNascimento,
    aniversariantesEmpresa,
    filtroAnivNasc,
    setFiltroAnivNasc,
    mesAnivNasc,
    setMesAnivNasc,
    filtroAnivEmp,
    setFiltroAnivEmp,
    mesAnivEmp,
    setMesAnivEmp,
  } = useVisaoGeralRH()

  if (carregando) {
    return <LoadingState mensagem="Carregando dados..." cor="violet" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Gestão de Pessoas</h1>
        </div>
        <p className="text-violet-200">Visão geral do módulo de RH</p>
      </div>

      <div className="p-6">
        {/* Cards de Resumo */}
        <CardsResumo
          totalFuncionarios={totalFuncionarios}
          totalEmpresas={totalEmpresas}
          totalAniversariosProximos={totalAniversariosProximos}
          totalAniversariosEmpresaProximos={totalAniversariosEmpresaProximos}
        />

        {/* Funcionários por Empresa */}
        <FuncionariosPorEmpresa dados={funcionariosPorEmpresa} />

        {/* Grid de Aniversários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardAniversarios
            titulo="Aniversários"
            icone={Cake}
            iconeDireita={Gift}
            corPrimaria="pink"
            tipo="nascimento"
            lista={aniversariantesNascimento}
            filtro={filtroAnivNasc}
            setFiltro={setFiltroAnivNasc}
            mesSelecionado={mesAnivNasc}
            setMesSelecionado={setMesAnivNasc}
          />

          <CardAniversarios
            titulo="Aniversários de Empresa"
            icone={Briefcase}
            iconeDireita={Award}
            corPrimaria="amber"
            tipo="empresa"
            lista={aniversariantesEmpresa}
            filtro={filtroAnivEmp}
            setFiltro={setFiltroAnivEmp}
            mesSelecionado={mesAnivEmp}
            setMesSelecionado={setMesAnivEmp}
          />
        </div>

        {/* Links Rápidos */}
        <LinksRapidos />
      </div>
    </div>
  )
}