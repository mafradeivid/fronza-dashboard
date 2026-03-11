export interface DreItem {
  au_id: number
  val_num: number
  recel_percent_numeric: number
  percentagem_despesa: number
  hierarquia: number
  created_at: string
  descrever: string
  meses: string
}

export interface DreResumo {
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
  margemLucro: number
}