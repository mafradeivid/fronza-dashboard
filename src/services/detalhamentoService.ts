import { DreItem } from '@/types/dre'

export interface ItemDetalhado {
  id: number
  descricao: string
  hierarquia: number
  valores: { [mes: string]: number }
  acumulado: number
  percentual: number
  ordem: number
  chave: string
}

// Remove prefixos [+], [-], [=] para comparação
function normalizarNome(nome: string): string {
  return nome.replace(/^\[\+\]\s*|^\[\-\]\s*|^\[\=\]\s*/g, '').trim().toUpperCase()
}

// Cria chave única baseada no nome e contexto hierárquico
function criarChaveUnica(item: DreItem, paiH1: string, paiH2: string): string {
  const nome = normalizarNome(item.descrever)
  if (item.hierarquia === 1) {
    return `H1:${nome}`
  } else if (item.hierarquia === 2) {
    return `H2:${paiH1}>${nome}`
  } else {
    return `H3:${paiH1}>${paiH2}>${nome}`
  }
}

export function extrairReceitas(dadosPorMes: { label: string; dados: DreItem[] }[]): {
  itens: ItemDetalhado[]
  meses: string[]
  totalGeral: number
} {
  const meses = dadosPorMes.map(m => m.label)
  const itensMap = new Map<string, ItemDetalhado>()
  const ordemItens: string[] = []

  if (dadosPorMes.length > 0) {
    const dadosRef = dadosPorMes[0].dados
    
    // Parte 1: Do início até TOTAL DE RECEBIMENTOS
    const idxFim1 = dadosRef.findIndex(d => normalizarNome(d.descrever) === 'TOTAL DE RECEBIMENTOS')
    const receitasRef1 = idxFim1 > 0 ? dadosRef.slice(0, idxFim1) : dadosRef.slice(0, 45)

    // Parte 2: DESCONTOS RECEBIDOS e suas sub-contas
    const idxInicioDescontos = dadosRef.findIndex(d => normalizarNome(d.descrever) === 'DESCONTOS RECEBIDOS')
    let receitasRef2: DreItem[] = []
    if (idxInicioDescontos >= 0) {
      let idxFimDescontos = idxInicioDescontos + 1
      while (idxFimDescontos < dadosRef.length && dadosRef[idxFimDescontos].hierarquia > 1) {
        idxFimDescontos++
      }
      receitasRef2 = dadosRef.slice(idxInicioDescontos, idxFimDescontos)
    }

    const receitasRef = [...receitasRef1, ...receitasRef2]

    let paiH1 = ''
    let paiH2 = ''
    let ordemGlobal = 0

    receitasRef.forEach((item) => {
      const nome = normalizarNome(item.descrever)
      
      if (item.hierarquia === 1) {
        paiH1 = nome
        paiH2 = ''
      } else if (item.hierarquia === 2) {
        paiH2 = nome
      }

      const chave = criarChaveUnica(item, paiH1, paiH2)
      
      if (!itensMap.has(chave)) {
        ordemItens.push(chave)
        itensMap.set(chave, {
          id: item.au_id,
          descricao: nome,
          hierarquia: item.hierarquia,
          valores: {},
          acumulado: 0,
          percentual: 0,
          ordem: ordemGlobal++,
          chave: chave,
        })
      }
    })
  }

  // Processar cada mês
  dadosPorMes.forEach(({ label, dados }) => {
    const idxFim1 = dados.findIndex(d => normalizarNome(d.descrever) === 'TOTAL DE RECEBIMENTOS')
    const receitas1 = idxFim1 > 0 ? dados.slice(0, idxFim1) : dados.slice(0, 45)

    const idxInicioDescontos = dados.findIndex(d => normalizarNome(d.descrever) === 'DESCONTOS RECEBIDOS')
    let receitas2: DreItem[] = []
    if (idxInicioDescontos >= 0) {
      let idxFimDescontos = idxInicioDescontos + 1
      while (idxFimDescontos < dados.length && dados[idxFimDescontos].hierarquia > 1) {
        idxFimDescontos++
      }
      receitas2 = dados.slice(idxInicioDescontos, idxFimDescontos)
    }

    const receitas = [...receitas1, ...receitas2]

    let paiH1 = ''
    let paiH2 = ''

    receitas.forEach(item => {
      const nome = normalizarNome(item.descrever)
      
      if (item.hierarquia === 1) {
        paiH1 = nome
        paiH2 = ''
      } else if (item.hierarquia === 2) {
        paiH2 = nome
      }

      const chave = criarChaveUnica(item, paiH1, paiH2)
      
      if (itensMap.has(chave)) {
        const itemDetalhado = itensMap.get(chave)!
        itemDetalhado.valores[label] = item.val_num
        itemDetalhado.acumulado += item.val_num
      }
    })
  })

  const itens = ordemItens.map(chave => itensMap.get(chave)!).filter(Boolean)
  
  const totalGeral = itens
    .filter(i => i.hierarquia === 1)
    .reduce((acc, i) => acc + i.acumulado, 0)

  itens.forEach(item => {
    item.percentual = totalGeral > 0 ? (item.acumulado / totalGeral) * 100 : 0
  })

  return { itens, meses, totalGeral }
}

