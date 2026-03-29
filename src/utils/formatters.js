export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)
}

export function formatDate(s) {
  if (!s) return '—'
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR')
}

export function yAxisFmt(v) {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`
  return `R$${v}`
}
