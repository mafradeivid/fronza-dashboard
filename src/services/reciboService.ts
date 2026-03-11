import jsPDF from 'jspdf'
import { PagamentoExtra, getLabelTipoPagamento } from '@/types/pessoas'
import { formatarMoeda } from '@/utils/formatters'

// Converter número para extenso
function numeroParaExtenso(valor: number): string {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  if (valor === 0) return 'zero reais'
  if (valor === 100) return 'cem reais'

  let extenso = ''
  const parteInteira = Math.floor(valor)
  const centavos = Math.round((valor - parteInteira) * 100)

  if (parteInteira >= 1000) {
    const milhares = Math.floor(parteInteira / 1000)
    if (milhares === 1) {
      extenso += 'mil'
    } else if (milhares < 10) {
      extenso += unidades[milhares] + ' mil'
    } else if (milhares < 20) {
      extenso += especiais[milhares - 10] + ' mil'
    } else {
      const dezMilhar = Math.floor(milhares / 10)
      const uniMilhar = milhares % 10
      extenso += dezenas[dezMilhar]
      if (uniMilhar > 0) extenso += ' e ' + unidades[uniMilhar]
      extenso += ' mil'
    }
    const resto = parteInteira % 1000
    if (resto > 0 && resto < 100) {
      extenso += ' e '
    } else if (resto >= 100) {
      extenso += ' '
    }
  }

  const restoMilhar = parteInteira % 1000

  if (restoMilhar >= 100) {
    const c = Math.floor(restoMilhar / 100)
    if (restoMilhar === 100) {
      extenso += 'cem'
    } else {
      extenso += centenas[c]
    }
    const restoCentena = restoMilhar % 100
    if (restoCentena > 0) extenso += ' e '
  }

  const restoCentena = restoMilhar % 100

  if (restoCentena >= 10 && restoCentena < 20) {
    extenso += especiais[restoCentena - 10]
  } else if (restoCentena >= 20) {
    const d = Math.floor(restoCentena / 10)
    extenso += dezenas[d]
    const u = restoCentena % 10
    if (u > 0) extenso += ' e ' + unidades[u]
  } else if (restoCentena > 0) {
    extenso += unidades[restoCentena]
  }

  if (parteInteira === 1) {
    extenso += ' real'
  } else if (parteInteira > 0) {
    extenso += ' reais'
  }

  if (centavos > 0) {
    if (parteInteira > 0) extenso += ' e '
    if (centavos >= 10 && centavos < 20) {
      extenso += especiais[centavos - 10]
    } else if (centavos >= 20) {
      const d = Math.floor(centavos / 10)
      extenso += dezenas[d]
      const u = centavos % 10
      if (u > 0) extenso += ' e ' + unidades[u]
    } else {
      extenso += unidades[centavos]
    }
    extenso += centavos === 1 ? ' centavo' : ' centavos'
  }

  return extenso.trim()
}

