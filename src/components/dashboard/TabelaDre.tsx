import { DreItem } from '@/types/dre'

interface TabelaDreProps {
  dados: DreItem[]
}

export function TabelaDre({ dados }: TabelaDreProps) {
  const getEstiloHierarquia = (hierarquia: number) => {
    switch (hierarquia) {
      case 1:
        return 'bg-slate-800 text-white font-bold'
      case 2:
        return 'bg-slate-200 font-semibold'
      default:
        return 'bg-white pl-8'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="text-left p-3">Descrição</th>
            <th className="text-right p-3">Valor</th>
            <th className="text-right p-3">% Receita</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.au_id} className={`${getEstiloHierarquia(item.hierarquia)} border-b`}>
              <td className="p-3">{item.descrever}</td>
              <td className="p-3 text-right">
                {item.val_num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="p-3 text-right">{item.recel_percent_numeric.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}