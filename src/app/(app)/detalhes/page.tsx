'use client'

import { useEffect, useState } from 'react'
import { buscarDrePorMes, MESES_DISPONIVEIS } from '@/services/dreService'
import { DreItem } from '@/types/dre'
import { TabelaDre } from '@/components/dashboard/TabelaDre'
import Link from 'next/link'

export default function Detalhes() {
  const [dados, setDados] = useState<DreItem[]>([])
  const [mesSelecionado, setMesSelecionado] = useState(MESES_DISPONIVEIS[0].tabela)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const resultado = await buscarDrePorMes(mesSelecionado)
      setDados(resultado)
      setCarregando(false)
    }
    carregar()
  }, [mesSelecionado])

  const mesLabel = MESES_DISPONIVEIS.find(m => m.tabela === mesSelecionado)?.label || ''

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link 
              href="/"
              className="text-slate-500 hover:text-slate-800 text-sm mb-2 inline-block"
            >
              ← Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">DRE Detalhado - {mesLabel}</h1>
          </div>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            {MESES_DISPONIVEIS.map((mes) => (
              <option key={mes.tabela} value={mes.tabela}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        {carregando ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
          </div>
        ) : (
          <TabelaDre dados={dados} />
        )}
      </div>
    </main>
  )
}