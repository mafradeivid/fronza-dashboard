import { DreItem } from '@/types/dre'
import { ItemDetalhado } from './detalhamentoService'

// Remove prefixos [+], [-], [=], (-) e normaliza
function normalizarNome(nome: string): string {
  return nome.replace(/^\[\+\]\s*|^\[\-\]\s*|^\[\=\]\s*|^\(\-\)\s*/g, '').trim().toUpperCase()
}

// Verifica se o nome corresponde (flexível para variações)
function corresponde(nome: string, chave: string): boolean {
  const nomeNorm = nome.replace(/[ÃÁÀ]/g, 'A').replace(/[ÕÓÒ]/g, 'O').replace(/[ÉÈ]/g, 'E').replace(/[ÍÌ]/g, 'I').replace(/[ÚÙ]/g, 'U')
  const chaveNorm = chave.replace(/[ÃÁÀ]/g, 'A').replace(/[ÕÓÒ]/g, 'O').replace(/[ÉÈ]/g, 'E').replace(/[ÍÌ]/g, 'I').replace(/[ÚÙ]/g, 'U')
  return nomeNorm === chaveNorm
}

// Estrutura dos resultados
const RESULTADOS = [
  { chave: 'RECEBIMENTOS - PAGAMENTOS', nome: 'RESULTADO OPERACIONAL' },
  { chave: 'RESULTADO COM INVESTIMENTOS', nome: 'RESULTADO COM INVESTIMENTOS' },
  { chave: 'RESULTADO COM RECEITA NAO OPERACIONAL', nome: 'RESULTADO COM RECEITA NÃO OPERACIONAL' },
]

export function extrairResultados(dadosPorMes: { label: string; dados: DreItem[] }[]): {
  itens: ItemDetalhado[]
  meses: string[]
  totalGeral: number
  receitaTotal: number
  receitaPorMes: { [mes: string]: number }
} {
  const meses = dadosPorMes.map(m => m.label)
  const itensMap = new Map<string, ItemDetalhado>()
  let receitaTotal = 0
  const receitaPorMes: { [mes: string]: number } = {}

  // Criar estrutura fixa dos 3 resultados
  RESULTADOS.forEach((res, idx) => {
    itensMap.set(res.chave, {
      id: idx,
      descricao: res.nome,
      hierarquia: 1,
      valores: {},
      acumulado: 0,
      percentual: 0,
      ordem: idx,
      chave: res.chave,
    })
  })

  // Processar valores de cada mês
  dadosPorMes.forEach(({ label, dados }) => {
    dados.forEach(item => {
      const nome = normalizarNome(item.descrever)
      
      // Buscar TOTAL DE RECEBIMENTOS para calcular %
      if (corresponde(nome, 'TOTAL DE RECEBIMENTOS')) {
        receitaTotal += item.val_num
        receitaPorMes[label] = item.val_num
      }
      
      // Buscar os resultados
      RESULTADOS.forEach(res => {
        if (corresponde(nome, res.chave)) {
          const itemResultado = itensMap.get(res.chave)!
          itemResultado.valores[label] = item.val_num
          itemResultado.acumulado += item.val_num
        }
      })
    })
  })

  const itens = RESULTADOS.map(res => itensMap.get(res.chave)!).filter(Boolean)
  
  // Total = resultado final
  const totalGeral = itens.find(i => i.descricao === 'RESULTADO COM RECEITA NÃO OPERACIONAL')?.acumulado || 0

  // Percentual em relação à receita total
  itens.forEach(item => {
    item.percentual = receitaTotal !== 0 ? (item.acumulado / receitaTotal) * 100 : 0
  })

  return { itens, meses, totalGeral, receitaTotal, receitaPorMes }
}