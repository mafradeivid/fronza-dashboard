'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DadoGrafico {
  nome: string
  valor: number
}

interface GraficoBarrasProps {
  dados: DadoGrafico[]
  titulo: string
  cor?: string
}

export function GraficoBarras({ dados, titulo, cor = '#3b82f6' }: GraficoBarrasProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados} layout="vertical">
          <XAxis type="number" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="nome" width={150} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
          <Bar dataKey="valor" fill={cor} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}