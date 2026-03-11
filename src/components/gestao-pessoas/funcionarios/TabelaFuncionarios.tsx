// ============================================
// TABELA DE FUNCIONÁRIOS
// ============================================

import { Users, Pencil, Trash2, Cake, Gift, UserX, UserCheck } from 'lucide-react'
import { Funcionario } from '@/types/pessoas'
import { EmptyState } from '@/components/gestao-pessoas'
import { BadgeStatus } from './BadgeStatus'
import { 
  formatarMoeda, 
  formatarData, 
  calcularTempoEmpresa,
  calcularIdade,
  calcularProximoAniversario,
  calcularAniversarioEmpresa
} from '@/utils/formatters'

interface TabelaFuncionariosProps {
  funcionarios: Funcionario[]
  temFiltrosAtivos: boolean
  onEditar: (funcionario: Funcionario) => void
  onExcluir: (id: number) => void
  onDemitir: (funcionario: Funcionario) => void
  onReativar: (id: number) => void
  onCriar: () => void
}

export function TabelaFuncionarios({
  funcionarios,
  temFiltrosAtivos,
  onEditar,
  onExcluir,
  onDemitir,
  onReativar,
  onCriar,
}: TabelaFuncionariosProps) {
  if (funcionarios.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <EmptyState
          titulo={temFiltrosAtivos ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
          descricao={temFiltrosAtivos ? "Tente ajustar os filtros." : "Comece cadastrando o primeiro funcionário."}
          icone={Users}
          acao={temFiltrosAtivos ? undefined : { label: 'Cadastrar Funcionário', onClick: onCriar }}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="text-left p-4">Funcionário</th>
              <th className="text-left p-4">Empresa</th>
              <th className="text-left p-4">Cargo / Setor</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Tempo Empresa</th>
              <th className="text-right p-4">Salário</th>
              <th className="text-right p-4">Outros</th>
              <th className="text-center p-4 w-[120px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((funcionario) => (
              <LinhaFuncionario
                key={funcionario.id}
                funcionario={funcionario}
                onEditar={onEditar}
                onExcluir={onExcluir}
                onDemitir={onDemitir}
                onReativar={onReativar}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// LINHA DA TABELA (componente interno)
// ============================================

interface LinhaFuncionarioProps {
  funcionario: Funcionario
  onEditar: (funcionario: Funcionario) => void
  onExcluir: (id: number) => void
  onDemitir: (funcionario: Funcionario) => void
  onReativar: (id: number) => void
}

function LinhaFuncionario({
  funcionario,
  onEditar,
  onExcluir,
  onDemitir,
  onReativar,
}: LinhaFuncionarioProps) {
  const idade = calcularIdade(funcionario.nascimento)
  const proximoAniversario = calcularProximoAniversario(funcionario.nascimento)
  const aniversarioEmpresa = calcularAniversarioEmpresa(funcionario.admissao)
  const isInativo = funcionario.status === 'inativo'

  return (
    <tr className={`border-b border-slate-100 hover:bg-slate-50 ${isInativo ? 'opacity-60' : ''}`}>
      {/* Funcionário */}
      <td className="p-4">
        <div>
          <p className="font-medium text-slate-800">{funcionario.nome_completo}</p>
          <div className="flex items-center gap-3 mt-1">
            {funcionario.matricula && (
              <span className="text-xs text-slate-500">Mat: {funcionario.matricula}</span>
            )}
            {idade !== null && (
              <span className="text-xs text-slate-400">{idade} anos</span>
            )}
            {proximoAniversario && proximoAniversario.diasFaltando <= 30 && !isInativo && (
              <span className="flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                <Cake className="w-3 h-3" />
                {proximoAniversario.diasFaltando === 0 ? 'Hoje!' : `${proximoAniversario.diasFaltando}d`}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Empresa */}
      <td className="p-4 text-slate-600 text-sm">
        {funcionario.empresa?.razao_social || '-'}
      </td>

      {/* Cargo / Setor */}
      <td className="p-4">
        <div>
          <p className="text-slate-700 text-sm">{funcionario.cargo?.nome || '-'}</p>
          <p className="text-xs text-slate-400">{funcionario.setor?.nome || '-'}</p>
        </div>
      </td>

      {/* Status */}
      <td className="p-4 text-center">
        <BadgeStatus status={funcionario.status} />
        {isInativo && funcionario.data_desligamento && (
          <p className="text-xs text-slate-400 mt-1">
            {formatarData(funcionario.data_desligamento)}
          </p>
        )}
      </td>

      {/* Tempo Empresa */}
      <td className="p-4 text-center">
        <div>
          <p className="font-medium text-slate-700">{calcularTempoEmpresa(funcionario.admissao)}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <p className="text-xs text-slate-400">{formatarData(funcionario.admissao)}</p>
            {aniversarioEmpresa && aniversarioEmpresa.diasFaltando <= 30 && !isInativo && (
              <span className="flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                <Gift className="w-3 h-3" />
                {aniversarioEmpresa.anosCompletando}a
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Salário */}
      <td className="p-4 text-right tabular-nums font-medium text-slate-800">
        {formatarMoeda(Number(funcionario.salario))}
      </td>

      {/* Outros */}
      <td className="p-4 text-right tabular-nums text-amber-600">
        {Number(funcionario.outros_proventos || 0) > 0 
          ? formatarMoeda(Number(funcionario.outros_proventos)) 
          : '-'
        }
      </td>

      {/* Ações */}
      <td className="p-4">
        <div className="flex items-center justify-center gap-1">
          {/* Editar */}
          <button
            onClick={() => onEditar(funcionario)}
            className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Demitir (só se ativo) */}
          {funcionario.status === 'ativo' && (
            <button
              onClick={() => onDemitir(funcionario)}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Demitir"
            >
              <UserX className="w-4 h-4" />
            </button>
          )}

          {/* Reativar (só se inativo) */}
          {funcionario.status === 'inativo' && funcionario.id && (
            <button
              onClick={() => onReativar(funcionario.id!)}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Reativar"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          {/* Excluir */}
          <button
            onClick={() => funcionario.id && onExcluir(funcionario.id)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}