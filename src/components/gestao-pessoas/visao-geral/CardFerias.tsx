// ============================================
// CARD DE FÉRIAS - VISÃO GERAL RH
// ============================================

'use client'

import { useState } from 'react'
import { Palmtree, Calendar, ArrowRight, CheckCircle } from 'lucide-react'
import { formatarData } from '@/utils/formatters'

type TipoFerias = 'em_gozo' | 'programada' | 'retornando'
type FiltroFerias = 'todos' | 'em_gozo' | 'programadas' | 'retornando'

interface FuncionarioFerias {
  id: number
  nome_completo: string
  empresa_nome: string
  data_inicio: string
  data_fim: string
  dias_gozados: number
  tipo: TipoFerias
  diasRestantes: number // dias para voltar (em_gozo) ou dias para iniciar (programada)
}

interface CardFeriasProps {
  lista: FuncionarioFerias[]
}

export function CardFerias({ lista }: CardFeriasProps) {
  const [filtro, setFiltro] = useState<FiltroFerias>('todos')

  // Contadores
  const emGozo = lista.filter(f => f.tipo === 'em_gozo').length
  const programadas = lista.filter(f => f.tipo === 'programada').length
  const retornando = lista.filter(f => f.tipo === 'retornando').length

  // Filtrar lista
  const listaFiltrada = filtro === 'todos' 
    ? lista 
    : lista.filter(f => {
        if (filtro === 'em_gozo') return f.tipo === 'em_gozo'
        if (filtro === 'programadas') return f.tipo === 'programada'
        if (filtro === 'retornando') return f.tipo === 'retornando'
        return true
      })

  // Ordenar: em gozo primeiro, depois por diasRestantes
  const listaOrdenada = [...listaFiltrada].sort((a, b) => {
    const ordemTipo = { em_gozo: 0, retornando: 1, programada: 2 }
    if (ordemTipo[a.tipo] !== ordemTipo[b.tipo]) {
      return ordemTipo[a.tipo] - ordemTipo[b.tipo]
    }
    return a.diasRestantes - b.diasRestantes
  })

  const totalAtivos = emGozo + programadas

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palmtree className="w-5 h-5" />
            Férias
          </h2>
          <div className="flex items-center gap-2">
            {emGozo > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                {emGozo} em gozo
              </span>
            )}
            {programadas > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                {programadas} programadas
              </span>
            )}
          </div>
        </div>

        {/* Filtros sutis */}
        {lista.length > 0 && (
          <div className="flex gap-1 mt-3">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filtro === 'todos' 
                  ? 'bg-white text-teal-600' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Todos ({lista.length})
            </button>
            {emGozo > 0 && (
              <button
                onClick={() => setFiltro('em_gozo')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtro === 'em_gozo' 
                    ? 'bg-white text-teal-600' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Em gozo ({emGozo})
              </button>
            )}
            {programadas > 0 && (
              <button
                onClick={() => setFiltro('programadas')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtro === 'programadas' 
                    ? 'bg-white text-teal-600' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Programadas ({programadas})
              </button>
            )}
            {retornando > 0 && (
              <button
                onClick={() => setFiltro('retornando')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtro === 'retornando' 
                    ? 'bg-white text-teal-600' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Retornando ({retornando})
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Lista */}
      <div className="max-h-80 overflow-y-auto">
        {listaOrdenada.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p>Nenhuma férias no momento</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {listaOrdenada.map((item) => {
              const isEmGozo = item.tipo === 'em_gozo'
              const isRetornando = item.tipo === 'retornando'
              const isProgramada = item.tipo === 'programada'
              const isHoje = item.diasRestantes === 0
              const isAmanha = item.diasRestantes === 1
              
              return (
                <div 
                  key={item.id}
                  className={`p-4 flex items-center gap-3 ${
                    isEmGozo ? 'bg-teal-50' : isRetornando ? 'bg-amber-50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Ícone/Avatar */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${isEmGozo ? 'bg-teal-500 text-white' : 
                      isRetornando ? 'bg-amber-500 text-white' : 
                      'bg-slate-100 text-slate-600'}
                  `}>
                    {isEmGozo ? (
                      <Palmtree className="w-5 h-5" />
                    ) : isRetornando ? (
                      <ArrowRight className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {item.nome_completo}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.empresa_nome}
                    </p>
                  </div>
                  
                  {/* Status + Datas */}
                  <div className="text-right flex-shrink-0">
                    {/* Badge de tipo */}
                    <span className={`
                      inline-block px-2 py-0.5 rounded-full text-xs font-medium
                      ${isEmGozo ? 'bg-teal-100 text-teal-700' : 
                        isRetornando ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'}
                    `}>
                      {isEmGozo ? 'Em gozo' : isRetornando ? 'Retornando' : 'Programada'}
                    </span>

                    {/* Dias restantes */}
                    <p className={`text-sm font-medium mt-1 ${
                      isHoje ? 'text-red-600' : 
                      isAmanha ? 'text-amber-600' : 
                      'text-slate-600'
                    }`}>
                      {isEmGozo && (
                        <>
                          {isHoje && <span className="font-bold">Volta hoje!</span>}
                          {isAmanha && <span className="font-bold">Volta amanhã</span>}
                          {item.diasRestantes > 1 && <>Volta em {item.diasRestantes}d</>}
                        </>
                      )}
                      {isProgramada && (
                        <>
                          {isHoje && <span className="font-bold">Inicia hoje!</span>}
                          {isAmanha && <span className="font-bold">Inicia amanhã</span>}
                          {item.diasRestantes > 1 && <>Inicia em {item.diasRestantes}d</>}
                        </>
                      )}
                      {isRetornando && (
                        <>
                          {isHoje && <span className="font-bold">Retorna hoje!</span>}
                          {isAmanha && <span className="font-bold">Retorna amanhã</span>}
                          {item.diasRestantes > 1 && <>Retorna em {item.diasRestantes}d</>}
                        </>
                      )}
                    </p>

                    {/* Período */}
                    <p className="text-xs text-slate-400">
                      {formatarData(item.data_inicio)} → {formatarData(item.data_fim)}
                      <span className="text-slate-300"> • </span>
                      {item.dias_gozados}d
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