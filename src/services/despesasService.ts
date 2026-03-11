import { DreItem } from '@/types/dre'
import { ItemDetalhado } from './detalhamentoService'

// Remove prefixos [+], [-], [=], (-) e normaliza
function normalizarNome(nome: string): string {
  return nome.replace(/^\[\+\]\s*|^\[\-\]\s*|^\[\=\]\s*|^\(\-\)\s*/g, '').trim().toUpperCase()
}

// Mapeamento de nomes equivalentes
const MAPEAMENTO_NOMES: { [key: string]: string } = {
  'IMPOSTOS SOBRE VENDA': 'IMPOSTOS',
  'RETENÇÕES ISS': 'ISS',
  'IMPOSTO DE RENDA': 'IRPJ',
  'CONTR SOCIAL': 'CONTRIBUICAO SOCIAL',
  'AGUA E ESGOTO': 'AGUA',
  'AGUA ESTACIONAMENTO': 'AGUA DO ESTACIONAMENTO',
  'ENERGIA ELETRICA': 'ENERGIA',
  'INTERNET/SERVIDOR': 'INTERNET',
  'MENSALIDADE DE SOFTWARE': 'SOFTWARES',
  'AGENCIA MARKETING': 'MARKETING',
  'DECORACOES DE LOJAS': 'DECORAÇÃO',
  'CONVCARD ACIBR': 'CONVCARD',
  'FACISC UTIL': 'FACISC',
  'LAVANDERIA UNIFORMES': 'LAVANDERIA',
  'SEGURO DO CARRO': 'SEGURO VEICULOS',
  'TARIFAS BANCARIAS': 'TARIFAS',
}

function normalizarComMapeamento(nome: string): string {
  const normalizado = normalizarNome(nome)
  return MAPEAMENTO_NOMES[normalizado] || normalizado
}

function criarChave(nome: string, hierarquia: number, paiH1: string, paiH2: string): string {
  if (hierarquia === 1) return `H1:${nome}`
  if (hierarquia === 2) return `H2:${paiH1}>${nome}`
  return `H3:${paiH1}>${paiH2}>${nome}`
}

interface ContaInfo {
  chave: string
  descricao: string
  hierarquia: number
  paiH1: string
  paiH2: string
}

