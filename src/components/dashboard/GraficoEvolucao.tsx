'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { ResumoMensal } from '@/services/dreService'

interface GraficoEvolucaoProps {
  dados: ResumoMensal[]
  titulo: string
}

export function GraficoEvolucao({ dados, titulo }: GraficoEvolucaoProps) {
  // Inverter para ordem cronológica (mais antigo primeiro)
  const dadosOrdenados = [...dados].reverse()

  const dadosGrafico = dadosOrdenados.map(d => ({
    mes: d.label,
    Impostos: d.impostos,
    'Desp. Operacionais': d.despesasOperacionais,
    'Gestão Pessoas': d.gestaoPessoas,
    CMV: d.cmv,
  }))

  const formatarValor = (valor: number) => {
    if (valor >= 1000000) {
      return (valor / 1000000).toFixed(1) + 'M'
    }
    if (valor >= 1000) {
      return (valor / 1000).toFixed(0) + 'mil'
    }
    return valor.toFixed(0)
  }

  const formatarTooltip = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="mes" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatarValor}
            width={60}
          />
          <Tooltip 
            formatter={(value) => formatarTooltip(Number(value))}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={10}
          />
          <Bar dataKey="Impostos" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Desp. Operacionais" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Gestão Pessoas" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="CMV" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}