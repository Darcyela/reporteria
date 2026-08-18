/**
 * Clases compartidas para botones del UI kit ACHS (marca Seguro).
 * outline = secundario: fondo blanco, borde verde oscuro grueso.
 */
export const outlineBtnClass =
  'border-2 border-solid !border-[var(--primary)] !bg-white !text-[var(--primary)] hover:!bg-[var(--secondary)] active:!bg-[var(--secondary)]'

/** Botón pill de descarga Excel (gráficos y acciones secundarias en Accidentes). */
export const downloadOutlineBtnClass =
  `${outlineBtnClass} !inline-flex !items-center !justify-center !rounded-full !px-[22px] !py-[10px] !min-h-[42px] !h-auto !text-sm !font-bold !leading-snug !whitespace-nowrap`
