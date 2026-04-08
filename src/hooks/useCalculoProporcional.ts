// ============================================
// HOOK: useCalculoProporcional
// Gerencia cálculos de proporcionalidade
// ============================================

import { useState, useCallback } from 'react'
import {
  ConfigCalculo,
  ResumoProporcionalidade,
  CONFIG_CALCULO_INICIAL,
} from '@/types/calculo'
import {
  buscarConfigCalculo,
  salvarConfigCalculo,
  calcularRescisao,
  registrarLogCalculo,
} from '@/services/calculo'

interface UseCalculoProporcionalReturn {
  config: ConfigCalculo
  resultado: ResumoProporcionalidade | null
  loading: boolean
  erro: string | null
  carregarConfig: (empresaId: string) => Promise<void>
  salvarConfig: (config: ConfigCalculo) => Promise<boolean>
  calcular: (params: ParametrosCalculo) => Promise<ResumoProporcionalidade | null>
  limpar: () => void
}

interface ParametrosCalculo {
  empresaId: string | number
  funcionarioId: string | number
  salarioBase: number
  dataAdmissao: string
  dataDemissao: string
  tipoDemissao: string
  salvarLog?: boolean
}

export function useCalculoProporcional(): UseCalculoProporcionalReturn {
  const [config, setConfig] = useState<ConfigCalculo>(CONFIG_CALCULO_INICIAL)
  const [resultado, setResultado] = useState<ResumoProporcionalidade | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  /**
   * Carrega configuração da empresa
   */
  const carregarConfig = useCallback(async (empresaId: string) => {
    setLoading(true)
    setErro(null)
    try {
      const data = await buscarConfigCalculo(empresaId)
      setConfig(data)
    } catch (e) {
      setErro('Erro ao carregar configuração')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Salva configuração
   */
  const salvarConfig = useCallback(async (novaConfig: ConfigCalculo): Promise<boolean> => {
    setLoading(true)
    setErro(null)
    try {
      const resultado = await salvarConfigCalculo(novaConfig)
      if (resultado) {
        setConfig(resultado)
        return true
      }
      setErro('Erro ao salvar configuração')
      return false
    } catch (e) {
      setErro('Erro ao salvar configuração')
      console.error(e)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Executa cálculo de rescisão
   */
  const calcular = useCallback(async (params: ParametrosCalculo): Promise<ResumoProporcionalidade | null> => {
    setLoading(true)
    setErro(null)
    try {
      const res = await calcularRescisao({
        empresaId: String(params.empresaId),
        funcionarioId: String(params.funcionarioId),
        salarioBase: params.salarioBase,
        dataAdmissao: params.dataAdmissao,
        dataDemissao: params.dataDemissao,
        tipoDemissao: params.tipoDemissao,
      })

      setResultado(res)

      // Salva log se solicitado
      if (params.salvarLog) {
        await registrarLogCalculo({
          empresa_id: String(params.empresaId),
          funcionario_id: String(params.funcionarioId),
          tipo_calculo: 'demissao',
          resultado: res,
        })
      }

      return res
    } catch (e) {
      setErro('Erro ao calcular rescisão')
      console.error(e)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Limpa resultado
   */
  const limpar = useCallback(() => {
    setResultado(null)
    setErro(null)
  }, [])

  return {
    config,
    resultado,
    loading,
    erro,
    carregarConfig,
    salvarConfig,
    calcular,
    limpar,
  }
}