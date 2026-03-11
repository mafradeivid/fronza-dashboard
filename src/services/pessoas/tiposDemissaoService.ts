// ============================================
// SERVICE: TIPOS DE DEMISSÃO
// ============================================

import { supabase } from '@/lib/supabase'
import { TipoDemissao } from '@/types/pessoas'

export async function listarTiposDemissao(): Promise<TipoDemissao[]> {
  const { data, error } = await supabase
    .from('tipos_demissao')
    .select('*')
    .order('id')

  if (error) throw error
  return data || []
}

export async function buscarTipoDemissao(id: number): Promise<TipoDemissao | null> {
  const { data, error } = await supabase
    .from('tipos_demissao')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}