import { DreItem } from '@/types/dre'
import { ItemDetalhado } from './detalhamentoService'

// Remove prefixos [+], [-], [=], (-) e normaliza
function normalizarNome(nome: string): string {
  return nome.replace(/^\[\+\]\s*|^\[\-\]\s*|^\[\=\]\s*|^\(\-\)\s*/g, '').trim().toUpperCase()
}

// Mapeamento de nomes equivalentes
const MAPEAMENTO_NOMES: { [key: string]: string } = {
  'DEBITO DO APORTE': 'APORTE/DEBITO',
  'IMPOSTOS RECUPERADOS': 'IMPOSTOS RECUPERADOS',
}

function normalizarComMapeamento(nome: string): string {
  const normalizado = normalizarNome(nome)
  return MAPEAMENTO_NOMES[normalizado] || normalizado
}

export function extrairInvestimentos(dadosPorMes: { label: string; dados: DreItem[] }[]): {
  itens: ItemDetalhado[]
  meses: string[]
  totalGeral: number
} {
  const meses = dadosPorMes.map(m => m.label)
  const itensMap = new Map<string, ItemDetalhado>()
  const subContasSet = new Set<string>()
  
  // FASE 1: Coletar TODAS as sub-contas de TODOS os meses
  dadosPorMes.forEach(({ dados }) => {
    const idxInicio = dados.findIndex(d => normalizarNome(d.descrever) === 'INVESTIMENTOS' && d.hierarquia === 1)
    const idxFim = dados.findIndex(d => normalizarNome(d.descrever) === 'RESULTADO COM INVESTIMENTOS')
    
    if (idxInicio < 0) return
    
    const fim = idxFim > idxInicio ? idxFim : dados.length
    const investimentos = dados.slice(idxInicio + 1, fim) // Pula o H1 INVESTIMENTOS
    
    investimentos.forEach((item) => {
      const nome = normalizarComMapeamento(item.descrever)
      
      // Pular se for "INVESTIMENTOS" como H2 (é só um agrupador)
      if (nome === 'INVESTIMENTOS') return
      
      // Adicionar sub-conta (tanto H2 quanto H3 viram sub-contas)
      if (!subContasSet.has(nome)) {
        subContasSet.add(nome)
      }
    })
  })
  
  // FASE 2: Criar estrutura - INVESTIMENTOS como H1 e sub-contas como H2
  let ordemGlobal = 0
  
  // Criar H1 INVESTIMENTOS
  const chaveH1 = 'H1:INVESTIMENTOS'
  itensMap.set(chaveH1, {
    id: 0,
    descricao: 'INVESTIMENTOS',
    hierarquia: 1,
    valores: {},
    acumulado: 0,
    percentual: 0,
    ordem: ordemGlobal++,
    chave: chaveH1,
  })
  
  // Criar sub-contas como H2
  const subContasOrdenadas = Array.from(subContasSet).sort()
  subContasOrdenadas.forEach(nome => {
    const chave = `H2:INVESTIMENTOS>${nome}`
    itensMap.set(chave, {
      id: 0,
      descricao: nome,
      hierarquia: 2,
      valores: {},
      acumulado: 0,
      percentual: 0,
      ordem: ordemGlobal++,
      chave: chave,
    })
  })

  // FASE 3: Processar valores de cada mês
  dadosPorMes.forEach(({ label, dados }) => {
    const idxInicio = dados.findIndex(d => normalizarNome(d.descrever) === 'INVESTIMENTOS' && d.hierarquia === 1)
    const idxFim = dados.findIndex(d => normalizarNome(d.descrever) === 'RESULTADO COM INVESTIMENTOS')
    
    if (idxInicio < 0) return
    
    const fim = idxFim > idxInicio ? idxFim : dados.length
    
    // Pegar valor do H1 INVESTIMENTOS
    const itemH1 = dados[idxInicio]
    const valorH1 = itemH1.val_num
    
    // Atualizar H1
    const itemInvestimentos = itensMap.get(chaveH1)!
    itemInvestimentos.valores[label] = valorH1
    itemInvestimentos.acumulado += valorH1
    
    // Processar sub-contas
    const investimentos = dados.slice(idxInicio + 1, fim)
    
    investimentos.forEach(item => {
      const nome = normalizarComMapeamento(item.descrever)
      
      // Pular "INVESTIMENTOS" como H2
      if (nome === 'INVESTIMENTOS') return
      
      const chave = `H2:INVESTIMENTOS>${nome}`
      
      if (itensMap.has(chave)) {
        const itemDetalhado = itensMap.get(chave)!
        itemDetalhado.valores[label] = item.val_num
        itemDetalhado.acumulado += item.val_num
      }
    })
  })

  // FASE 4: Montar lista final
  const chavesOrdenadas = [chaveH1, ...subContasOrdenadas.map(n => `H2:INVESTIMENTOS>${n}`)]
  
  const itens = chavesOrdenadas
    .map((chave, idx) => {
      const item = itensMap.get(chave)
      if (item) {
        item.ordem = idx
        return item
      }
      return null
    })
    .filter((item): item is ItemDetalhado => item !== null)
  
  const totalGeral = itens
    .filter(i => i.hierarquia === 1)
    .reduce((acc, i) => acc + i.acumulado, 0)

  itens.forEach(item => {
    item.percentual = totalGeral > 0 ? (Math.abs(item.acumulado) / Math.abs(totalGeral)) * 100 : 0
  })

  return { itens, meses, totalGeral }
}