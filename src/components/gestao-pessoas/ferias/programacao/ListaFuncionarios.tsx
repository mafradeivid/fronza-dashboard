// ============================================
// COMPONENTE: LISTA FUNCIONÁRIOS
// ============================================

import { Users } from 'lucide-react'
import { CardFuncionario } from './CardFuncionario'
import { FuncionarioAgrupado } from './types'

interface ListaFuncionariosProps {
  funcionarios: FuncionarioAgrupado[]
  carregando: boolean
  erro: string | null
  onAbrirFuncionario: (func: FuncionarioAgrupado) => void
}

export function ListaFuncionarios({
  funcionarios,
  carregando,
  erro,
  onAbrirFuncionario,
}: ListaFuncionariosProps) {
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-red-600">
        {erro}
      </div>
    )
  }

  if (funcionarios.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Nenhum funcionário encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {funcionarios.map((func) => (
        <CardFuncionario
          key={func.funcionario_id}
          funcionario={func}
          onAbrir={() => onAbrirFuncionario(func)}
        />
      ))}
    </div>
  )
}