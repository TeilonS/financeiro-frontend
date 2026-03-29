import { useState } from 'react'

export function useMonthNavigation(initialDate = new Date()) {
  const [mes, setMes] = useState(initialDate.getMonth() + 1)
  const [ano, setAno] = useState(initialDate.getFullYear())

  function prevMes() {
    if (mes === 1) { setMes(12); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }

  function nextMes() {
    if (mes === 12) { setMes(1); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  return { mes, ano, prevMes, nextMes }
}
