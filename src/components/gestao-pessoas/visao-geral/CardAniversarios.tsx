import { LucideIcon } from 'lucide-react'
import { MESES, getDiaMes, calcularIdade } from '@/utils/aniversarios'
import { FiltroAniversario, AniversarianteNascimento, AniversarianteEmpresa } from '@/hooks/useVisaoGeralRH'

interface CardAniversariosProps {
  titulo: string
  icone: LucideIcon
  iconeDireita: LucideIcon
  corPrimaria: 'pink' | 'amber'
  tipo: 'nascimento' | 'empresa'
  lista: AniversarianteNascimento[] | AniversarianteEmpresa[]
  filtro: FiltroAniversario
  setFiltro: (f: FiltroAniversario) => void
  mesSelecionado: number
  setMesSelecionado: (m: number) => void
}

export function CardAniversarios({
  titulo,
  icone: Icone,
  iconeDireita: IconeDireita,
  corPrimaria,
  tipo,
  lista,
  filtro,
  setFiltro,
  mesSelecionado,
  setMesSelecionado,
}: CardAniversariosProps) {
  const cores = {
    pink: {
      gradiente: 'from-pink-500 to-pink-600',
      bgAtivo: 'bg-pink-500',
      bgDestaque: 'bg-pink-50',
      bgHoje: 'bg-pink-500',
      textIcon: 'text-pink-200',
      focusRing: 'focus:ring-pink-500',
    },
    amber: {
      gradiente: 'from-amber-500 to-amber-600',
      bgAtivo: 'bg-amber-500',
      bgDestaque: 'bg-amber-50',
      bgHoje: 'bg-amber-500',
      textIcon: 'text-amber-200',
      focusRing: 'focus:ring-amber-500',
    },
  }

  const cor = cores[corPrimaria]
  const IconeVazio = Icone

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${cor.gradiente} text-white p-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Icone className="w-5 h-5" />
            {titulo}
          </h2>
          <IconeDireita className={`w-6 h-6 ${cor.textIcon}`} />
        </div>
      </div>
      
      {/* Filtros */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltro('proximos30')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === 'proximos30'
                ? `${cor.bgAtivo} text-white`
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Próximos 30 dias
          </button>
          <button
            onClick={() => setFiltro('mes')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === 'mes'
                ? `${cor.bgAtivo} text-white`
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Por Mês
          </button>
          
          {filtro === 'mes' && (
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(Number(e.target.value))}
              className={`ml-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm ${cor.focusRing} outline-none`}
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="max-h-80 overflow-y-auto">
        {lista.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <IconeVazio className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>Nenhum aniversariante encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lista.map((item) => {
              const dataRef = tipo === 'nascimento' ? item.nascimento! : item.admissao!
              const { dia, mes } = getDiaMes(dataRef)
              const isHoje = item.diasAte === 0
              
              // Info específica por tipo
              let infoExtra: string
              if (tipo === 'nascimento') {
                const idade = calcularIdade(dataRef)
                infoExtra = `${idade + 1} anos`
              } else {
                const aniv = item as AniversarianteEmpresa
                infoExtra = `${aniv.anosEmpresa} ano${aniv.anosEmpresa > 1 ? 's' : ''}`
              }
              
              return (
                <div 
                  key={item.id}
                  className={`p-4 flex items-center gap-3 ${isHoje ? cor.bgDestaque : 'hover:bg-slate-50'}`}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex flex-col items-center justify-center
                    ${isHoje ? `${cor.bgHoje} text-white` : 'bg-slate-100 text-slate-600'}
                  `}>
                    <span className="text-xs font-medium">{MESES[mes - 1]?.abrev}</span>
                    <span className="text-lg font-bold leading-none">{dia}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.nome_completo}</p>
                    <p className="text-xs text-slate-500">{item.empresa?.razao_social}</p>
                  </div>
                  <div className="text-right">
                    {isHoje ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 ${cor.bgHoje} text-white text-xs font-bold rounded-full`}>
                        {tipo === 'nascimento' ? '🎂' : '🎉'} Hoje!
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        em {item.diasAte} dia{item.diasAte > 1 ? 's' : ''}
                      </span>
                    )}
                    <p className="text-sm font-medium text-slate-600 mt-0.5">
                      {infoExtra}
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