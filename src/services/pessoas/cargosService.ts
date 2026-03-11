// ============================================
// SERVICE: CARGOS
// ============================================

import { supabase } from '@/lib/supabase'
import { Cargo } from '@/types/pessoas'

export async function listarCargos(): Promise<Cargo[]> {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .order('nome')

  if (error) throw error
  return data || []
}

export async function buscarCargo(id: number): Promise<Cargo | null> {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function criarCargo(
  cargo: Omit<Cargo, 'id' | 'created_at'>
): Promise<Cargo> {
  const { data, error } = await supabase
    .from('cargos')
    .insert(cargo)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarCargo(
  id: number, 
  cargo: Partial<Cargo>
): Promise<Cargo> {
  const { data, error } = await supabase
    .from('cargos')
    .update(cargo)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function excluirCargo(id: number): Promise<void> {
  const { error } = await supabase
    .from('cargos')
    .delete()
    .eq('id', id)

  if (error) throw error
}