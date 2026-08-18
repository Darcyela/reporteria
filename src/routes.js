export const ROUTES = {
  home: '/',
  accidentes: '/accidentes',
  accidentesSinSucursal: '/accidentes/sin-sucursal',
  lgf: '/lgf',
  vigilancia: '/vigilancia',
  gestionRiesgo: '/gestion-riesgo',
  capacitaciones: '/capacitaciones',
  capacitacionesV2: '/capacitaciones/v2',
  acerca: '/acerca',
}

export const NAV_SECTIONS = [
  { label: 'Accidentes', path: ROUTES.accidentes },
  { label: 'Lesiones Graves y Fatales (LGF)', path: ROUTES.lgf },
  { label: 'Vigilancia de la salud', path: ROUTES.vigilancia },
  { label: 'Gestión del riesgo', path: ROUTES.gestionRiesgo },
  { label: 'Capacitaciones', path: ROUTES.capacitaciones },
  { label: 'Acerca de reportería', path: ROUTES.acerca },
]

export const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Inicio' },
  { icon: '💰', label: 'Cotizaciones' },
  {
    icon: '📊',
    label: 'Accidentes',
    children: [
      { label: 'Vista completa', path: ROUTES.accidentes },
      { label: 'Sin indicadores por sucursal', path: ROUTES.accidentesSinSucursal },
    ],
  },
  { icon: '⚠️', label: 'Lesiones Graves y Fatales', path: ROUTES.lgf },
  { icon: '🏥', label: 'Vigilancia de la salud', path: ROUTES.vigilancia },
  { icon: '🛡️', label: 'Gestión del riesgo', path: ROUTES.gestionRiesgo },
  {
    icon: '🎓',
    label: 'Capacitaciones',
    children: [
      { label: 'Vista estándar', path: ROUTES.capacitaciones },
      { label: 'Vista explorador', path: ROUTES.capacitacionesV2 },
    ],
  },
  { icon: '📋', label: 'Acerca de reportería', path: ROUTES.acerca },
  { icon: '📈', label: 'Estadísticas' },
  { icon: '📁', label: 'Documentos' },
  { icon: '🔔', label: 'Notificaciones' },
  { icon: '⚙️', label: 'Configuración' },
  { icon: '❓', label: 'Ayuda' },
]
