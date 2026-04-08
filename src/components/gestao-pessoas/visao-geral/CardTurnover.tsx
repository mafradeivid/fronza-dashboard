// ============================================
// CARD DE TURNOVER - REDESENHADO
// ============================================


import { TrendingDown, TrendingUp,  Users, ArrowRight, BarChart3 } from 'lucide-react'
import { Empresa } from '@/types/pessoas'

interface DadosTurnover {
  admissoes: number
  demissoes: number
  mediaFuncionarios: number
  taxaTurnover: number
}

interface CardTurnoverProps {
  dados: DadosTurnover
  empresas: Empresa[]
  empresaSelecionada: number | null
  setEmpresaSelecionada: (id: number | null) => void
  mesSelecionado: number | null
  setMesSelecionado: (mes: number | null) => void
  anoSelecionado: number
  setAnoSelecionado: (ano: number) => void
}

const MESES = [
  { value: 1, label: 'Jan', full: 'Janeiro' },
  { value: 2, label: 'Fev', full: 'Fevereiro' },
  { value: 3, label: 'Mar', full: 'Março' },
  { value: 4, label: 'Abr', full: 'Abril' },
  { value: 5, label: 'Mai', full: 'Maio' },
  { value: 6, label: 'Jun', full: 'Junho' },
  { value: 7, label: 'Jul', full: 'Julho' },
  { value: 8, label: 'Ago', full: 'Agosto' },
  { value: 9, label: 'Set', full: 'Setembro' },
  { value: 10, label: 'Out', full: 'Outubro' },
  { value: 11, label: 'Nov', full: 'Novembro' },
  { value: 12, label: 'Dez', full: 'Dezembro' },
]

export function CardTurnover({
  dados,
  empresas,
  empresaSelecionada,
  setEmpresaSelecionada,
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
}: CardTurnoverProps) {
  const anoAtual = new Date().getFullYear()
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1]
  
  // Classificar a taxa
  const getClassificacao = (taxa: number) => {
    if (taxa <= 2) return { label: 'Excelente', cor: 'emerald',  }
    if (taxa <= 5) return { label: 'Bom', cor: 'green' }
    if (taxa <= 10) return { label: 'Atenção', cor: 'amber' }
    return { label: 'Crítico', cor: 'red' }
  }
  
  const classificacao = getClassificacao(dados.taxaTurnover)
  
  // Período selecionado (texto)
  const periodoTexto = mesSelecionado 
    ? `${MESES[mesSelecionado - 1]?.full} ${anoSelecionado}`
    : `Ano ${anoSelecionado}`

 

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header compacto */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-bold">Turnover</h2>
          </div>
          
          {/* Seletor de Ano */}
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            className="bg-white/10 border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-white/30 outline-none cursor-pointer"
          >
            {anos.map((a) => (
              <option key={a} value={a} className="text-slate-900">{a}</option>
            ))}
          </select>
        </div>
        
        {/* Seletor de Empresa */}
        <select
          value={empresaSelecionada || ''}
          onChange={(e) => setEmpresaSelecionada(e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-white/10 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-white/30 outline-none cursor-pointer"
        >
          <option value="" className="text-slate-900">Todas as empresas</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id} className="text-slate-900">{e.razao_social}</option>
          ))}
        </select>
      </div>
      
      {/* Seletor de Período: Ano / Meses */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-1 flex-wrap">
          {/* Botão Ano Inteiro */}
          <button
            onClick={() => setMesSelecionado(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mesSelecionado === null
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Ano
          </button>
          
          {/* Botões de Meses */}
          {MESES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMesSelecionado(m.value)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mesSelecionado === m.value
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="p-4">
        {/* Taxa Principal */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            
            <span className={`
              text-xs font-bold px-2 py-1 rounded-full
              ${classificacao.cor === 'emerald' ? 'bg-emerald-100 text-emerald-700' : ''}
              ${classificacao.cor === 'green' ? 'bg-green-100 text-green-700' : ''}
              ${classificacao.cor === 'amber' ? 'bg-amber-100 text-amber-700' : ''}
              ${classificacao.cor === 'red' ? 'bg-red-100 text-red-700' : ''}
            `}>
              {classificacao.label}
            </span>
          </div>
          <p className={`
            text-5xl font-black tracking-tight
            ${classificacao.cor === 'emerald' ? 'text-emerald-600' : ''}
            ${classificacao.cor === 'green' ? 'text-green-600' : ''}
            ${classificacao.cor === 'amber' ? 'text-amber-600' : ''}
            ${classificacao.cor === 'red' ? 'text-red-600' : ''}
          `}>
            {dados.taxaTurnover.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%          </p>
          <p className="text-xs text-slate-400 mt-1">{periodoTexto}</p>
        </div>
        
        {/* Métricas em Linha */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* Admissões */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-lg font-bold text-green-700">{dados.admissoes}</span>
            <span className="text-xs text-green-600">entrada{dados.admissoes !== 1 ? 's' : ''}</span>
          </div>
          
          <ArrowRight className="w-4 h-4 text-slate-300" />
          
          {/* Demissões */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 rounded-xl">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-lg font-bold text-red-700">{dados.demissoes}</span>
            <span className="text-xs text-red-600">saída{dados.demissoes !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {/* Base de Cálculo */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>Média: <strong className="text-slate-700">{dados.mediaFuncionarios}</strong> funcionários</span>
        </div>
        
        {/* Fórmula - Colapsada */}
        <details className="mt-4">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 text-center">
            Ver fórmula do cálculo
          </summary>
          <div className="mt-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 text-center font-mono">
            Turnover = (Demissões ÷ Média Funcionários) × 100
            <br />
            <span className="text-slate-400">
              = ({dados.demissoes} ÷ {dados.mediaFuncionarios}) × 100 = {dados.taxaTurnover.toFixed(2)}%
            </span>
          </div>
        </details>
      </div>
    </div>
  )
}