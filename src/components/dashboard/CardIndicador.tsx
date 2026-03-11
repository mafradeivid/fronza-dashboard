import { TrendingUp, TrendingDown, DollarSign, Percent, CreditCard } from 'lucide-react'

interface CardIndicadorProps {
  titulo: string
  valor: number
  percentual?: number
  tipo?: 'receita' | 'despesa' | 'resultado' | 'margem'
}

export function CardIndicador({ titulo, valor, percentual, tipo = 'resultado' }: CardIndicadorProps) {
  const formatarValor = (v: number) => {
    if (tipo === 'margem') {
      return `${v.toFixed(2)}%`
    }
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getIcone = () => {
    switch (tipo) {
      case 'receita':
        return <TrendingUp className="w-6 h-6" />
      case 'despesa':
        return <CreditCard className="w-6 h-6" />
      case 'margem':
        return <Percent className="w-6 h-6" />
      default:
        return <DollarSign className="w-6 h-6" />
    }
  }

  const getCores = () => {
    switch (tipo) {
      case 'receita':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
          icon: 'bg-emerald-500 text-white',
          texto: 'text-emerald-700'
        }
      case 'despesa':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          icon: 'bg-red-500 text-white',
          texto: 'text-red-700'
        }
      case 'margem':
        return {
          bg: 'bg-gradient-to-br from-violet-50 to-violet-100',
          icon: 'bg-violet-500 text-white',
          texto: 'text-violet-700'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          icon: 'bg-blue-500 text-white',
          texto: 'text-blue-700'
        }
    }
  }

  const cores = getCores()
  const isPositivo = valor >= 0

  return (
    <div className={`${cores.bg} rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`${cores.icon} p-2.5 rounded-xl shadow-sm`}>
          {getIcone()}
        </div>
        {percentual !== undefined && tipo !== 'margem' && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositivo ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositivo ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(percentual).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm text-slate-500 font-medium mb-1">{titulo}</p>
      <p className={`text-2xl font-bold ${cores.texto}`}>{formatarValor(valor)}</p>
    </div>
  )
}