export function extrairDespesas(dadosPorMes: { label: string; dados: DreItem[] }[]): {
  itens: ItemDetalhado[]
  meses: string[]
  totalGeral: number
} {
  const meses = dadosPorMes.map(m => m.label)
  const itensMap = new Map<string, ItemDetalhado>()
  
  // Estrutura para manter ordem e hierarquia
  const contasNormais = new Map<string, ContaInfo>()
  const contasGestaoPessoas = new Map<string, ContaInfo>()
  
  

  // FASE 1: Coletar TODAS as contas de TODOS os meses
  dadosPorMes.forEach(({ dados }) => {
    const idxInicio = dados.findIndex(d => normalizarNome(d.descrever) === 'IMPOSTOS' && d.hierarquia === 1)
    const idxFim = dados.findIndex(d => normalizarComMapeamento(d.descrever) === 'TOTAL DE PAGAMENTOS')
    
    if (idxInicio < 0 || idxFim <= idxInicio) return
    
    const despesas = dados.slice(idxInicio, idxFim)
    
    let paiH1 = ''
    let paiH2 = ''
    let contadorDespPessoal = 0
    let dentroGestaoPessoas = false
    let nomeBlocoAtual = ''
    
    despesas.forEach((item) => {
      const nome = normalizarComMapeamento(item.descrever)

      // Ignorar DESCONTOS RECEBIDOS (é receita, não despesa)
if (nome === 'DESCONTOS RECEBIDOS' || nome === 'TIPO DE DESCONTOS' || nome === 'DESCONTO FINANCEIRO') {
  return
}
      
      // Atualiza contexto hierárquico
      if (item.hierarquia === 1) {
        paiH1 = nome
        paiH2 = ''
        dentroGestaoPessoas = false
      } else if (item.hierarquia === 2) {
        // DESPESAS COM PESSOAL -> GESTÃO DE PESSOAS
        if (nome === 'DESPESAS COM PESSOAL') {
          contadorDespPessoal++
          dentroGestaoPessoas = true
          nomeBlocoAtual = contadorDespPessoal === 1 ? 'FOLHA DE PAGAMENTO' : 'ENCARGOS SOCIAIS'
          paiH2 = nomeBlocoAtual
          
          const chave = `H2:GESTÃO DE PESSOAS>${nomeBlocoAtual}`
          if (!contasGestaoPessoas.has(chave)) {
            contasGestaoPessoas.set(chave, {
              chave,
              descricao: nomeBlocoAtual,
              hierarquia: 2,
              paiH1: 'GESTÃO DE PESSOAS',
              paiH2: '',
            })
          }
          return
        } else {
          dentroGestaoPessoas = false
          paiH2 = nome
        }
      }
      
      // Sub-contas de GESTÃO DE PESSOAS
      if (dentroGestaoPessoas && item.hierarquia === 3) {
        const chave = `H3:GESTÃO DE PESSOAS>${nomeBlocoAtual}>${nome}`
        if (!contasGestaoPessoas.has(chave)) {
          contasGestaoPessoas.set(chave, {
            chave,
            descricao: nome,
            hierarquia: 3,
            paiH1: 'GESTÃO DE PESSOAS',
            paiH2: nomeBlocoAtual,
          })
        }
        return
      }
      
      // Contas normais (não GESTÃO DE PESSOAS)
      if (!dentroGestaoPessoas) {
        const chave = criarChave(nome, item.hierarquia, paiH1, paiH2)
        if (!contasNormais.has(chave)) {
          contasNormais.set(chave, {
            chave,
            descricao: nome,
            hierarquia: item.hierarquia,
            paiH1,
            paiH2,
          })
        }
      }
    })
  })
  
  // FASE 2: Ordenar contas por hierarquia dentro de cada grupo
  // Primeiro pegar todas as H1, depois suas H2, depois suas H3
  const chavesOrdenadas: string[] = []
  
  // Pegar H1s na ordem que aparecem
  const h1s = Array.from(contasNormais.values()).filter(c => c.hierarquia === 1)
  
  h1s.forEach(h1 => {
    chavesOrdenadas.push(h1.chave)
    
    // Pegar H2s deste H1
    const h2s = Array.from(contasNormais.values()).filter(c => c.hierarquia === 2 && c.paiH1 === h1.descricao)
    
    h2s.forEach(h2 => {
      chavesOrdenadas.push(h2.chave)
      
      // Pegar H3s deste H2
      const h3s = Array.from(contasNormais.values()).filter(c => c.hierarquia === 3 && c.paiH1 === h1.descricao && c.paiH2 === h2.descricao)
      
      h3s.forEach(h3 => {
        chavesOrdenadas.push(h3.chave)
      })
    })
  })
  
  // FASE 3: Inserir GESTÃO DE PESSOAS antes de COMPRAS DE MERCADORIAS
  const idxCompras = chavesOrdenadas.findIndex(c => c === 'H1:COMPRAS DE MERCADORIAS')
  const posicaoInsercao = idxCompras >= 0 ? idxCompras : chavesOrdenadas.length
  
  const chavesGestao: string[] = ['H1:GESTÃO DE PESSOAS']
  
  // Adicionar FOLHA DE PAGAMENTO e suas sub-contas
  const folhaPagamento = Array.from(contasGestaoPessoas.values()).filter(c => c.paiH2 === '' && c.descricao === 'FOLHA DE PAGAMENTO')
  const subFolha = Array.from(contasGestaoPessoas.values()).filter(c => c.paiH2 === 'FOLHA DE PAGAMENTO')
  
  folhaPagamento.forEach(f => chavesGestao.push(f.chave))
  subFolha.forEach(s => chavesGestao.push(s.chave))
  
  // Adicionar ENCARGOS SOCIAIS e suas sub-contas
  const encargosSociais = Array.from(contasGestaoPessoas.values()).filter(c => c.paiH2 === '' && c.descricao === 'ENCARGOS SOCIAIS')
  const subEncargos = Array.from(contasGestaoPessoas.values()).filter(c => c.paiH2 === 'ENCARGOS SOCIAIS')
  
  encargosSociais.forEach(e => chavesGestao.push(e.chave))
  subEncargos.forEach(s => chavesGestao.push(s.chave))
  
  // Inserir GESTÃO DE PESSOAS
  chavesOrdenadas.splice(posicaoInsercao, 0, ...chavesGestao)
  
  // FASE 4: Criar itensMap
  chavesOrdenadas.forEach((chave, idx) => {
    const contaNormal = contasNormais.get(chave)
    const contaGestao = contasGestaoPessoas.get(chave)
    const conta = contaNormal || contaGestao
    
    if (chave === 'H1:GESTÃO DE PESSOAS') {
      itensMap.set(chave, {
        id: 99999,
        descricao: 'GESTÃO DE PESSOAS',
        hierarquia: 1,
        valores: {},
        acumulado: 0,
        percentual: 0,
        ordem: idx,
        chave: chave,
      })
    } else if (conta) {
      itensMap.set(chave, {
        id: 0,
        descricao: conta.descricao,
        hierarquia: conta.hierarquia,
        valores: {},
        acumulado: 0,
        percentual: 0,
        ordem: idx,
        chave: chave,
      })
    }
  })

  // FASE 5: Processar valores de cada mês
  dadosPorMes.forEach(({ label, dados }) => {
    const idxInicio = dados.findIndex(d => normalizarNome(d.descrever) === 'IMPOSTOS' && d.hierarquia === 1)
    const idxFim = dados.findIndex(d => normalizarComMapeamento(d.descrever) === 'TOTAL DE PAGAMENTOS')
    
    if (idxInicio < 0 || idxFim <= idxInicio) return
    
    const despesas = dados.slice(idxInicio, idxFim)

    let paiH1 = ''
    let paiH2 = ''
    let contadorDespPessoal = 0
    let dentroGestaoPessoas = false
    let totalGestaoPessoasMes = 0
    let nomeBlocoAtual = ''
    let valorDespesasOperacionaisOriginal = 0

    despesas.forEach(item => {
      const nome = normalizarComMapeamento(item.descrever)
      
      // Ignorar DESCONTOS RECEBIDOS (é receita, não despesa)
if (nome === 'DESCONTOS RECEBIDOS' || nome === 'TIPO DE DESCONTOS' || nome === 'DESCONTO FINANCEIRO') {
  return
}
      // Atualiza contexto hierárquico
      if (item.hierarquia === 1) {
        paiH1 = nome
        paiH2 = ''
        dentroGestaoPessoas = false
        
        // Guardar valor original de DESPESAS OPERACIONAIS
        if (nome === 'DESPESAS OPERACIONAIS') {
          valorDespesasOperacionaisOriginal = item.val_num
          return // Não processar agora, vamos calcular depois
        }
      } else if (item.hierarquia === 2) {
        if (nome === 'DESPESAS COM PESSOAL') {
          contadorDespPessoal++
          dentroGestaoPessoas = true
          nomeBlocoAtual = contadorDespPessoal === 1 ? 'FOLHA DE PAGAMENTO' : 'ENCARGOS SOCIAIS'
          paiH2 = nomeBlocoAtual
          
          totalGestaoPessoasMes += item.val_num
          
          const chave = `H2:GESTÃO DE PESSOAS>${nomeBlocoAtual}`
          if (itensMap.has(chave)) {
            const itemDetalhado = itensMap.get(chave)!
            itemDetalhado.valores[label] = item.val_num
            itemDetalhado.acumulado += item.val_num
          }
          return
        } else {
          dentroGestaoPessoas = false
          paiH2 = nome
        }
      }
      
      // Sub-contas de GESTÃO DE PESSOAS
      if (dentroGestaoPessoas && item.hierarquia === 3) {
        const chave = `H3:GESTÃO DE PESSOAS>${nomeBlocoAtual}>${nome}`
        if (itensMap.has(chave)) {
          const itemDetalhado = itensMap.get(chave)!
          itemDetalhado.valores[label] = item.val_num
          itemDetalhado.acumulado += item.val_num
        }
        return
      }
      
      // Contas normais
      if (!dentroGestaoPessoas) {
        const chave = criarChave(nome, item.hierarquia, paiH1, paiH2)
        if (itensMap.has(chave)) {
          const itemDetalhado = itensMap.get(chave)!
          itemDetalhado.valores[label] = item.val_num
          itemDetalhado.acumulado += item.val_num
        }
      }
    })
    
    // Atualizar total GESTÃO DE PESSOAS
    const chaveGestao = 'H1:GESTÃO DE PESSOAS'
    if (itensMap.has(chaveGestao)) {
      const itemGestao = itensMap.get(chaveGestao)!
      itemGestao.valores[label] = totalGestaoPessoasMes
      itemGestao.acumulado += totalGestaoPessoasMes
    }
    
    // Atualizar DESPESAS OPERACIONAIS = valor original - gestão de pessoas
    const chaveDespOp = 'H1:DESPESAS OPERACIONAIS'
    if (itensMap.has(chaveDespOp)) {
      const itemDespOp = itensMap.get(chaveDespOp)!
      const valorCorrigido = valorDespesasOperacionaisOriginal - totalGestaoPessoasMes
      itemDespOp.valores[label] = valorCorrigido
      itemDespOp.acumulado += valorCorrigido
    }
  })

  // FASE 6: Montar lista final
  const itens = chavesOrdenadas
    .map(chave => itensMap.get(chave))
    .filter((item): item is ItemDetalhado => item !== undefined)
  
  const totalGeral = itens
    .filter(i => i.hierarquia === 1)
    .reduce((acc, i) => acc + i.acumulado, 0)

  itens.forEach(item => {
    item.percentual = totalGeral > 0 ? (item.acumulado / totalGeral) * 100 : 0
  })

  return { itens, meses, totalGeral }
}