// ============================================
// SERVICE: EMPRESAS
// ============================================

import { supabase } from '@/lib/supabase'
import { Empresa } from '@/types/pessoas'

export async function listarEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('razao_social')

  if (error) throw error
  return data || []
}

export async function buscarEmpresa(id: number): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function criarEmpresa(
  empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>
): Promise<Empresa> {
  const { data, error } = await supabase
    .from('empresas')
    .insert(empresa)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarEmpresa(
  id: number, 
  empresa: Partial<Empresa>
): Promise<Empresa> {
  const { data, error } = await supabase
    .from('empresas')
    .update({ ...empresa, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function excluirEmpresa(id: number): Promise<void> {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', id)

  if (error) throw error
}