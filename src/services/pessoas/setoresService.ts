// ============================================
// SERVICE: SETORES
// ============================================

import { supabase } from '@/lib/supabase'
import { Setor } from '@/types/pessoas'

export async function listarSetores(): Promise<Setor[]> {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .order('nome')

  if (error) throw error
  return data || []
}

export async function buscarSetor(id: string): Promise<Setor | null> {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function criarSetor(
  setor: Omit<Setor, 'id' | 'created_at' | 'updated_at'>
): Promise<Setor> {
  const { data, error } = await supabase
    .from('setores')
    .insert(setor)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarSetor(
  id: string, 
  setor: Partial<Setor>
): Promise<Setor> {
  const { data, error } = await supabase
    .from('setores')
    .update({ ...setor, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function excluirSetor(id: string): Promise<void> {
  const { error } = await supabase
    .from('setores')
    .delete()
    .eq('id', id)

  if (error) throw error
}