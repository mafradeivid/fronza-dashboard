// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatarCNPJ(valor: string): string {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

/**
 * Remove formatação do CNPJ
 */
export function limparCNPJ(valor: string): string {
  return valor.replace(/\D/g, '')
}

/**
 * Valida CNPJ (formato básico)
 */
export function validarCNPJ(cnpj: string): boolean {
  const limpo = limparCNPJ(cnpj)
  return limpo.length === 14
}

/**
 * Formata valor monetário brasileiro: R$ 1.234,56
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Formata valor monetário sem símbolo: 1.234,56
 */
export function formatarMoedaSemSimbolo(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Converte string monetária para número
 * "1.234,56" -> 1234.56
 */
export function parseMoeda(valor: string): number {
  const limpo = valor
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(limpo) || 0
}

/**
 * Formata percentual brasileiro: 12,50%
 */
export function formatarPercentual(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '%'
}

/**
 * Converte string percentual para número
 * "12,50" -> 12.50
 */
export function parsePercentual(valor: string): number {
  const limpo = valor.replace(/[%\s]/g, '').replace(',', '.')
  return parseFloat(limpo) || 0
}

/**
 * Formata data para exibição: 01/01/2024
 */
export function formatarData(data: string | null): string {
  if (!data) return '-'
  const d = new Date(data + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata data para input: 2024-01-01
 */
export function formatarDataInput(data: string | null): string {
  if (!data) return ''
  return data.split('T')[0]
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calcularIdade(nascimento: string | null): number | null {
  if (!nascimento) return null
  const hoje = new Date()
  const nasc = new Date(nascimento + 'T00:00:00')
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const mes = hoje.getMonth() - nasc.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
    idade--
  }
  return idade
}

/**
 * Calcula tempo de empresa em anos e meses
 */
export function calcularTempoEmpresa(admissao: string): string {
  const hoje = new Date()
  const adm = new Date(admissao + 'T00:00:00')
  
  let anos = hoje.getFullYear() - adm.getFullYear()
  let meses = hoje.getMonth() - adm.getMonth()
  
  if (meses < 0) {
    anos--
    meses += 12
  }
  
  if (hoje.getDate() < adm.getDate()) {
    meses--
    if (meses < 0) {
      anos--
      meses += 12
    }
  }
  
  if (anos === 0) {
    return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
  }
  
  if (meses === 0) {
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  }
  
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`
}

/**
 * Formata input de moeda em tempo real
 */
export function handleMoedaInput(valor: string): string {
  // Remove tudo exceto números
  const limpo = valor.replace(/\D/g, '')
  
  // Converte para número com 2 casas decimais
  const numero = parseInt(limpo) / 100
  
  if (isNaN(numero) || numero === 0) return ''
  
  // Formata como moeda brasileira
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata input de percentual em tempo real
 */
export function handlePercentualInput(valor: string): string {
  // Permite números e vírgula
  const limpo = valor.replace(/[^\d,]/g, '')
  
  // Garante apenas uma vírgula
  const partes = limpo.split(',')
  if (partes.length > 2) {
    return partes[0] + ',' + partes.slice(1).join('')
  }
  
  // Limita casas decimais a 2
  if (partes.length === 2 && partes[1].length > 2) {
    return partes[0] + ',' + partes[1].slice(0, 2)
  }
  
  return limpo
}

/**
 * Retorna a próxima data de aniversário e quantos dias faltam
 */
export function calcularProximoAniversario(nascimento: string | null): { data: string; diasFaltando: number } | null {
  if (!nascimento) return null
  
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const nasc = new Date(nascimento + 'T00:00:00')
  
  // Próximo aniversário neste ano
  let proximoAniversario = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())
  
  // Se já passou, pegar do próximo ano
  if (proximoAniversario < hoje) {
    proximoAniversario = new Date(hoje.getFullYear() + 1, nasc.getMonth(), nasc.getDate())
  }
  
  // Calcular dias faltando
  const diffTime = proximoAniversario.getTime() - hoje.getTime()
  const diasFaltando = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    data: proximoAniversario.toLocaleDateString('pt-BR'),
    diasFaltando
  }
}

/**
 * Formata o tempo de empresa de forma compacta
 */
export function calcularTempoEmpresaCompacto(admissao: string): { anos: number; meses: number; texto: string } {
  const hoje = new Date()
  const adm = new Date(admissao + 'T00:00:00')
  
  let anos = hoje.getFullYear() - adm.getFullYear()
  let meses = hoje.getMonth() - adm.getMonth()
  
  if (meses < 0) {
    anos--
    meses += 12
  }
  
  if (hoje.getDate() < adm.getDate()) {
    meses--
    if (meses < 0) {
      anos--
      meses += 12
    }
  }

  let texto = ''
  if (anos === 0) {
    texto = `${meses}m`
  } else if (meses === 0) {
    texto = `${anos}a`
  } else {
    texto = `${anos}a ${meses}m`
  }
  
  return { anos, meses, texto }
}

/**
 * Retorna a próxima data de aniversário de empresa
 */
export function calcularAniversarioEmpresa(admissao: string): { data: string; diasFaltando: number; anosCompletando: number } | null {
  if (!admissao) return null
  
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const adm = new Date(admissao + 'T00:00:00')
  
  // Próximo aniversário neste ano
  let proximoAniversario = new Date(hoje.getFullYear(), adm.getMonth(), adm.getDate())
  let anosCompletando = hoje.getFullYear() - adm.getFullYear()
  
  // Se já passou, pegar do próximo ano
  if (proximoAniversario <= hoje) {
    proximoAniversario = new Date(hoje.getFullYear() + 1, adm.getMonth(), adm.getDate())
    anosCompletando = hoje.getFullYear() + 1 - adm.getFullYear()
  }
  
  // Calcular dias faltando
  const diffTime = proximoAniversario.getTime() - hoje.getTime()
  const diasFaltando = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    data: proximoAniversario.toLocaleDateString('pt-BR'),
    diasFaltando,
    anosCompletando
  }
}