export function extrairInvestimentos(dadosPorMes: { label: string; dados: DreItem[] }[]): {
  itens: ItemDetalhado[]
  meses: string[]
  totalGeral: number
} {
  const meses = dadosPorMes.map(m => m.label)
  const itensMap = new Map<string, ItemDetalhado>()
  const ordemItens: string[] = []

  if (dadosPorMes.length > 0) {
    const dadosRef = dadosPorMes[0].dados
    
    const idxInicio = dadosRef.findIndex(d => normalizarNome(d.descrever) === 'INVESTIMENTOS' && d.hierarquia === 1)
    const idxFim = dadosRef.findIndex(d => normalizarNome(d.descrever) === 'RESULTADO COM INVESTIMENTOS')
    
    if (idxInicio >= 0) {
      const fim = idxFim > idxInicio ? idxFim : dadosRef.length
      const investimentosRef = dadosRef.slice(idxInicio, fim)

      let paiH1 = ''
      let paiH2 = ''

      investimentosRef.forEach((item, idx) => {
        const nome = normalizarNome(item.descrever)
        
        if (item.hierarquia === 1) {
          paiH1 = nome
          paiH2 = ''
        } else if (item.hierarquia === 2) {
          paiH2 = nome
        }

        const chave = criarChaveUnica(item, paiH1, paiH2)
        
        if (!itensMap.has(chave)) {
          ordemItens.push(chave)
          itensMap.set(chave, {
            id: item.au_id,
            descricao: nome,
            hierarquia: item.hierarquia,
            valores: {},
            acumulado: 0,
            percentual: 0,
            ordem: idx,
            chave: chave,
          })
        }
      })
    }
  }

  dadosPorMes.forEach(({ label, dados }) => {
    const idxInicio = dados.findIndex(d => normalizarNome(d.descrever) === 'INVESTIMENTOS' && d.hierarquia === 1)
    const idxFim = dados.findIndex(d => normalizarNome(d.descrever) === 'RESULTADO COM INVESTIMENTOS')
    
    if (idxInicio >= 0) {
      const fim = idxFim > idxInicio ? idxFim : dados.length
      const investimentos = dados.slice(idxInicio, fim)

      let paiH1 = ''
      let paiH2 = ''

      investimentos.forEach(item => {
        const nome = normalizarNome(item.descrever)
        
        if (item.hierarquia === 1) {
          paiH1 = nome
          paiH2 = ''
        } else if (item.hierarquia === 2) {
          paiH2 = nome
        }

        const chave = criarChaveUnica(item, paiH1, paiH2)
        
        if (itensMap.has(chave)) {
          const itemDetalhado = itensMap.get(chave)!
          itemDetalhado.valores[label] = item.val_num
          itemDetalhado.acumulado += item.val_num
        }
      })
    }
  })

  const itens = ordemItens.map(chave => itensMap.get(chave)!).filter(Boolean)
  
  const totalGeral = itens
    .filter(i => i.hierarquia === 1)
    .reduce((acc, i) => acc + i.acumulado, 0)

  itens.forEach(item => {
    item.percentual = totalGeral > 0 ? (item.acumulado / totalGeral) * 100 : 0
  })

  return { itens, meses, totalGeral }
}