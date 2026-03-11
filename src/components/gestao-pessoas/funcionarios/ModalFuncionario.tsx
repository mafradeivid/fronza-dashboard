// ============================================
// MODAL DE FUNCIONÁRIO (CRIAR/EDITAR)
// ============================================

import { Save } from 'lucide-react'
import { Funcionario, Empresa, Setor, Cargo } from '@/types/pessoas'
import { Modal } from '@/components/gestao-pessoas'
import { 
  handleMoedaInput,
  calcularTempoEmpresa,
  calcularIdade,
  calcularProximoAniversario,
  calcularAniversarioEmpresa
} from '@/utils/formatters'

interface ModalFuncionarioProps {
  aberto: boolean
  funcionario: Funcionario | null
  salvando: boolean
  empresas: Empresa[]
  setores: Setor[]
  cargos: Cargo[]
  salarioTexto: string
  outrosProventosTexto: string
  onFechar: () => void
  onSalvar: () => void
  onChange: (campo: keyof Funcionario, valor: string | number | null) => void
  onSalarioChange: (valor: string) => void
  onOutrosProventosChange: (valor: string) => void
}

export function ModalFuncionario({
  aberto,
  funcionario,
  salvando,
  empresas,
  setores,
  cargos,
  salarioTexto,
  outrosProventosTexto,
  onFechar,
  onSalvar,
  onChange,
  onSalarioChange,
  onOutrosProventosChange,
}: ModalFuncionarioProps) {
  if (!funcionario) return null

  const isEdicao = !!funcionario.id

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={isEdicao ? 'Editar Funcionário' : 'Novo Funcionário'}
      largura="lg"
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={funcionario.nome_completo || ''}
              onChange={(e) => onChange('nome_completo', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              placeholder="Nome completo do funcionário"
            />
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Empresa <span className="text-red-500">*</span>
            </label>
            <select
              value={funcionario.empresa_id || ''}
              onChange={(e) => onChange('empresa_id', e.target.value ? Number(e.target.value) : 0)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.razao_social}</option>
              ))}
            </select>
          </div>

          {/* Matrícula */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Matrícula
            </label>
            <input
              type="text"
              value={funcionario.matricula || ''}
              onChange={(e) => onChange('matricula', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              placeholder="Número de matrícula"
            />
          </div>

          {/* Nascimento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={funcionario.nascimento || ''}
              onChange={(e) => onChange('nascimento', e.target.value || null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
            />
          </div>

          {/* Admissão */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Admissão <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={funcionario.admissao || ''}
              onChange={(e) => onChange('admissao', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
            />
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cargo
            </label>
            <select
              value={funcionario.cargo_id || ''}
              onChange={(e) => onChange('cargo_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Setor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Setor
            </label>
            <select
              value={funcionario.setor_id || ''}
              onChange={(e) => onChange('setor_id', e.target.value || null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>

          {/* Salário */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Salário (R$)
            </label>
            <input
              type="text"
              value={salarioTexto}
              onChange={(e) => onSalarioChange(handleMoedaInput(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              placeholder="0,00"
            />
          </div>

          {/* Outros Proventos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Outros Proventos (R$)
              <span className="text-xs text-slate-400 ml-1">(sem encargos)</span>
            </label>
            <input
              type="text"
              value={outrosProventosTexto}
              onChange={(e) => onOutrosProventosChange(handleMoedaInput(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Resumo de Informações (apenas na edição) */}
        {isEdicao && funcionario.admissao && (
          <InfoCalculada funcionario={funcionario} />
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={salvando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================
// INFO CALCULADA (componente interno)
// ============================================

function InfoCalculada({ funcionario }: { funcionario: Funcionario }) {
  const aniversarioEmpresa = calcularAniversarioEmpresa(funcionario.admissao)

  return (
    <div className="bg-slate-50 rounded-xl p-4 mt-4">
      <h4 className="text-sm font-medium text-slate-700 mb-3">Informações Calculadas</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-slate-500">Idade</p>
          <p className="font-medium text-slate-800">
            {funcionario.nascimento 
              ? `${calcularIdade(funcionario.nascimento)} anos`
              : '-'
            }
          </p>
        </div>
        <div>
          <p className="text-slate-500">Tempo de Empresa</p>
          <p className="font-medium text-slate-800">
            {calcularTempoEmpresa(funcionario.admissao)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Próx. Aniversário</p>
          <p className="font-medium text-slate-800">
            {funcionario.nascimento 
              ? calcularProximoAniversario(funcionario.nascimento)?.data
              : '-'
            }
          </p>
        </div>
        <div>
          <p className="text-slate-500">Aniv. Empresa</p>
          <p className="font-medium text-slate-800">
            {aniversarioEmpresa?.data}
            <span className="text-violet-600 ml-1">
              ({aniversarioEmpresa?.anosCompletando}º ano)
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}