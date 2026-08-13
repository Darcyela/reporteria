export const FONT_SANS = 'ACHS Nueva Sans'
export const FONT_SERIF = 'ACHS Nueva Serif'
export const FONT_ARIAL = 'Arial'

export function chartFont(size, weight = 'normal', family = FONT_SANS) {
  return { family, size, weight }
}

export function chartTooltip(size = 12, family = FONT_SANS) {
  const font = chartFont(size, 'normal', family)
  return { titleFont: font, bodyFont: font }
}
