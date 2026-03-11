// Constantes
export const MESES = [
  { value: 1, label: 'Janeiro', abrev: 'Jan' },
  { value: 2, label: 'Fevereiro', abrev: 'Fev' },
  { value: 3, label: 'Março', abrev: 'Mar' },
  { value: 4, label: 'Abril', abrev: 'Abr' },
  { value: 5, label: 'Maio', abrev: 'Mai' },
  { value: 6, label: 'Junho', abrev: 'Jun' },
  { value: 7, label: 'Julho', abrev: 'Jul' },
  { value: 8, label: 'Agosto', abrev: 'Ago' },
  { value: 9, label: 'Setembro', abrev: 'Set' },
  { value: 10, label: 'Outubro', abrev: 'Out' },
  { value: 11, label: 'Novembro', abrev: 'Nov' },
  { value: 12, label: 'Dezembro', abrev: 'Dez' },
]

// Calcular idade a partir da data de nascimento
export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento + 'T12:00:00')
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesAtual = hoje.getMonth()
  const mesNascimento = nascimento.getMonth()
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

// Calcular tempo de empresa em anos
export function calcularTempoEmpresaAnos(dataAdmissao: string): number {
  const hoje = new Date()
  const admissao = new Date(dataAdmissao + 'T12:00:00')
  let anos = hoje.getFullYear() - admissao.getFullYear()
  const mesAtual = hoje.getMonth()
  const mesAdmissao = admissao.getMonth()
  if (mesAtual < mesAdmissao || (mesAtual === mesAdmissao && hoje.getDate() < admissao.getDate())) {
    anos--
  }
  return anos
}

// Verificar se uma data está nos próximos N dias
export function estaProximosDias(data: string, dias: number): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataRef = new Date(data + 'T12:00:00')
  dataRef.setFullYear(hoje.getFullYear())
  
  if (dataRef < hoje) {
    dataRef.setFullYear(hoje.getFullYear() + 1)
  }
  
  const diffTime = dataRef.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays >= 0 && diffDays <= dias
}

// Obter dia e mês de uma data
export function getDiaMes(data: string): { dia: number; mes: number } {
  const d = new Date(data + 'T12:00:00')
  return { dia: d.getDate(), mes: d.getMonth() + 1 }
}

// Calcular quantos dias até o próximo aniversário
export function diasAteAniversario(data: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataRef = new Date(data + 'T12:00:00')
  dataRef.setFullYear(hoje.getFullYear())
  
  if (dataRef < hoje) {
    dataRef.setFullYear(hoje.getFullYear() + 1)
  }
  
  const diffTime = dataRef.getTime() - hoje.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}