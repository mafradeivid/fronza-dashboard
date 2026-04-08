// ============================================
// SERVICE: PROPORCIONALIDADE DE CÁLCULOS
// Conexão com Supabase
// ============================================

import { supabase } from '@/lib/supabase'
import {
  ConfigCalculo,
  CONFIG_CALCULO_INICIAL,
  ResumoProporcionalidade,
  LogCalculo,
} from '@/types/calculo'
import {
  calcularSaldoSalario,
  calcularFeriasProporcionais,
  calcular13Proporcional,
  extrairAnoMes,
} from '@/utils/calculo'
import { PERCENTUAL_FGTS, PERCENTUAL_MULTA_FGTS } from '@/config/calculoConfig'

/**
 * Busca configuração de cálculo da empresa
 * Se não existir, retorna configuração padrão
 */
export async function buscarConfigCalculo(empresaId: string): Promise<ConfigCalculo> {
  const { data, error } = await supabase
    .from('config_calculo')
    .select('*')
    .eq('empresa_id', empresaId)
    .single()

  if (error || !data) {
    // Retorna config padrão se não encontrar
    return {
      ...CONFIG_CALCULO_INICIAL,
      empresa_id: empresaId,
    }
  }

  return data as ConfigCalculo
}

/**
 * Salva ou atualiza configuração de cálculo da empresa
 */
export async function salvarConfigCalculo(config: ConfigCalculo): Promise<ConfigCalculo | null> {
  const { data, error } = await supabase
    .from('config_calculo')
    .upsert({
      empresa_id: config.empresa_id,
      metodo_divisor: config.metodo_divisor,
      excecao_fevereiro: config.excecao_fevereiro,
      incluir_dia_admissao: config.incluir_dia_admissao,
      incluir_dia_demissao: config.incluir_dia_demissao,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'empresa_id',
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar config:', error)
    return null
  }

  return data as ConfigCalculo
}

/**
 * Calcula todos os valores de rescisão
 */
export async function calcularRescisao(params: {
  empresaId: string
  funcionarioId: string
  salarioBase: number
  dataAdmissao: string
  dataDemissao: string
  tipoDemissao: string
  temFeriasVencidas?: boolean
}): Promise<ResumoProporcionalidade> {
  const {
    empresaId,
    salarioBase,
    dataAdmissao,
    dataDemissao,
    tipoDemissao,
    
  } = params

  // Busca config da empresa
  const config = await buscarConfigCalculo(empresaId)
  const { ano, mes } = extrairAnoMes(dataDemissao)

  // 1. Saldo de salário
  const saldoSalario = calcularSaldoSalario(
    {
      salario_base: salarioBase,
      data_demissao: dataDemissao,
      ano,
      mes,
      aviso_previo: false,
    },
    config
  )

  // 2. Férias proporcionais (não paga em justa causa)
  let feriasProporcionais = undefined
  if (tipoDemissao !== 'justa_causa') {
    feriasProporcionais = calcularFeriasProporcionais(
      salarioBase,
      dataAdmissao,
      dataDemissao
    )
  }

  // 3. 13º proporcional (não paga em justa causa)
  let decimoTerceiro = undefined
  if (tipoDemissao !== 'justa_causa') {
    decimoTerceiro = calcular13Proporcional(
      salarioBase,
      dataAdmissao,
      dataDemissao
    )
  }

  // 4. Multa FGTS (40% em demissão sem justa causa)
  let multaFgts = undefined
  if (tipoDemissao === 'sem_justa_causa') {
    // Simplificado: calcula sobre saldo estimado
    // Na prática, precisa do saldo real do FGTS
    const mesesTrabalhados = Math.ceil(
      (new Date(dataDemissao).getTime() - new Date(dataAdmissao).getTime()) / 
      (1000 * 60 * 60 * 24 * 30)
    )
    const fgtsEstimado = salarioBase * PERCENTUAL_FGTS * mesesTrabalhados
    multaFgts = fgtsEstimado * PERCENTUAL_MULTA_FGTS
  }

  // Total
  const total = 
    saldoSalario.valor_proporcional +
    (feriasProporcionais?.valor_total || 0) +
    (decimoTerceiro?.valor_proporcional || 0) +
    (multaFgts || 0)

  return {
    saldo_salario: saldoSalario,
    ferias_proporcionais: feriasProporcionais,
    decimo_terceiro_proporcional: decimoTerceiro,
    multa_fgts: multaFgts ? Math.round(multaFgts * 100) / 100 : undefined,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Registra log de cálculo para auditoria
 */
export async function registrarLogCalculo(log: Omit<LogCalculo, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('log_calculos')
    .insert({
      empresa_id: log.empresa_id,
      funcionario_id: log.funcionario_id,
      tipo_calculo: log.tipo_calculo,
      resultado: log.resultado,
    })

  if (error) {
    console.error('Erro ao registrar log:', error)
  }
}

/**
 * Busca histórico de cálculos de um funcionário
 */
export async function buscarHistoricoCalculos(funcionarioId: string): Promise<LogCalculo[]> {
  const { data, error } = await supabase
    .from('log_calculos')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar histórico:', error)
    return []
  }

  return data as LogCalculo[]
}