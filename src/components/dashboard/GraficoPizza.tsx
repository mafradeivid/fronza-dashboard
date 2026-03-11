'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DadoPizza {
  nome: string
  valor: number
}

interface GraficoPizzaProps {
  dados: DadoPizza[]
  titulo: string
}

const CORES = ['#ef4444', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ec4899']

export function GraficoPizza({ dados, titulo }: GraficoPizzaProps) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0)

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  const calcPercent = (valor: number) => {
    if (total === 0) return '0%'
    return ((valor / total) * 100).toFixed(1) + '%'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-2">{titulo}</h3>
      <p className="text-sm text-slate-500 mb-4">Total: {formatarValor(total)}</p>
      
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {dados.map((_, index) => (
                <Cell key={index} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatarValor(Number(value))}
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-3 min-w-[180px]">
          {dados.map((item, index) => (
            <div key={item.nome} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CORES[index % CORES.length] }}
                ></div>
                <span className="text-sm text-slate-600">{item.nome}</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">{calcPercent(item.valor)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}