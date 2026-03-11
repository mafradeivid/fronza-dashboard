import { supabase } from '@/lib/supabase'
import { DreItem } from '@/types/dre'

// Lista de meses disponíveis (do mais recente ao mais antigo)
export const MESES_DISPONIVEIS = [
  { tabela: 'dre_02_2026', label: 'Fev/26' },
  { tabela: 'dre_01_2026', label: 'Jan/26' },
  { tabela: 'dre_12_2025', label: 'Dez/25' },
  { tabela: 'dre_11_2025', label: 'Nov/25' },
  { tabela: 'dre_10_2025', label: 'Out/25' },
  { tabela: 'dre_09_2025', label: 'Set/25' },
  { tabela: 'dre_08_2025', label: 'Ago/25' },
  { tabela: 'dre_07_2025', label: 'Jul/25' },
  { tabela: 'dre_06_2025', label: 'Jun/25' },
  { tabela: 'dre_05_2025', label: 'Mai/25' },
  { tabela: 'dre_04_2025', label: 'Abr/25' },
]

export async function buscarDrePorMes(tabela: string): Promise<DreItem[]> {
  const { data, error } = await supabase
    .from(tabela)
    .select('*')
    .order('au_id', { ascending: true })

  if (error) {
    console.error(`Erro ao buscar ${tabela}:`, error.message)
    return []
  }

  return data || []
}

export async function buscarTodosMeses(): Promise<{ mes: string; label: string; dados: DreItem[] }[]> {
  const resultados = []

  for (const mes of MESES_DISPONIVEIS) {
    const dados = await buscarDrePorMes(mes.tabela)
    if (dados.length > 0) {
      resultados.push({
        mes: mes.tabela,
        label: mes.label,
        dados
      })
    }
  }

  return resultados
}

export interface ResumoMensal {
  mes: string
  label: string
  receitasOperacionais: number
  descontosRecebidos: number
  totalReceitas: number
  impostos: number
  despesasOperacionais: number
  gestaoPessoas: number
  cmv: number
  totalDespesas: number
  resultadoOperacao: number
}

export function calcularResumoMensal(dados: DreItem[], mes: string, label: string): ResumoMensal {
  // Função de busca que ignora prefixos [+], [-], [=]
  const buscar = (nome: string, hierarquia?: number) => {
    const item = dados.find(d => {
      // Remove prefixos para comparação
      const nomeNormalizado = d.descrever.replace(/^\[\+\]\s*|^\[\-\]\s*|^\[\=\]\s*/g, '').trim()
      const match = nomeNormalizado === nome || d.descrever === nome
      return match && (hierarquia === undefined || d.hierarquia === hierarquia)
    })
    return item?.val_num || 0
  }

  // Função para somar valores por nome (para contas que aparecem mais de uma vez)
  const somarPorNome = (nome: string, hierarquia?: number) => {
    return dados
      .filter(d => {
        const nomeNormalizado = d.descrever.replace(/^\[\+\]\s*|^\[\-\]\s*|^\[\=\]\s*/g, '').trim()
        const match = nomeNormalizado === nome || d.descrever === nome
        return match && (hierarquia === undefined || d.hierarquia === hierarquia)
      })
      .reduce((acc, d) => acc + d.val_num, 0)
  }

  // Receitas
  const receitasOperacionais = buscar('TOTAL DE RECEBIMENTOS', 1)
  const descontosRecebidos = buscar('DESCONTOS RECEBIDOS', 1)
  const totalReceitas = receitasOperacionais + descontosRecebidos

  // Despesas
  const impostos = buscar('IMPOSTOS', 1)
  
  // Gestão de Pessoas = soma das duas linhas DESPESAS COM PESSOAL (hierarquia 2)
  const gestaoPessoas = somarPorNome('DESPESAS COM PESSOAL', 2)
  
  // Despesas Operacionais = total - gestão de pessoas
  const despesasOpTotal = buscar('DESPESAS OPERACIONAIS', 1)
  const despesasOperacionais = despesasOpTotal - gestaoPessoas
  
  const cmv = buscar('COMPRAS DE MERCADORIAS', 1)
  const totalDespesas = impostos + despesasOperacionais + gestaoPessoas + cmv

  const resultadoOperacao = totalReceitas - totalDespesas

  return {
    mes,
    label,
    receitasOperacionais,
    descontosRecebidos,
    totalReceitas,
    impostos,
    despesasOperacionais,
    gestaoPessoas,
    cmv,
    totalDespesas,
    resultadoOperacao
  }
}