// Formatar data por extenso
function dataExtenso(data?: string | null): string {
  const d = data ? new Date(data + 'T12:00:00') : new Date()
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  return `Navegantes, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

// Obter nome do mês
function getNomeMes(mes: number): string {
  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes] || ''
}

// Desenhar linha horizontal
function linha(doc: jsPDF, x1: number, y: number, x2: number, cor: number[] = [220, 220, 220]) {
  doc.setDrawColor(cor[0], cor[1], cor[2])
  doc.setLineWidth(0.3)
  doc.line(x1, y, x2, y)
}

// NOVO LAYOUT DO RECIBO
function desenharRecibo(
  doc: jsPDF,
  pagamento: PagamentoExtra,
  posY: number,
  numero: number
): void {
  const margem = 10
  const largura = 190
  const alturaRecibo = 90
  const paddingX = 8

  const empresa = pagamento.funcionario?.empresa
  const funcionario = pagamento.funcionario

  // ===== BORDA EXTERNA =====
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.4)
  doc.rect(margem, posY, largura, alturaRecibo)

  // ===== HEADER (sutil) =====
  doc.setFillColor(248, 250, 252) // slate-50
  doc.rect(margem, posY, largura, 10, 'F')
  linha(doc, margem, posY + 10, margem + largura)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(51, 65, 85) // slate-700
  doc.text('RECIBO DE PAGAMENTO', margem + paddingX, posY + 7)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139) // slate-500
  doc.text(`Nº ${String(numero).padStart(4, '0')}/${pagamento.competencia_ano}`, margem + largura - paddingX, posY + 7, { align: 'right' })

  // ===== EMPRESA PAGADORA =====
  let y = posY + 16

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text('EMPRESA PAGADORA', margem + paddingX, y)

  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59) // slate-800
  doc.text(empresa?.razao_social || '-', margem + paddingX, y)

  y += 4
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  
  // CNPJ e IE na mesma linha
  const cnpj = empresa?.cnpj || '00.000.000/0000-00'
  const ie = empresa?.inscricao_estadual
  let documentos = `CNPJ: ${cnpj}`
  if (ie) {
    documentos += `  |  IE: ${ie}`
  }
  doc.text(documentos, margem + paddingX, y)

  // ===== VALOR (área destacada) =====
  y += 5
  doc.setFillColor(255, 251, 235) // amber-50
  doc.setDrawColor(251, 191, 36) // amber-400
  doc.setLineWidth(0.5)
  doc.rect(margem + paddingX - 3, y, largura - (paddingX * 2) + 6, 14, 'FD')

  y += 5
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(146, 64, 14) // amber-800
  doc.text('VALOR RECEBIDO', margem + paddingX, y)

  y += 6
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(180, 83, 9) // amber-700
  doc.text(formatarMoeda(Number(pagamento.valor)), margem + paddingX, y)

  // Extenso (ao lado do valor)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(146, 64, 14)
  const extenso = `(${numeroParaExtenso(Number(pagamento.valor))})`
  doc.text(extenso, margem + 65, y, { maxWidth: 120 })

  // ===== REFERÊNCIA =====
  y += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105) // slate-600
  doc.text('Referente a:', margem + paddingX, y)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  const tipoLabel = getLabelTipoPagamento(pagamento.tipo)
  const competencia = `${getNomeMes(pagamento.competencia_mes)}/${pagamento.competencia_ano}`
  doc.text(`${tipoLabel} - ${competencia}`, margem + paddingX + 22, y)

  // ===== SEPARADOR =====
  y += 5
  linha(doc, margem + paddingX, y, margem + largura - paddingX)

  // ===== BENEFICIÁRIO =====
  y += 5
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('BENEFICIÁRIO', margem + paddingX, y)

  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(funcionario?.nome_completo || '-', margem + paddingX, y)

  // ===== DATA =====
  y += 7
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(dataExtenso(pagamento.data_pagamento), margem + paddingX, y)

  // ===== ASSINATURAS =====
  y += 8  // Era 12, agora sobe um pouco
  const col1 = margem + 50
  const col2 = margem + largura - 50
  const linhaLargura = 55

   // Assinatura Beneficiário
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.line(col1 - linhaLargura / 2, y, col1 + linhaLargura / 2, y)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105) // slate-600 (mais escuro para legibilidade)
  const nomeBeneficiario = funcionario?.nome_completo || 'Beneficiário'
  doc.text(nomeBeneficiario, col1, y + 3, { align: 'center' })
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('Assinatura do Beneficiário', col1, y + 6, { align: 'center' })

  // Assinatura Empresa
  doc.line(col2 - linhaLargura / 2, y, col2 + linhaLargura / 2, y)

  doc.setFontSize(7)
  doc.setTextColor(71, 85, 105)
  const nomeEmpresa = empresa?.razao_social || 'Empresa'
  doc.text(nomeEmpresa, col2, y + 3, { align: 'center', maxWidth: linhaLargura })
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('Assinatura da Empresa', col2, y + 6, { align: 'center' })

  // ===== LINHA DE CORTE =====
  const corteY = posY + alturaRecibo + 4
  if (corteY < 290) {
    doc.setDrawColor(200, 200, 200)
    doc.setLineDashPattern([2, 2], 0)
    doc.line(margem, corteY, margem + largura, corteY)
    doc.setLineDashPattern([], 0)

    doc.setFontSize(8)
    doc.setTextColor(200, 200, 200)
    doc.text('✂', margem + largura / 2 - 1.5, corteY + 1)
  }
}

// Gerar PDF com um recibo (individual)
export function gerarReciboIndividual(pagamento: PagamentoExtra): void {
  const doc = new jsPDF('p', 'mm', 'a4')

  desenharRecibo(doc, pagamento, 10, 1)

  const nomeArquivo = `recibo_${pagamento.funcionario?.nome_completo?.replace(/\s+/g, '_') || 'funcionario'}_${pagamento.competencia_mes}_${pagamento.competencia_ano}.pdf`
  doc.save(nomeArquivo)
}

// Gerar PDF em lote (3 por página, agrupado por empresa)
export function gerarRecibosLote(pagamentos: PagamentoExtra[]): void {
  if (pagamentos.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')

  // Agrupar por empresa
  const porEmpresa = new Map<number, PagamentoExtra[]>()

  pagamentos.forEach(p => {
    const empresaId = p.funcionario?.empresa_id || 0
    if (!porEmpresa.has(empresaId)) {
      porEmpresa.set(empresaId, [])
    }
    porEmpresa.get(empresaId)!.push(p)
  })

  let primeiraPagina = true
  let numeroRecibo = 1

  const empresasArray = Array.from(porEmpresa.entries())

  empresasArray.forEach(([, pagamentosEmpresa], empresaIndex) => {
    // Ordenar por nome do funcionário
    pagamentosEmpresa.sort((a, b) =>
      (a.funcionario?.nome_completo || '').localeCompare(b.funcionario?.nome_completo || '')
    )

    // 3 recibos por página (90mm + 8mm espaço = 98mm por recibo)
    for (let i = 0; i < pagamentosEmpresa.length; i++) {
      const posicaoNaPagina = i % 3

      if (posicaoNaPagina === 0 && (i > 0 || !primeiraPagina)) {
        doc.addPage()
      }

      primeiraPagina = false

      const posY = 5 + (posicaoNaPagina * 98)

      desenharRecibo(doc, pagamentosEmpresa[i], posY, numeroRecibo)
      numeroRecibo++
    }

    // Nova empresa = nova página
    if (empresaIndex < empresasArray.length - 1) {
      doc.addPage()
    }
  })

  const primeiroAno = pagamentos[0]?.competencia_ano || new Date().getFullYear()
  const primeiroMes = pagamentos[0]?.competencia_mes || (new Date().getMonth() + 1)
  doc.save(`recibos_lote_${primeiroMes}_${primeiroAno}.pdf`)
}