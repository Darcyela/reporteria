export const EMPRESAS_GRUPO = [
  { id: '70360100-6', rut: '70360100-6', label: 'Asociación Chilena De Seguridad', isPrimary: true, color: '#27933e' },
  { id: '71027300-6', rut: '71027300-6', label: 'Club De Deportes Y Recreacion De Achs', color: '#4361ee', fechaDisabled: true },
  { id: '76198822-0', rut: '76198822-0', label: 'Empresa De Servicios Externos Asociacion Chilena De Seguridad Transpor', color: '#f8961e', fechaDisabled: true },
  { id: '76481620-K', rut: '76481620-K', label: 'Centro Médico Hts Spa', color: '#9b5de5', fechaDisabled: true },
  { id: '99579260-5', rut: '99579260-5', label: 'Empresa De Servicios Externos Asociación', color: '#06d6a0', fechaDisabled: true },
]

export const DEFAULT_EMPRESAS_GRUPO = [EMPRESAS_GRUPO[0].id]

export const DEFAULT_EMPRESAS_SINIESTROS = EMPRESAS_GRUPO.slice(0, 4).map(empresa => empresa.id)
