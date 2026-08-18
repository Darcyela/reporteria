import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from '@achsux/ui'
import { Building2, Building, BarChart3, Calendar as CalendarIcon, ChartColumn, ChevronDown, Download, FileDown, Filter, Info, Mail, MapPin, Plus, Search, Users, X } from 'lucide-react'
import { downloadOutlineBtnClass, outlineBtnClass } from '../uiButton.js'
import TrabajadoresDiasChart from '../components/TrabajadoresDiasChart.jsx'
import SiniestrosTotalesChart from '../components/SiniestrosTotalesChart.jsx'
import EmpresaGrupoFilter from '../components/EmpresaGrupoFilter.jsx'
import SucursalSearchFilter from '../components/SucursalSearchFilter.jsx'
import { DEFAULT_EMPRESAS_GRUPO, EMPRESAS_GRUPO } from '../data/empresasGrupo.js'
import { chartFont, chartTooltip, FONT_ARIAL } from '../chartFonts.js'
import styles from './AccidentesPage.module.css'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend
)

/* ─── Mock data ─────────────────────────────────── */
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const SECTORES = [
  { id: 'agropecuario',          label: 'Agropecuario-silvícola',                         color: '#4dd0e1' },
  { id: 'comercio',              label: 'Comercio',                                         color: '#f9c74f' },
  { id: 'construccion',          label: 'Construcción',                                     color: '#f72585' },
  { id: 'electricidad',          label: 'Electricidad, Gas Y Agua',                         color: '#81d877' },
  { id: 'energia',               label: 'Energía',                                          color: '#f8961e' },
  { id: 'fiscales',              label: 'Entidades Fiscales',                               color: '#4361ee' },
  { id: 'industria',             label: 'Industria Manufacturera Y Empresas De Servicios',  color: '#9b5de5' },
  { id: 'mineria',               label: 'Minería',                                          color: '#e63946' },
  { id: 'otras_actividades',     label: 'Otras Actividades',                                color: '#06d6a0' },
  { id: 'pesca',                 label: 'Pesca',                                            color: '#118ab2' },
  { id: 'servicios_financieros', label: 'Servicios Financieros',                            color: '#bc6c25' },
  { id: 'transporte',            label: 'Transporte Y Comunicaciones',                      color: '#7209b7' },
]

function buildEmpresaGrupoTimeline(baseTimeline, factor, offset) {
  return baseTimeline.map(value =>
    value === null ? null : +(Math.max(0, value * factor + offset).toFixed(1)),
  )
}

const EMPRESA_TASA_ACC = {
  2022: [0.4, 0.6, 0.9, 1.0, 2.1, 1.8, 1.5, 1.4, 1.7, 2.0, 2.3, 2.6],
  2023: [0.3, 0.7, 1.1, 1.3, 2.9, 2.4, 1.9, 1.8, 2.2, 2.5, 2.9, 3.3],
  2024: [0.5, 0.9, 1.3, 1.6, 3.4, 2.8, 2.2, 2.0, 2.5, 2.9, 3.3, 3.8],
  2025: [0, 0.8, 1.2, 1.5, 3.8, 3.1, 2.4, 2.2, 2.8, 3.2, 3.6, 4.1],
  2026: [0, 0.5, 0.9, 1.1, 2.6, 2.2, null, null, null, null, null, null],
}

const SECTOR_DATA_BY_YEAR = {
  2022: {
    agropecuario:  [0.8, 1.0, 1.2, 1.4, 2.4, 2.0, 1.8, 1.7, 2.0, 2.2, 2.5, 2.8],
    comercio:      [0.6, 0.8, 1.0, 1.2, 2.1, 1.8, 1.6, 1.5, 1.8, 2.0, 2.2, 2.5],
    construccion:  [1.1, 1.3, 1.6, 1.8, 3.1, 2.6, 2.2, 2.0, 2.4, 2.8, 3.1, 3.5],
    electricidad:  [0.5, 0.6, 0.8, 0.9, 1.7, 1.5, 1.3, 1.2, 1.5, 1.7, 1.9, 2.1],
    energia:       [0.7, 0.9, 1.1, 1.3, 2.2, 1.9, 1.6, 1.5, 1.8, 2.1, 2.3, 2.6],
    fiscales:      [0.4, 0.5, 0.7, 0.8, 1.5, 1.3, 1.1, 1.0, 1.2, 1.4, 1.6, 1.8],
    industria:             [0.9, 1.1, 1.4, 1.6, 2.8, 2.4, 2.0, 1.9, 2.2, 2.5, 2.8, 3.2],
    mineria:               [0.5, 0.7, 0.9, 1.0, 1.9, 1.7, 1.4, 1.3, 1.6, 1.8, 2.0, 2.3],
    otras_actividades:     [0.6, 0.7, 0.9, 1.0, 1.8, 1.6, 1.4, 1.3, 1.5, 1.7, 1.9, 2.2],
    pesca:                 [0.7, 0.8, 1.0, 1.1, 2.0, 1.7, 1.5, 1.4, 1.6, 1.8, 2.0, 2.3],
    servicios_financieros: [0.3, 0.4, 0.6, 0.7, 1.3, 1.1, 1.0, 0.9, 1.1, 1.2, 1.4, 1.6],
    transporte:            [0.8, 1.0, 1.2, 1.4, 2.5, 2.1, 1.8, 1.7, 2.0, 2.3, 2.6, 2.9],
  },
  2023: {
    agropecuario:  [0.9, 1.2, 1.4, 1.6, 2.8, 2.4, 2.1, 2.0, 2.3, 2.6, 2.9, 3.3],
    comercio:      [0.7, 0.9, 1.2, 1.4, 2.5, 2.1, 1.9, 1.7, 2.1, 2.3, 2.6, 2.9],
    construccion:  [1.3, 1.6, 1.9, 2.1, 3.5, 3.0, 2.6, 2.4, 2.8, 3.1, 3.4, 3.9],
    electricidad:  [0.6, 0.7, 0.9, 1.1, 2.1, 1.8, 1.5, 1.4, 1.7, 1.9, 2.2, 2.5],
    energia:       [0.8, 1.1, 1.3, 1.5, 2.6, 2.2, 1.9, 1.8, 2.1, 2.4, 2.7, 3.0],
    fiscales:      [0.5, 0.6, 0.8, 1.0, 1.9, 1.6, 1.4, 1.3, 1.5, 1.8, 2.0, 2.3],
    industria:             [1.1, 1.4, 1.7, 1.9, 3.2, 2.7, 2.3, 2.2, 2.5, 2.9, 3.2, 3.6],
    mineria:               [0.6, 0.8, 1.0, 1.3, 2.3, 2.0, 1.7, 1.6, 1.9, 2.2, 2.4, 2.7],
    otras_actividades:     [0.7, 0.8, 1.0, 1.2, 2.0, 1.8, 1.6, 1.5, 1.7, 1.9, 2.1, 2.4],
    pesca:                 [0.8, 0.9, 1.1, 1.3, 2.2, 1.9, 1.7, 1.6, 1.8, 2.0, 2.2, 2.5],
    servicios_financieros: [0.4, 0.5, 0.7, 0.8, 1.5, 1.3, 1.1, 1.0, 1.2, 1.4, 1.6, 1.8],
    transporte:            [0.9, 1.1, 1.3, 1.5, 2.7, 2.3, 2.0, 1.9, 2.2, 2.5, 2.8, 3.1],
  },
  2024: {
    agropecuario:  [1.0, 1.3, 1.5, 1.7, 3.0, 2.6, 2.3, 2.1, 2.5, 2.8, 3.1, 3.5],
    comercio:      [0.8, 1.0, 1.3, 1.5, 2.7, 2.3, 2.1, 1.9, 2.2, 2.5, 2.8, 3.2],
    construccion:  [1.4, 1.7, 2.0, 2.2, 3.7, 3.2, 2.7, 2.5, 2.9, 3.3, 3.6, 4.1],
    electricidad:  [0.6, 0.8, 1.0, 1.2, 2.2, 1.9, 1.6, 1.5, 1.8, 2.1, 2.3, 2.6],
    energia:       [0.9, 1.2, 1.4, 1.6, 2.8, 2.4, 2.1, 1.9, 2.3, 2.6, 2.9, 3.3],
    fiscales:      [0.5, 0.7, 0.9, 1.1, 2.0, 1.7, 1.5, 1.4, 1.6, 1.9, 2.1, 2.4],
    industria:             [1.2, 1.5, 1.8, 2.0, 3.4, 2.9, 2.5, 2.3, 2.7, 3.1, 3.4, 3.8],
    mineria:               [0.7, 0.9, 1.1, 1.4, 2.5, 2.1, 1.8, 1.7, 2.0, 2.4, 2.6, 2.9],
    otras_actividades:     [0.8, 1.0, 1.2, 1.4, 2.2, 1.9, 1.7, 1.6, 1.9, 2.1, 2.3, 2.6],
    pesca:                 [0.9, 1.1, 1.3, 1.5, 2.4, 2.1, 1.8, 1.7, 2.0, 2.2, 2.4, 2.7],
    servicios_financieros: [0.5, 0.6, 0.8, 1.0, 1.7, 1.5, 1.3, 1.2, 1.4, 1.6, 1.8, 2.0],
    transporte:            [1.0, 1.2, 1.4, 1.7, 2.9, 2.5, 2.2, 2.0, 2.4, 2.7, 3.0, 3.3],
  },
  2025: {
    agropecuario:  [1.1, 1.4, 1.6, 1.9, 3.2, 2.8, 2.5, 2.3, 2.7, 3.0, 3.3, 3.7],
    comercio:      [0.9, 1.1, 1.4, 1.7, 2.9, 2.5, 2.2, 2.0, 2.4, 2.7, 3.0, 3.4],
    construccion:  [1.5, 1.8, 2.1, 2.4, 3.9, 3.4, 2.9, 2.7, 3.1, 3.5, 3.8, 4.3],
    electricidad:  [0.7, 0.9, 1.1, 1.3, 2.4, 2.1, 1.8, 1.7, 2.0, 2.2, 2.5, 2.8],
    energia:       [1.0, 1.3, 1.5, 1.8, 3.0, 2.6, 2.3, 2.1, 2.5, 2.8, 3.1, 3.5],
    fiscales:      [0.6, 0.8, 1.0, 1.2, 2.2, 1.9, 1.7, 1.5, 1.8, 2.1, 2.3, 2.6],
    industria:             [1.3, 1.6, 1.9, 2.2, 3.6, 3.1, 2.7, 2.5, 2.9, 3.2, 3.5, 4.0],
    mineria:               [0.8, 1.0, 1.2, 1.5, 2.7, 2.3, 2.0, 1.9, 2.2, 2.5, 2.7, 3.1],
    otras_actividades:     [0.9, 1.1, 1.3, 1.6, 2.4, 2.1, 1.9, 1.7, 2.0, 2.3, 2.5, 2.8],
    pesca:                 [1.0, 1.2, 1.4, 1.7, 2.6, 2.3, 2.0, 1.9, 2.2, 2.4, 2.6, 2.9],
    servicios_financieros: [0.6, 0.7, 0.9, 1.1, 1.9, 1.7, 1.5, 1.4, 1.6, 1.8, 2.0, 2.2],
    transporte:            [1.1, 1.3, 1.5, 1.8, 3.1, 2.7, 2.4, 2.2, 2.6, 2.9, 3.2, 3.5],
  },
  2026: {
    agropecuario:  [1.2, 1.5, 1.8, 2.0, 2.8, 2.5, null, null, null, null, null, null],
    comercio:      [1.0, 1.2, 1.5, 1.8, 2.5, 2.2, null, null, null, null, null, null],
    construccion:  [1.6, 1.9, 2.2, 2.5, 3.4, 3.0, null, null, null, null, null, null],
    electricidad:  [0.8, 1.0, 1.2, 1.4, 2.1, 1.8, null, null, null, null, null, null],
    energia:       [1.1, 1.4, 1.6, 1.9, 2.7, 2.3, null, null, null, null, null, null],
    fiscales:      [0.7, 0.9, 1.1, 1.3, 1.9, 1.6, null, null, null, null, null, null],
    industria:             [1.4, 1.7, 2.0, 2.3, 3.2, 2.8, null, null, null, null, null, null],
    mineria:               [0.9, 1.1, 1.3, 1.6, 2.3, 2.0, null, null, null, null, null, null],
    otras_actividades:     [1.0, 1.2, 1.4, 1.7, 2.5, 2.2, null, null, null, null, null, null],
    pesca:                 [1.1, 1.3, 1.5, 1.8, 2.7, 2.4, null, null, null, null, null, null],
    servicios_financieros: [0.7, 0.8, 1.0, 1.2, 1.8, 1.6, null, null, null, null, null, null],
    transporte:            [1.2, 1.4, 1.6, 1.9, 2.8, 2.5, null, null, null, null, null, null],
  },
}

/* ─── Timeline (continuous) data for Opción B ───── */
const MESES_COMPLETOS = {
  Ene: 'Enero', Feb: 'Febrero', Mar: 'Marzo', Abr: 'Abril',
  May: 'Mayo', Jun: 'Junio', Jul: 'Julio', Ago: 'Agosto',
  Sep: 'Septiembre', Oct: 'Octubre', Nov: 'Noviembre', Dic: 'Diciembre',
}

function formatTimelineTooltipLabel(label) {
  const [mes, anio] = label.split(' ')
  return `${MESES_COMPLETOS[mes] ?? mes} ${anio}`
}

const TIMELINE_LABELS = [
  'Ene 22','Feb 22','Mar 22','Abr 22','May 22','Jun 22','Jul 22','Ago 22','Sep 22','Oct 22','Nov 22','Dic 22',
  'Ene 23','Feb 23','Mar 23','Abr 23','May 23','Jun 23','Jul 23','Ago 23','Sep 23','Oct 23','Nov 23','Dic 23',
  'Ene 24','Feb 24','Mar 24','Abr 24','May 24','Jun 24','Jul 24','Ago 24','Sep 24','Oct 24','Nov 24','Dic 24',
  'Ene 25','Feb 25','Mar 25','Abr 25','May 25','Jun 25','Jul 25','Ago 25','Sep 25','Oct 25','Nov 25','Dic 25',
  'Ene 26','Feb 26','Mar 26','Abr 26','May 26','Jun 26',
]

const EMPRESA_TIMELINE = [
  ...EMPRESA_TASA_ACC[2022],
  ...EMPRESA_TASA_ACC[2023],
  ...EMPRESA_TASA_ACC[2024],
  ...EMPRESA_TASA_ACC[2025],
  ...EMPRESA_TASA_ACC[2026].slice(0, 6),
]

const SECTOR_TIMELINE = Object.fromEntries(
  SECTORES.map(s => [
    s.id,
    [
      ...SECTOR_DATA_BY_YEAR[2022][s.id],
      ...SECTOR_DATA_BY_YEAR[2023][s.id],
      ...SECTOR_DATA_BY_YEAR[2024][s.id],
      ...SECTOR_DATA_BY_YEAR[2025][s.id],
      ...SECTOR_DATA_BY_YEAR[2026][s.id].slice(0, 6),
    ],
  ])
)

// Range → [startIndex, endIndex] into the 54-point timeline
const RANGE_SLICES = {
  '2026': [48, 54],   // Ene–Jun 2026
  '1A':   [42, 54],   // Jul 2025–Jun 2026
  '2A':   [30, 54],   // Jul 2024–Jun 2026
  '3A':   [18, 54],   // Jul 2023–Jun 2026
  '4A':   [6,  54],   // Jul 2022–Jun 2026
  '5A':   [0,  54],   // Ene 2022–Jun 2026
}

// Orden del selector: de más amplio a más reciente (2026 activo por defecto)
const RANGE_OPTIONS = [
  { id: '5A',   label: '+5 años' },
  { id: '4A',   label: '+4 años' },
  { id: '3A',   label: '+3 años' },
  { id: '2A',   label: '+2 años' },
  { id: '1A',   label: '+1 año' },
  { id: '2026', label: '2026' },
]

function buildTimelineChartData(range, selectedSectors, options) {
  const {
    empresaTimeline,
    sectorTimeline,
    empresaLabel,
    hidden = [],
    selectedEmpresas = null,
    empresasGrupo = null,
    empresaGrupoTimelines = null,
  } = options
  const [start, end] = RANGE_SLICES[range] || RANGE_SLICES['2026']
  const labels = TIMELINE_LABELS.slice(start, end)

  const empresaDatasets = selectedEmpresas?.length && empresasGrupo && empresaGrupoTimelines
    ? empresasGrupo
        .filter(empresa => selectedEmpresas.includes(empresa.id))
        .map(empresa => {
          const isPrimary = empresa.isPrimary
          return {
            label: isPrimary ? `${empresa.label} (Mi empresa)` : empresa.label,
            data: empresaGrupoTimelines[empresa.id].slice(start, end),
            borderColor: empresa.color,
            backgroundColor: isPrimary ? 'rgba(39,147,62,0.10)' : 'transparent',
            borderWidth: isPrimary ? 2.5 : 1.5,
            pointBackgroundColor: empresa.color,
            pointRadius: isPrimary ? 3 : 2,
            tension: 0.4,
            fill: isPrimary,
            hidden: hidden.includes(empresa.id),
          }
        })
    : [
        {
          label: empresaLabel,
          data: empresaTimeline.slice(start, end),
          borderColor: '#27933e',
          backgroundColor: 'rgba(39,147,62,0.10)',
          borderWidth: 2.5,
          pointBackgroundColor: '#27933e',
          pointRadius: 3,
          tension: 0.4,
          fill: true,
          hidden: hidden.includes('empresa'),
        },
      ]

  return {
    labels,
    datasets: [
      ...empresaDatasets,
      ...SECTORES
        .filter(s => selectedSectors.includes(s.id))
        .map(s => ({
          label: s.label,
          data: sectorTimeline[s.id].slice(start, end),
          borderColor: s.color,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointBackgroundColor: s.color,
          pointRadius: 2,
          tension: 0.4,
          fill: false,
          hidden: hidden.includes(s.id),
        })),
    ],
  }
}

function buildTimelineData(range, selectedSectors, hidden = [], selectedEmpresas = null) {
  return buildTimelineChartData(range, selectedSectors, {
    empresaTimeline: EMPRESA_TIMELINE,
    sectorTimeline: SECTOR_TIMELINE,
    empresaLabel: 'Accidentabilidad empresa',
    hidden,
    selectedEmpresas,
    empresasGrupo: EMPRESAS_GRUPO,
    empresaGrupoTimelines: EMPRESA_GRUPO_ACC_TIMELINE,
  })
}

const EMPRESA_TASA_SIN = {
  2022: [0, 0.7, 1.0, 1.2, 2.4, 2.0, 1.7, 1.6, 1.9, 2.2, 2.5, 2.9],
  2023: [0, 0.8, 1.2, 1.4, 3.2, 2.6, 2.1, 2.0, 2.4, 2.7, 3.2, 3.6],
  2024: [0, 0.9, 1.3, 1.6, 3.7, 3.0, 2.4, 2.2, 2.7, 3.1, 3.5, 4.0],
  2025: [0, 0.5, 0.9, 1.1, 2.9, 2.4, 1.8, 1.7, 2.1, 2.4, 2.8, 3.2],
  2026: [0, 0.4, 0.8, 1.0, 2.5, 2.1, null, null, null, null, null, null],
}

const SECTOR_SINIESTRO_BY_YEAR = Object.fromEntries(
  Object.entries(SECTOR_DATA_BY_YEAR).map(([year, sectors]) => [
    year,
    Object.fromEntries(
      Object.entries(sectors).map(([id, values]) => [
        id,
        values.map(v => (v === null ? null : +(v * 1.1).toFixed(1))),
      ]),
    ),
  ]),
)
SECTOR_SINIESTRO_BY_YEAR[2025].comercio = [0.9, 1.1, 1.4, 1.6, 2.6, 2.3, 2.1, 2.0, 2.3, 2.5, 2.7, 3.1]

const EMPRESA_SIN_TIMELINE = [
  ...EMPRESA_TASA_SIN[2022],
  ...EMPRESA_TASA_SIN[2023],
  ...EMPRESA_TASA_SIN[2024],
  ...EMPRESA_TASA_SIN[2025],
  ...EMPRESA_TASA_SIN[2026].slice(0, 6),
]

const EMPRESA_GRUPO_ACC_TIMELINE = Object.fromEntries(
  EMPRESAS_GRUPO.map((empresa, index) => [
    empresa.id,
    buildEmpresaGrupoTimeline(EMPRESA_TIMELINE, 1 - index * 0.07, index * 0.04),
  ]),
)

const EMPRESA_GRUPO_SIN_TIMELINE = Object.fromEntries(
  EMPRESAS_GRUPO.map((empresa, index) => [
    empresa.id,
    buildEmpresaGrupoTimeline(EMPRESA_SIN_TIMELINE, 1 - index * 0.06, index * 0.35),
  ]),
)

const SECTOR_SIN_TIMELINE = Object.fromEntries(
  SECTORES.map(s => [
    s.id,
    [
      ...SECTOR_SINIESTRO_BY_YEAR[2022][s.id],
      ...SECTOR_SINIESTRO_BY_YEAR[2023][s.id],
      ...SECTOR_SINIESTRO_BY_YEAR[2024][s.id],
      ...SECTOR_SINIESTRO_BY_YEAR[2025][s.id],
      ...SECTOR_SINIESTRO_BY_YEAR[2026][s.id].slice(0, 6),
    ],
  ]),
)

const COLOR_RANK_A = '#81d877'
const COLOR_RANK_B = '#4dd0e1'
const SUCURSALES_PAGE_SIZE = 20

const SUCURSAL_NOMBRES = [
  'Santiago Centro', 'Antofagasta', 'Concepción', 'Valparaíso', 'Providencia', 'Temuco', 'La Serena',
  'Puerto Montt', 'Rancagua', 'Iquique', 'Talca', 'Chillán', 'Copiapó', 'Osorno', 'Arica',
  'Los Ángeles', 'Curicó', 'Quillota', 'San Antonio', 'Calama', 'Punta Arenas', 'Valdivia',
  'Ovalle', 'Linares', 'Melipilla', 'San Fernando', 'Coyhaique', 'Castro', 'Vallenar', 'Angol',
  'Quilpué', 'Buin', 'Coronel', 'San Felipe', 'Lota', 'Parral', 'Tocopilla', 'Constitución',
  'Ancud', 'Cauquenes', 'Lebu', 'Illapel', 'Río Bueno', 'Los Andes', 'Victoria', 'Las Condes',
  'Ñuñoa', 'Maipú', 'Puente Alto', 'La Florida', 'San Bernardo', 'Peñalolén', 'La Reina',
  'Vitacura', 'Recoleta', 'Independencia', 'Estación Central', 'Quilicura', 'Pudahuel', 'Cerrillos',
  'Huechuraba', 'Macul', 'La Cisterna', 'El Bosque', 'Pedro Aguirre Cerda', 'Lo Prado', 'Cerro Navia',
  'Renca', 'Conchalí', 'Lo Espejo', 'San Miguel', 'San Joaquín', 'La Granja', 'La Pintana',
  'Pirque', 'Colina', 'Lampa', 'Tiltil', 'Talagante', 'Peñaflor', 'Padre Hurtado', 'El Monte',
  'Isla de Maipo', 'Curacaví', 'Casa Blanca', 'Limache', 'Olmué', 'Villa Alemana', 'Viña del Mar',
  'Concón', 'Quintero', 'Puchuncaví', 'Cartagena', 'El Quisco', 'Algarrobo', 'Santo Domingo',
  'Los Vilos', 'Salamanca', 'Andacollo', 'Vicuña', 'Coquimbo', 'Tongoy', 'Caldera', 'Chañaral',
  'Diego de Almagro', 'Mejillones', 'Taltal', 'Pozo Almonte', 'Alto Hospicio', 'Putre',
  'San Pedro de Atacama', 'María Elena', 'Quellón', 'Puerto Varas', 'Frutillar', 'Llanquihue',
  'Puerto Aysén', 'Chile Chico', 'Natales', 'Porvenir', 'Curanilahue', 'Arauco', 'Cañete',
  'Mulchén', 'Nacimiento', 'Yumbel', 'Talcahuano', 'Hualpén', 'Tomé', 'Penco', 'Chiguayante',
  'San Pedro de la Paz', 'Laja', 'Cabrero', 'Bulnes', 'Quirihue', 'Coelemu', 'Yungay',
]

const SUCURSALES_SINIESTROS = SUCURSAL_NOMBRES.map((nombre, index) => ({
  id: `sucursal-${index}`,
  label: `Sucursal ${nombre}`,
  value: Math.max(3, Math.round(190 - index * 1.35 - (index % 5) * 0.7)),
})).sort((a, b) => b.value - a.value)

const SUCURSALES_TOP = SUCURSALES_SINIESTROS.slice(0, 7)
const SUCURSALES_TOP_MAX = Math.max(...SUCURSALES_TOP.map(item => item.value))
const SUCURSALES_TOTAL = SUCURSALES_SINIESTROS.length

const SUCURSAL_COMPARE_COLORS = [
  '#4dd0e1', '#f9c74f', '#f72585', '#81d877', '#f8961e', '#4361ee',
  '#9b5de5', '#e63946', '#06d6a0', '#118ab2', '#c45c3e', '#00b2a9',
  '#7b2cbf', '#fb8500', '#2a9d8f', '#e9c46a', '#264653', '#e76f51',
  '#8ecae6', '#219ebc',
]

const SUCURSALES_COMPARE = SUCURSALES_SINIESTROS.slice(0, 20).map((item, index) => ({
  id: item.id,
  label: item.label,
  color: SUCURSAL_COMPARE_COLORS[index % SUCURSAL_COMPARE_COLORS.length],
  base: item.value,
}))

const SUCURSALES_FILTER = SUCURSALES_COMPARE.map(({ id, label }) => ({ id, label }))
const DEFAULT_SUCURSALES_FILTER = SUCURSALES_FILTER.map(item => item.id)

function buildSucursalMonthSeries(base, scale = 1) {
  return TIMELINE_LABELS.map((_, index) => {
    const month = index % 12
    const yearBoost = 1 + Math.floor(index / 12) * 0.04
    const season = 0.75 + (month / 11) * 0.55
    const wave = 1 + Math.sin((index / 54) * Math.PI * 2) * 0.12
    const noise = ((index * 13 + Math.round(base)) % 7) * 0.35
    const value = (base / 14) * scale * season * yearBoost * wave + noise
    return Math.max(0, Math.round(value))
  })
}

const SUCURSAL_TOTAL_TIMELINE = buildSucursalMonthSeries(420, 1)

const SUCURSAL_SINIESTROS_TIMELINE = Object.fromEntries(
  SUCURSALES_COMPARE.map(item => [item.id, buildSucursalMonthSeries(item.base, 1)]),
)

function buildSucursalCompareChartData(range, selectedSucursales, { totalTimeline, sucursalTimeline, totalLabel, hidden = [] }) {
  const [start, end] = RANGE_SLICES[range] || RANGE_SLICES['2026']
  const labels = TIMELINE_LABELS.slice(start, end)
  return {
    labels,
    datasets: [
      {
        label: totalLabel,
        data: totalTimeline.slice(start, end),
        borderColor: '#27933e',
        backgroundColor: 'rgba(39,147,62,0.10)',
        borderWidth: 2.5,
        pointBackgroundColor: '#27933e',
        pointRadius: 3,
        tension: 0.4,
        fill: true,
        hidden: hidden.includes('total'),
      },
      ...SUCURSALES_COMPARE
        .filter(s => selectedSucursales.includes(s.id))
        .map(s => ({
          label: s.label,
          data: sucursalTimeline[s.id].slice(start, end),
          borderColor: s.color,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointBackgroundColor: s.color,
          pointRadius: 2,
          tension: 0.4,
          fill: false,
          hidden: hidden.includes(s.id),
        })),
    ],
  }
}

function getSucursalCompareLegendItems(totalLabel, selectedSucursales) {
  return [
    { id: 'total', label: totalLabel, color: '#27933e' },
    ...SUCURSALES_COMPARE
      .filter(s => selectedSucursales.includes(s.id))
      .map(s => ({ id: s.id, label: s.label, color: s.color })),
  ]
}

function buildSiniestroTimelineData(range, selectedSectors, hidden = [], selectedEmpresas = null) {
  return buildTimelineChartData(range, selectedSectors, {
    empresaTimeline: EMPRESA_SIN_TIMELINE,
    sectorTimeline: SECTOR_SIN_TIMELINE,
    empresaLabel: 'Empresa',
    hidden,
    selectedEmpresas,
    empresasGrupo: EMPRESAS_GRUPO,
    empresaGrupoTimelines: EMPRESA_GRUPO_SIN_TIMELINE,
  })
}

function getGrupoTimelineLegendItems(selectedEmpresas, selectedSectors) {
  return [
    ...EMPRESAS_GRUPO
      .filter(empresa => selectedEmpresas.includes(empresa.id))
      .map(empresa => ({
        id: empresa.id,
        label: empresa.isPrimary ? `${empresa.label} (Mi empresa)` : empresa.label,
        color: empresa.color,
      })),
    ...SECTORES
      .filter(s => selectedSectors.includes(s.id))
      .map(s => ({ id: s.id, label: s.label, color: s.color })),
  ]
}

function getTimelineLegendItems(empresaLabel, selectedSectors) {
  return [
    { id: 'empresa', label: empresaLabel, color: '#27933e' },
    ...SECTORES
      .filter(s => selectedSectors.includes(s.id))
      .map(s => ({ id: s.id, label: s.label, color: s.color })),
  ]
}

function toggleSeriesHidden(setter, id) {
  setter(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
}

const diasPerdidosData = {
  labels: MESES,
  datasets: [
    {
      label: 'Trabajo',
      data: [61, 45, 66, 150, 101, 62, 111, 0, null, null, null, null],
      backgroundColor: '#27933e',
      borderRadius: 0,
      borderSkipped: false,
    },
    {
      label: 'Enfermedad Profesional',
      data: [16, 14, 22, 29, 20, 25, 32, 0, null, null, null, null],
      backgroundColor: '#4dd0e1',
      borderRadius: 0,
      borderSkipped: false,
    },
    {
      label: 'Cargo por fatales',
      data: [null, null, null, null, null, null, null, null, null, null, null, null],
      backgroundColor: '#f48fb1',
      borderRadius: 0,
      borderSkipped: false,
    },
  ],
}

const DIAS_PERDIDOS_LEGEND = [
  { id: 'trabajo', label: 'Trabajo', color: '#27933e' },
  { id: 'ep', label: 'Enfermedad Profesional', color: '#4dd0e1' },
  { id: 'fatales', label: 'Cargo por fatales', color: '#f48fb1' },
]

const DIAS_PERDIDOS_TABLE = {
  incapacidad: [77, 59, 88, 179, 121, 87, 143, 0, null, null, null, null],
  perdidos: [77, 59, 88, 179, 121, 87, 143, 0, null, null, null, null],
  trabajadores: [7063, 7093, 7126, 7137, 7117, 7127, null, null, null, null, null, null],
}

const DIAS_PERDIDOS_SABER_MAS = (
  <>
    <p>Todos los valores presentados son mensuales.</p>
    <p>
      El <strong>total de días por incapacidad temporal</strong> = días perdidos de accidentes de trabajo + días
      perdidos por enfermedades profesionales.
    </p>
    <p>
      El <strong>total de días perdidos</strong> = días perdidos de accidentes de trabajo + días perdidos por
      enfermedades profesionales + cargos por fatales.
    </p>
    <p>
      La <strong>masa de trabajadores</strong> puede tener un <strong>desfase de hasta 2 meses</strong>, debido al
      tiempo que toma el <strong>registro del pago de cotizaciones.</strong>
    </p>
  </>
)

const diasPerdidosMasaData = {
  labels: MESES,
  datasets: [
    {
      type: 'bar',
      label: 'Días perdidos',
      data: [3000, 2800, 2600, 2400, 3200, 3100, 2900, 2700, 2500, 2300, 2100, 1900],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      yAxisID: 'y',
    },
    {
      type: 'line',
      label: 'N° de trabajadores',
      data: [1400, 1380, 1360, 1340, 1420, 1410, 1390, 1370, 1350, 1330, 1310, 1290],
      borderColor: '#27933e',
      backgroundColor: 'rgba(39,147,62,0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#27933e',
      pointRadius: 3,
      tension: 0.3,
      yAxisID: 'y1',
    },
  ],
}

const TIPO_LEGEND = [
  { id: 'ctp', label: 'Con tiempo perdido (CTP)', color: '#27933e' },
  { id: 'stp', label: 'Sin tiempo perdido (STP)', color: '#4dd0e1' },
]

const SEXO_LEGEND = [
  { id: 'fem', label: 'Femenino', color: '#27933e' },
  { id: 'masc', label: 'Masculino', color: '#4dd0e1' },
  { id: 'ni', label: 'No informado', color: '#f48fb1' },
]

/** Barras rectas estilo Capacitaciones */
const squareBarStyle = {
  borderRadius: 0,
  borderSkipped: false,
  barPercentage: 1,
  categoryPercentage: 0.38,
  skipNull: true,
}

/* Datos del mock de diseño (fecha de presentación) */
const siniestrosTipoData = {
  labels: ['Enfermedad Profesional'],
  datasets: [
    {
      label: 'Con tiempo perdido (CTP)',
      data: [1],
      backgroundColor: '#27933e',
      ...squareBarStyle,
    },
    {
      label: 'Sin tiempo perdido (STP)',
      data: [null],
      backgroundColor: '#4dd0e1',
      ...squareBarStyle,
    },
  ],
}

const siniestrosSexoData = {
  labels: ['Femenino', 'Masculino', 'No informado'],
  datasets: [{
    data: [1, 0, 0],
    backgroundColor: ['#27933e', '#4dd0e1', '#f48fb1'],
    borderWidth: 0,
  }],
}

const FECHA_BAR_COLOR = '#81d877'

const PARTES_CUERPO_ITEMS = [
  { label: 'Otras partes del cuerpo lesionadas', value: 1 },
]

const RAZON_SOCIAL_ITEMS = [
  { label: 'Asociación Chilena De Seguridad', value: 1 },
]

const DIAS_SEMANA_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vier', 'Sáb', 'Dom']

const diasSemanaData = {
  labels: DIAS_SEMANA_LABELS,
  datasets: [
    {
      label: 'Siniestros',
      data: [0, 0, 0, 0, 0, 1, 0],
      backgroundColor: '#4dd0e1',
      borderRadius: 0,
      borderSkipped: false,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    },
  ],
}

const MECANISMO_ITEMS = [
  { label: 'No informado', value: 1 },
]

const FECHA_MES_KPI_EMPRESA = [
  { value: '2', label: 'Accidentes de trabajo CTP' },
  { value: '7', label: 'Accidentes de trayecto CTP' },
  { value: '2', label: 'Enfermedades profesionales CTP' },
]

const FECHA_MES_KPI_GRUPO = [
  {
    value: '1',
    label: 'Siniestros totales',
    info: 'Total de siniestros presentados en el mes seleccionado.',
  },
  {
    value: '1',
    label: 'Siniestros ley',
    info: 'Siniestros cubiertos por la ley de accidentes del trabajo y enfermedades profesionales.',
  },
  { value: '0', label: 'Siniestros no ley' },
  {
    value: '0',
    label: 'Accidentes de trabajo ley CTP y STP',
    info: 'Accidentes de trabajo con y sin tiempo perdido cubiertos por la ley.',
  },
  {
    value: '0',
    label: 'Accidentes de trayecto ley CTP y STP',
    info: 'Accidentes de trayecto con y sin tiempo perdido cubiertos por la ley.',
  },
  {
    value: '1',
    label: 'Enfermedades profesionales ley CTP y STP',
    info: 'Enfermedades profesionales con y sin tiempo perdido cubiertas por la ley.',
  },
  { value: '0', label: 'Accidentes de trabajo CTP' },
  { value: '0', label: 'Accidentes de trayecto CTP' },
  { value: '1', label: 'Enfermedades profesionales CTP' },
]

/* ─── Chart option helpers ──────────────────────── */
const lineOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      ...chartTooltip(12, FONT_ARIAL),
      callbacks: {
        title: items => (items[0]?.label ? formatTimelineTooltipLabel(items[0].label) : ''),
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: chartFont(11, 'normal', FONT_ARIAL) } },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: { font: chartFont(11, 'normal', FONT_ARIAL), callback: v => v + '%' },
    },
  },
})

const lineOptsCount = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      ...chartTooltip(12, FONT_ARIAL),
      callbacks: {
        title: items => (items[0]?.label ? formatTimelineTooltipLabel(items[0].label) : ''),
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: chartFont(11, 'normal', FONT_ARIAL) } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: {
        font: chartFont(11, 'normal', FONT_ARIAL),
        callback: v => Number(v).toLocaleString('es-CL'),
      },
    },
  },
})

const barOpts = (stacked = false, { legend = true } = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: stacked ? { padding: { top: 22 } } : undefined,
  plugins: {
    legend: legend
      ? { position: 'top', labels: { font: chartFont(12), padding: 12 } }
      : { display: false },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
    barValueLabels: false,
    stackTotalLabels: false,
    pieValueLabels: false,
  },
  scales: {
    x: {
      stacked,
      grid: { display: false },
      ticks: { font: chartFont(11), color: '#4e4e4e' },
      border: { display: true, color: '#c1c1c1' },
    },
    y: {
      stacked,
      beginAtZero: true,
      grid: { color: '#c1c1c1', drawTicks: false, lineWidth: 1 },
      ticks: { font: chartFont(11), color: '#4e4e4e' },
      border: { display: false },
    },
  },
  datasets: {
    bar: {
      borderRadius: 0,
    },
  },
})

const DIAS_PERDIDOS_LABEL_COL_RATIO = 1.35 / (1.35 + 12)
const DIAS_PERDIDOS_CHART_PAD = { top: 18, left: 4, right: 8, bottom: 0 }

/** Desplaza el área de barras para alinearla con las columnas de mes de la tabla. */
const diasPerdidosAlignPlugin = {
  id: 'diasPerdidosAlign',
  beforeUpdate(chart) {
    if (!chart.scales.y) return
    const labelColWidth = chart.width * DIAS_PERDIDOS_LABEL_COL_RATIO
    const yAxisWidth = chart.scales.y.width
    const extraLeft = Math.max(0, Math.round(labelColWidth - yAxisWidth - DIAS_PERDIDOS_CHART_PAD.left))
    chart.options.layout.padding = {
      top: DIAS_PERDIDOS_CHART_PAD.top,
      left: DIAS_PERDIDOS_CHART_PAD.left + extraLeft,
      right: DIAS_PERDIDOS_CHART_PAD.right,
      bottom: DIAS_PERDIDOS_CHART_PAD.bottom,
    }
  },
}

const diasPerdidosBarOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { ...DIAS_PERDIDOS_CHART_PAD } },
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
    barValueLabels: false,
    stackTotalLabels: true,
    pieValueLabels: false,
  },
  scales: {
    x: {
      stacked: true,
      offset: false,
      grid: { display: false },
      ticks: {
        font: chartFont(11, 'bold'),
        color: '#373737',
        padding: 6,
        maxRotation: 0,
        autoSkip: false,
      },
      border: { display: true, color: '#c1c1c1' },
    },
    y: {
      stacked: true,
      min: 0,
      max: 216,
      grid: { color: '#c1c1c1', drawTicks: false, lineWidth: 1 },
      ticks: {
        stepSize: 36,
        font: chartFont(11),
        color: '#9a9a9a',
        padding: 8,
      },
      border: { display: false },
    },
  },
  datasets: {
    bar: {
      borderRadius: 0,
      barPercentage: 0.88,
      categoryPercentage: 0.78,
    },
  },
})

const barValueLabelsPlugin = {
  id: 'barValueLabels',
  afterDatasetsDraw(chart) {
    if (chart.options.plugins?.barValueLabels !== true) return
    const { ctx } = chart
    const horizontal = chart.options.indexAxis === 'y'
    ctx.save()
    ctx.font = '600 12px ACHS Nueva Sans, Arial, sans-serif'
    ctx.fillStyle = '#6b6b6b'
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      if (meta.hidden) return
      meta.data.forEach((element, index) => {
        const raw = dataset.data[index]
        if (raw == null) return
        const value = typeof raw === 'number' ? raw : Number(raw?.x ?? raw?.y)
        if (!Number.isFinite(value)) return
        const { x, y } = element.getProps(['x', 'y'], true)
        if (horizontal) {
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(value), x + 8, y)
        } else {
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(String(value), x, y - 6)
        }
      })
    })
    ctx.restore()
  },
}

/** Un solo total gris encima de cada barra apilada. */
const stackTotalLabelsPlugin = {
  id: 'stackTotalLabels',
  afterDatasetsDraw(chart) {
    if (chart.options.plugins?.stackTotalLabels !== true) return
    const { ctx } = chart
    const totals = []
    const tops = []
    const hasAny = []

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      if (meta.hidden) return
      meta.data.forEach((element, index) => {
        const raw = dataset.data[index]
        if (raw == null) return
        const value = typeof raw === 'number' ? raw : Number(raw?.x ?? raw?.y)
        if (!Number.isFinite(value)) return
        hasAny[index] = true
        totals[index] = (totals[index] || 0) + value
        const { x, y } = element.getProps(['x', 'y'], true)
        if (!tops[index] || y < tops[index].y) tops[index] = { x, y }
      })
    })

    ctx.save()
    ctx.font = '400 12px ACHS Nueva Sans, Arial, sans-serif'
    ctx.fillStyle = '#6b6b6b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    tops.forEach((pos, index) => {
      if (!pos || !hasAny[index]) return
      ctx.fillText(String(totals[index] ?? 0), pos.x, pos.y - 8)
    })
    ctx.restore()
  },
}

const pieValueLabelsPlugin = {
  id: 'pieValueLabels',
  afterDatasetsDraw(chart) {
    const type = chart.config.type
    if (type !== 'pie' && type !== 'doughnut') return
    if (chart.options.plugins?.pieValueLabels !== true) return
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      if (meta.hidden) return
      meta.data.forEach((arc, index) => {
        const value = Number(dataset.data[index]) || 0
        if (!value) return
        const { x, y } = arc.tooltipPosition()
        const total = dataset.data.reduce((sum, item) => sum + (Number(item) || 0), 0)
        const pct = total ? value / total : 0
        ctx.save()
        ctx.fillStyle = pct < 0.08 ? '#4e4e4e' : '#ffffff'
        ctx.font = '600 13px ACHS Nueva Sans, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(value), x, y)
        ctx.restore()
      })
    })
  },
}

ChartJS.register(barValueLabelsPlugin, stackTotalLabelsPlugin, pieValueLabelsPlugin)

/** Barras agrupadas estilo Capacitaciones (rectas, grandes, con valores). */
const tipoBarOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 22, right: 12, bottom: 4, left: 4 } },
  datasets: {
    bar: {
      barPercentage: 1,
      categoryPercentage: 0.38,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
    barValueLabels: true,
  },
  scales: {
    x: {
      stacked: false,
      grid: { display: false, drawBorder: false },
      ticks: {
        font: chartFont(11),
        color: '#4e4e4e',
        padding: 6,
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false,
      },
      border: { display: true, color: '#c1c1c1' },
    },
    y: {
      min: 0,
      max: 2,
      border: { display: false },
      grid: {
        color: '#c1c1c1',
        drawTicks: false,
        lineWidth: 1,
      },
      ticks: {
        stepSize: 1,
        font: chartFont(11),
        color: '#4e4e4e',
        padding: 8,
      },
    },
  },
})

const fechaVBarOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 22, right: 8, bottom: 4, left: 4 } },
  datasets: {
    bar: {
      borderRadius: 0,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
    barValueLabels: true,
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: chartFont(11), color: '#4e4e4e' },
      border: { display: true, color: '#c1c1c1' },
    },
    y: {
      min: 0,
      max: 2,
      grid: {
        color: '#c1c1c1',
        drawTicks: false,
        lineWidth: 1,
      },
      ticks: {
        stepSize: 1,
        font: chartFont(11),
        color: '#4e4e4e',
      },
      border: { display: false },
    },
  },
})

const pieOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: 8 },
  plugins: {
    legend: { display: false },
    tooltip: chartTooltip(12),
    pieValueLabels: true,
  },
})

const dualAxisOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { font: chartFont(12), padding: 12 } },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: chartFont(11) } },
    y: {
      type: 'linear', position: 'left',
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: chartFont(11) },
    },
    y1: {
      type: 'linear', position: 'right',
      grid: { drawOnChartArea: false },
      ticks: { font: chartFont(11) },
    },
  },
})

/* ─── Shared UI pieces ───────────────────────────── */
function CheckCircle({ color, selected }) {
  return (
    <span
      className={`${styles.checkCircle} ${selected ? styles.checkCircleOn : styles.checkCircleOff}`}
      style={{ '--circle-color': color }}
      aria-hidden="true"
    >
      {selected && (
        <svg className={styles.checkIcon} viewBox="0 0 10 10">
          <path
            d="M2 5.2 L4.4 7.6 L8 3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

function ChartSeriesLegend({ items, hidden = [], onToggle }) {
  const interactive = typeof onToggle === 'function'
  return (
    <div className={styles.chartSeriesLegend} role={interactive ? undefined : 'list'}>
      {items.map(item => {
        const active = !hidden.includes(item.id)
        if (!interactive) {
          return (
            <div key={item.id} className={styles.legendItem} role="listitem">
              <CheckCircle color={item.color} selected />
              <span>{item.label}</span>
            </div>
          )
        }
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.legendItem} ${active ? '' : styles.legendItemOff}`}
            onClick={() => onToggle(item.id)}
          >
            <CheckCircle color={item.color} selected={active} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function ChartCard({ title, children, footnote, fullWidth = false, onRemove, titleClassName, className }) {
  return (
    <Card
      elevation="sm"
      className={cn(styles.chartCard, fullWidth && styles.fullWidth, className)}
    >
      <CardHeader className={`${styles.chartCardHeader} ${onRemove ? styles.chartCardHeaderRemovable : ''}`}>
        {onRemove && (
          <button
            type="button"
            className={styles.removeChartBtn}
            onClick={onRemove}
            aria-label="Quitar gráfico del panel"
            title="Quitar del panel"
          >
            <X className={styles.removeChartIcon} aria-hidden="true" />
            <span>Quitar</span>
          </button>
        )}
        <CardTitle className={cn(styles.chartTitle, titleClassName)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.chartCardBody}>
        {children}
        {footnote && <p className={styles.footnote}>{footnote}</p>}
      </CardContent>
    </Card>
  )
}

/** Barras horizontales cuadradas (mismo patrón visual que Capacitaciones / cursos). */
function FechaHBarList({ items, color = FECHA_BAR_COLOR }) {
  const maxValue = Math.max(...items.map(item => item.value), 1)
  return (
    <ul className={styles.fechaHList}>
      {items.map(item => {
        const widthPct = Math.max((item.value / maxValue) * 100, 8)
        return (
          <li key={item.label} className={styles.fechaHItem}>
            <div className={styles.fechaHLabel}>{item.label}</div>
            <div className={styles.fechaHBarRow}>
              <div className={styles.fechaHBarGroup} style={{ width: `${widthPct}%` }}>
                <div className={styles.fechaHBarFill} style={{ backgroundColor: color }} />
                <span className={styles.fechaHValue}>{item.value}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function SucursalesListModal({ open, onOpenChange }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const panelRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SUCURSALES_SINIESTROS
    return SUCURSALES_SINIESTROS.filter(item => item.label.toLowerCase().includes(q))
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / SUCURSALES_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * SUCURSALES_PAGE_SIZE
  const pageItems = filtered.slice(start, start + SUCURSALES_PAGE_SIZE)

  const handleClose = () => {
    setQuery('')
    setPage(1)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = event => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className={styles.sucursalModalRoot} role="presentation">
      <button
        type="button"
        className={styles.sucursalModalBackdrop}
        aria-label="Cerrar listado de sucursales"
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className={styles.sucursalModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sucursales-modal-title"
        tabIndex={-1}
      >
        <div className={styles.sucursalModalHeader}>
          <h2 id="sucursales-modal-title" className={styles.sucursalModalTitle}>
            Listado completo de sucursales
          </h2>
          <button
            type="button"
            className={styles.sucursalModalClose}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={styles.sucursalModalBody}>
          <div className={styles.sucursalModalSearch}>
            <Search className={styles.sucursalModalSearchIcon} aria-hidden="true" />
            <Input
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar sucursal..."
              className={styles.sucursalModalSearchInput}
              aria-label="Buscar sucursal"
            />
          </div>

          <div className={styles.sucursalModalList}>
            <div className={styles.sucursalModalListHead}>
              <span>Sucursal</span>
              <span>
                <span className={styles.sucursalModalCountHeadFull}>Cantidad de siniestros</span>
                <span className={styles.sucursalModalCountHeadShort}>Siniestros</span>
              </span>
            </div>
            <ul className={styles.sucursalModalListBody}>
              {pageItems.length === 0 ? (
                <li className={styles.sucursalModalEmpty}>No se encontraron sucursales</li>
              ) : (
                pageItems.map(item => (
                  <li key={item.label} className={styles.sucursalModalRow}>
                    <span className={styles.sucursalModalRowLabel}>{item.label}</span>
                    <span className={styles.sucursalModalRowValue}>{item.value}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className={styles.sucursalModalFooter}>
            <p className={styles.sucursalModalMeta}>
              Página {currentPage} de {totalPages} • Mostrando {pageItems.length} de {filtered.length} sucursales
            </p>
            <div className={styles.sucursalModalPager}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(outlineBtnClass, styles.sucursalModalPagerBtn)}
                disabled={currentPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(outlineBtnClass, styles.sucursalModalPagerBtn)}
                disabled={currentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SiniestrosPorSucursalCard({ selectedSucursales = DEFAULT_SUCURSALES_FILTER }) {
  const [modalOpen, setModalOpen] = useState(false)

  const rankedItems = useMemo(() => {
    const selectedSet = new Set(selectedSucursales)
    const filtered = SUCURSALES_SINIESTROS.filter(item => selectedSet.has(item.id))
    return filtered.slice(0, 7)
  }, [selectedSucursales])

  const maxValue = Math.max(...rankedItems.map(item => item.value), 1)
  const totalCount = selectedSucursales.length || SUCURSALES_TOTAL

  return (
    <>
      <div className={styles.rankCard}>
        <h3 className={styles.rankTitle}>Cantidad de siniestros por sucursal</h3>
        <ul className={styles.rankList}>
          {rankedItems.length === 0 ? (
            <li className={styles.rankEmpty}>Selecciona al menos una sucursal</li>
          ) : (
            rankedItems.map((item, index) => {
              const widthPct = Math.max((item.value / maxValue) * 100, 2)
              const color = index % 2 === 0 ? COLOR_RANK_A : COLOR_RANK_B
              return (
                <li key={item.label} className={styles.rankItem}>
                  <div className={styles.rankLabel}>{item.label}</div>
                  <div className={styles.rankBarRow}>
                    <div className={styles.rankBarGroup} style={{ width: `${widthPct}%` }}>
                      <div className={styles.rankBarFill} style={{ backgroundColor: color }} />
                      <span className={styles.rankValue}>{item.value}</span>
                    </div>
                  </div>
                </li>
              )
            })
          )}
        </ul>
        <div className={styles.rankFooter}>
          <Button
            type="button"
            variant="outline"
            size="md"
            className={cn(downloadOutlineBtnClass, styles.rankBtn)}
            onClick={() => setModalOpen(true)}
          >
            Ver todas las sucursales ({totalCount})
          </Button>
        </div>
      </div>
      <SucursalesListModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

function SectorFilter({ selected, onChange, hideLabel = false, compact = false }) {
  const [open, setOpen] = useState(false)
  const allSelected = SECTORES.every(s => selected.includes(s.id))
  const countLabel = `${selected.length} Sector (es)`

  function toggleAll(checked) {
    onChange(checked ? SECTORES.map(s => s.id) : [])
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className={cn(styles.sectorFilterWrap, compact && styles.sectorFilterWrapCompact)}>
      {!hideLabel && (
        <Label className={styles.sectorFilterLabel}>Selecciona sector</Label>
      )}
      <button
        type="button"
        className={styles.sectorFilterTrigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.sectorFilterTriggerText}>{countLabel}</span>
        <Filter className={styles.sectorFilterIcon} aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className={styles.sectorDropdownBackdrop} onClick={() => setOpen(false)} />
          <div className={styles.sectorDropdown}>
            <label className={styles.sectorOption}>
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span>Seleccionar todos</span>
            </label>
            {SECTORES.map(s => (
              <label key={s.id} className={styles.sectorOption}>
                <Checkbox
                  checked={selected.includes(s.id)}
                  onCheckedChange={() => toggle(s.id)}
                  style={{ '--circle-color': s.color }}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function GrupoTasaChartFilters({ empresas, onEmpresasChange, sectores, onSectoresChange, onReset }) {
  return (
    <div className={styles.grupoChartFilters}>
      <div className={styles.grupoChartFiltersRow}>
        <EmpresaGrupoFilter selected={empresas} onChange={onEmpresasChange} />
        <SectorFilter selected={sectores} onChange={onSectoresChange} hideLabel compact />
      </div>
      <button type="button" className={styles.grupoResetFilters} onClick={onReset}>
        Reestablecer filtros
      </button>
    </div>
  )
}

function SucursalFilter({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const allSelected = SUCURSALES_COMPARE.every(s => selected.includes(s.id))
  const countLabel = `${selected.length} Sucursal(es)`

  function toggleAll(checked) {
    onChange(checked ? SUCURSALES_COMPARE.map(s => s.id) : [])
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className={styles.sectorFilterWrap}>
      <Label className={styles.sectorFilterLabel}>Selecciona sucursal</Label>
      <button
        type="button"
        className={styles.sectorFilterTrigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.sectorFilterTriggerText}>{countLabel}</span>
        <Filter className={styles.sectorFilterIcon} aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className={styles.sectorDropdownBackdrop} onClick={() => setOpen(false)} />
          <div className={styles.sectorDropdown}>
            <label className={styles.sectorOption}>
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span>Seleccionar todas</span>
            </label>
            {SUCURSALES_COMPARE.map(s => (
              <label key={s.id} className={styles.sectorOption}>
                <Checkbox
                  checked={selected.includes(s.id)}
                  onCheckedChange={() => toggle(s.id)}
                  style={{ '--circle-color': s.color }}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SucursalCompareChart({
  title,
  totalLabel,
  totalTimeline,
  sucursalTimeline,
  footnote,
}) {
  const [range, setRange] = useState('2026')
  const [selected, setSelected] = useState([])
  const [hidden, setHidden] = useState([])

  return (
    <ChartCard title={title} titleClassName={styles.timelineChartTitle} fullWidth>
      <div className={styles.chartControls}>
        <RangeTabs options={RANGE_OPTIONS} active={range} onChange={setRange} />
      </div>
      <div className={styles.chartControls}>
        <SucursalFilter selected={selected} onChange={setSelected} />
      </div>
      <div className={styles.chartAreaTall}>
        <Line
          data={buildSucursalCompareChartData(range, selected, {
            totalTimeline,
            sucursalTimeline,
            totalLabel,
            hidden,
          })}
          options={lineOptsCount()}
        />
      </div>
      <ChartSeriesLegend
        items={getSucursalCompareLegendItems(totalLabel, selected)}
        hidden={hidden}
        onToggle={id => toggleSeriesHidden(setHidden, id)}
      />
      <div className={styles.downloadRow}>
        <Button type="button" variant="outline" size="md" className={cn(downloadOutlineBtnClass, 'gap-2')}>
          Descargar Excel de siniestros por sucursal
          <FileDown className="h-4 w-4" />
        </Button>
      </div>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </ChartCard>
  )
}

function FechaGrupoChartsBlock({ mesSelected }) {
  return (
    <div className={styles.fechaChartsGroup}>
      <KpiGrid
        title={`Indicadores de ${mesSelected}`}
        items={FECHA_MES_KPI_GRUPO}
      />

      <div className={`${styles.fechaChartsRow} ${styles.fechaChartsRowEqual}`}>
        <ChartCard title={`Siniestros por razón social ${mesSelected}`}>
          <FechaHBarList items={RAZON_SOCIAL_ITEMS} />
        </ChartCard>
        <ChartCard title={`Siniestros por sexo biológico ${mesSelected}`}>
          <ChartSeriesLegend items={SEXO_LEGEND} />
          <div className={styles.fechaPieArea}>
            <Pie data={siniestrosSexoData} options={pieOpts()} />
          </div>
        </ChartCard>
      </div>

      <div className={`${styles.fechaChartsRow} ${styles.fechaChartsRowEqual}`}>
        <ChartCard title={`Siniestros por tipo ${mesSelected}`}>
          <ChartSeriesLegend items={TIPO_LEGEND} />
          <div className={styles.fechaTipoArea}>
            <Bar data={siniestrosTipoData} options={tipoBarOpts()} />
          </div>
        </ChartCard>
        <ChartCard title={`Siniestros por día de presentación semanal ${mesSelected}`}>
          <div className={styles.fechaDiaArea}>
            <Bar data={diasSemanaData} options={fechaVBarOpts()} />
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title={`Siniestros por parte del cuerpo afectada ${mesSelected}`}
        fullWidth
        className={styles.mecanismoCard}
      >
        <FechaHBarList items={PARTES_CUERPO_ITEMS} />
      </ChartCard>

      <ChartCard
        title={`Siniestros por mecanismo del accidente ${mesSelected}`}
        footnote="*La clasificación del mecanismo tiene un desfase de 2 días desde la fecha de presentación."
        fullWidth
        className={styles.mecanismoCard}
      >
        <FechaHBarList items={MECANISMO_ITEMS} />
      </ChartCard>
    </div>
  )
}

function FechaPresentacionGrupoSection({
  mesSelected,
  onMesChange,
}) {
  return (
    <section className={styles.fechaSection} aria-labelledby="sucursal-fecha-title">
      <h2 id="sucursal-fecha-title" className={styles.fechaTitle}>
        Indicadores por fecha de presentación
      </h2>
      <div className={styles.fechaPanel}>
        <div className={styles.fechaPanelGrupoFilters}>
          <MonthYearFilter
            value={mesSelected}
            onChange={onMesChange}
            variant="grupo"
            hideProcessingNote
          />
          <p className={styles.fechaGrupoProcessingNote}>
            *Los resultados del mes actual aún se están procesando. Como se actualizan día a día, podrías notar algunos cambios.
          </p>
        </div>
      </div>
      <FechaGrupoChartsBlock mesSelected={mesSelected} />
    </section>
  )
}

function RangeTabs({ options, active, onChange }) {
  return (
    <div className={styles.rangeTabs} role="tablist" aria-label="Rango de años">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`${styles.rangeTab} ${active === id ? styles.rangeTabActive : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

const MESES_NOMBRE = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function buildMesesDisponibles(reference = new Date(2026, 7, 1), count = 13) {
  const items = []
  for (let i = 0; i < count; i += 1) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - i, 1)
    items.push(`${MESES_NOMBRE[date.getMonth()]} ${date.getFullYear()}`)
  }
  return items
}

const MESES_DISPONIBLES = buildMesesDisponibles()

function MonthYearFilter({ value, onChange, variant = 'default', hideProcessingNote = false }) {
  const [open, setOpen] = useState(false)
  const isGrupo = variant === 'grupo'

  return (
    <div className={styles.fechaFilterGroup}>
      <div className={styles.fechaLabelRow}>
        <Label className={styles.fechaLabel}>
          {isGrupo ? 'Selecciona mes/año' : 'Selecciona un mes/año'}
        </Label>
        {!isGrupo && !hideProcessingNote && (
          <p className={styles.fechaHint}>
            *La descarga considera los últimos 12 meses móviles desde el mes seleccionado.
          </p>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className={styles.fechaMonthControl}>
            <span className={styles.fechaMonthControlText}>{value}</span>
            <CalendarIcon className={styles.fechaMonthControlIcon} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.fechaMonthPopover} align="start">
          <ul className={styles.fechaMonthList}>
            {MESES_DISPONIBLES.map(mes => (
              <li key={mes}>
                <button
                  type="button"
                  className={`${styles.fechaMonthOption} ${mes === value ? styles.fechaMonthOptionActive : ''}`}
                  onClick={() => {
                    onChange(mes)
                    setOpen(false)
                  }}
                >
                  {mes}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      {!hideProcessingNote && (
        <p className={styles.processingNote}>
          *Los resultados del mes actual aún se están procesando. Como se actualizan día a día, podrías notar algunos
          cambios.
        </p>
      )}
    </div>
  )
}

function FechaEmpresaFilter({ selected, onChange, label = 'Selecciona empresa (s)' }) {
  const [open, setOpen] = useState(false)
  const enabledEmpresas = EMPRESAS_GRUPO.filter(empresa => !empresa.fechaDisabled)
  const allEnabledSelected = enabledEmpresas.every(empresa => selected.includes(empresa.id))
  const countLabel = `${selected.length} Empresa(s)`

  function toggleAll(checked) {
    onChange(checked ? enabledEmpresas.map(empresa => empresa.id) : [])
  }

  function toggle(id) {
    const empresa = EMPRESAS_GRUPO.find(item => item.id === id)
    if (empresa?.fechaDisabled) return
    onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  return (
    <div className={styles.fechaFilterGroup}>
      <Label className={styles.fechaLabel}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className={styles.fechaMonthControl}>
            <span className={styles.fechaMonthControlText}>{countLabel}</span>
            <ChevronDown className={styles.fechaEmpresaChevron} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.fechaEmpresaPopover} align="start">
          <ul className={styles.fechaEmpresaList}>
            <li>
              <label className={styles.fechaEmpresaOption}>
                <Checkbox checked={allEnabledSelected} onCheckedChange={toggleAll} />
                <span>Seleccionar todos</span>
              </label>
            </li>
            {EMPRESAS_GRUPO.map(empresa => (
              <li key={empresa.id}>
                <label
                  className={cn(
                    styles.fechaEmpresaOption,
                    empresa.fechaDisabled && styles.fechaEmpresaOptionDisabled,
                  )}
                >
                  <Checkbox
                    checked={selected.includes(empresa.id)}
                    disabled={empresa.fechaDisabled}
                    onCheckedChange={() => toggle(empresa.id)}
                  />
                  <span>{empresa.rut} - {empresa.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FechaEmpresaSingleFilter({ selectedId, onChange }) {
  const [open, setOpen] = useState(false)
  const selectedEmpresa = EMPRESAS_GRUPO.find(empresa => empresa.id === selectedId)
  const triggerLabel = selectedEmpresa
    ? selectedEmpresa.label
    : 'Selecciona'

  return (
    <div className={styles.fechaFilterGroup}>
      <Label className={styles.fechaLabel}>Selecciona una empresa</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className={styles.fechaMonthControl}>
            <span className={styles.fechaMonthControlText}>{triggerLabel}</span>
            <ChevronDown className={styles.fechaEmpresaChevron} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.fechaEmpresaPopover} align="start">
          <ul className={styles.fechaEmpresaList}>
            {EMPRESAS_GRUPO.map(empresa => (
              <li key={empresa.id}>
                <button
                  type="button"
                  className={cn(
                    styles.fechaMonthOption,
                    selectedId === empresa.id && styles.fechaMonthOptionActive,
                    empresa.fechaDisabled && styles.fechaEmpresaOptionDisabled,
                  )}
                  disabled={empresa.fechaDisabled}
                  onClick={() => {
                    if (empresa.fechaDisabled) return
                    onChange(empresa.id)
                    setOpen(false)
                  }}
                >
                  {empresa.rut} - {empresa.label}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function YearSelector({ years, active, onChange }) {
  return (
    <div className={styles.rangeTabs} role="tablist" aria-label="Año">
      {years.map(y => (
        <button
          key={y}
          type="button"
          role="tab"
          aria-selected={active === y}
          className={`${styles.rangeTab} ${active === y ? styles.rangeTabActive : ''}`}
          onClick={() => onChange(y)}
        >
          {y}
        </button>
      ))}
    </div>
  )
}

function isMutedKpiValue(value) {
  if (value == null) return true
  const text = String(value).trim().toLowerCase()
  return text === 'en cálculo' || text === 'en calculo' || text === 'sin datos' || text === '—' || text === '-'
}

function KpiGrid({ title, items, compact = false }) {
  return (
    <TooltipProvider>
      <Card
        elevation="sm"
        className={`${styles.chartCard} ${styles.kpiSection} ${compact ? styles.kpiSectionCompact : ''}`}
      >
        <CardHeader className={styles.kpiSectionHeader}>
          <CardTitle className={styles.kpiSectionTitle}>{title}</CardTitle>
        </CardHeader>
        <CardContent className={styles.kpiSectionBody}>
          <div className={styles.kpiGrid}>
            {items.map((item, i) => {
              const muted = item.muted ?? isMutedKpiValue(item.value)
              return (
                <div key={i} className={styles.kpiItem}>
                  <span className={`${styles.kpiValue} ${muted ? styles.kpiValueMuted : ''}`}>
                    {item.value}
                  </span>
                  <div className={styles.kpiLabelRow}>
                    <span className={styles.kpiLabel}>{item.label}</span>
                    {item.info && (
                      <UiTooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={styles.kpiInfoBtn}
                            aria-label={`Info: ${item.label}`}
                          >
                            <Info className={styles.kpiInfoIcon} strokeWidth={2.5} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className={styles.kpiInfoTooltip}>
                          {item.info}
                        </TooltipContent>
                      </UiTooltip>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

const EXCEL_REPORT_OPTIONS = [
  { id: 'trabajo', label: 'Accidentes de trabajo' },
  { id: 'enfermedades', label: 'Enfermedades profesionales' },
  { id: 'trayecto', label: 'Accidentes de trayecto' },
]

function ExcelReportsDownload() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const rootRef = useRef(null)

  const allSelected = EXCEL_REPORT_OPTIONS.every(o => selected.includes(o.id))
  const canDownload = selected.length > 0

  useEffect(() => {
    if (!open) return undefined
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggleAll(checked) {
    setSelected(checked ? EXCEL_REPORT_OPTIONS.map(o => o.id) : [])
  }

  function toggleOption(id) {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  return (
    <div className={`${styles.excelDownload} ${open ? styles.excelDownloadOpen : ''}`} ref={rootRef}>
      <div className={styles.excelDropdownAnchor}>
        <button
          type="button"
          className={styles.excelTrigger}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span>Descargar reportes en Excel</span>
          <ChevronDown
            className={`${styles.excelChevron} ${open ? styles.excelChevronOpen : ''}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className={styles.excelPanel} role="dialog" aria-label="Descargar reportes en Excel">
            <button
              type="button"
              className={styles.excelPanelHeader}
              onClick={() => setOpen(false)}
              aria-expanded="true"
            >
              <span>Descargar reportes en Excel</span>
              <ChevronDown className={`${styles.excelChevron} ${styles.excelChevronOpen}`} aria-hidden="true" />
            </button>

            <div className={styles.excelOptions}>
              <label className={styles.excelOption}>
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span>Descargar todos</span>
              </label>
              {EXCEL_REPORT_OPTIONS.map(option => (
                <label key={option.id} className={styles.excelOption}>
                  <Checkbox
                    checked={selected.includes(option.id)}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              className={styles.excelDownloadBtn}
              disabled={!canDownload}
              onClick={() => setOpen(false)}
            >
              Descargar
              <Download className={styles.excelDownloadBtnIcon} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className={styles.excelHint}>
        <p className={styles.excelHintTitle}>
          ¡Descarga las cifras de accidentes!
          <Info className={styles.excelHintIcon} aria-hidden="true" />
        </p>
        <p className={styles.excelHintSub}>mes a mes y de los últimos 12 meses</p>
      </div>
    </div>
  )
}

const OPTIONAL_CHARTS = [
  {
    id: 'dias-perdidos',
    label: 'Días perdidos mensuales',
    description: 'Accidentes de trabajo y enfermedad profesional.',
    Icon: ChartColumn,
  },
  {
    id: 'trabajadores',
    label: 'Días perdidos y masa laboral',
    description: 'Comparativo de los últimos 12 meses.',
    Icon: Users,
  },
  {
    id: 'siniestros',
    label: 'Ingresos siniestros totales',
    description: 'CTP y STP mensuales del año seleccionado.',
    Icon: BarChart3,
  },
]

const OPTIONAL_CHART_ORDER = ['dias-perdidos', 'trabajadores', 'siniestros']

/* ─── Page ───────────────────────────────────────── */
export default function AccidentesPage() {
  const location = useLocation()
  const showSucursalTab = !location.pathname.endsWith('/sin-sucursal')
  const [activeTab, setActiveTab] = useState('empresa')
  const [mesSelected, setMesSelected] = useState(MESES_DISPONIBLES[0])
  const [empresasFecha, setEmpresasFecha] = useState(DEFAULT_EMPRESAS_GRUPO)
  const [sucursalesFecha, setSucursalesFecha] = useState(DEFAULT_SUCURSALES_FILTER)
  const [sucursalesDiasPerdidos, setSucursalesDiasPerdidos] = useState(DEFAULT_SUCURSALES_FILTER)
  const [sucursalesTabFilter, setSucursalesTabFilter] = useState(DEFAULT_SUCURSALES_FILTER)
  const [empresaTabFilter, setEmpresaTabFilter] = useState(DEFAULT_EMPRESAS_GRUPO[0])
  const [mesSucursalFecha, setMesSucursalFecha] = useState(MESES_DISPONIBLES[0])
  const [addedCharts, setAddedCharts] = useState([])

  useEffect(() => {
    if (!showSucursalTab && activeTab === 'sucursal') {
      setActiveTab('empresa')
    }
  }, [showSucursalTab, activeTab])

  const years = [2023, 2024, 2025, 2026]
  const availableCharts = OPTIONAL_CHARTS.filter(c => !addedCharts.includes(c.id))

  function addChart(id) {
    setAddedCharts(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      return OPTIONAL_CHART_ORDER.filter(chartId => next.includes(chartId))
    })
  }

  function removeChart(id) {
    setAddedCharts(prev => prev.filter(x => x !== id))
  }

  // Independent state per chart
  const [yearDiasPerdidos, setYearDiasPerdidos] = useState(2026)

  // Tasa accidentabilidad: timeline continua
  const [rangeB, setRangeB] = useState('2026')
  const [sectoresTasaAccB, setSectoresTasaAccB] = useState([])
  const [empresasTasaAcc, setEmpresasTasaAcc] = useState(DEFAULT_EMPRESAS_GRUPO)
  const [hiddenTasaAcc, setHiddenTasaAcc] = useState([])

  // Tasa siniestralidad: timeline continua
  const [rangeSin, setRangeSin] = useState('2026')
  const [sectoresTasaSin, setSectoresTasaSin] = useState([])
  const [empresasTasaSin, setEmpresasTasaSin] = useState(DEFAULT_EMPRESAS_GRUPO)
  const [hiddenTasaSin, setHiddenTasaSin] = useState([])

  const isGrupoView = activeTab === 'grupo'
  const isSinSucursalEmpresaView = !showSucursalTab && activeTab === 'empresa'

  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Indicadores de Accidentes</h1>
          <p className={styles.pageSubtitle}>
            Revisa tus indicadores de accidentes, descarga reportes en Excel y otros informes personalizados en PDF con la información más relevante para tu empresa.
          </p>
        </div>
        {activeTab === 'empresa' && (
          <div className={styles.headerRight}>
            <ExcelReportsDownload />
          </div>
        )}
      </div>

      {/* ── Tabs empresa / grupo / sucursal ── */}
      <div className={styles.indicatorTabs} role="tablist" aria-label="Tipo de indicadores">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'empresa'}
          className={`${styles.indicatorTab} ${activeTab === 'empresa' ? styles.indicatorTabActive : ''}`}
          onClick={() => setActiveTab('empresa')}
        >
          <Building2 className={styles.indicatorTabIcon} aria-hidden="true" />
          Indicadores de la empresa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'grupo'}
          className={`${styles.indicatorTab} ${activeTab === 'grupo' ? styles.indicatorTabActive : ''}`}
          onClick={() => setActiveTab('grupo')}
        >
          <Building className={styles.indicatorTabIcon} aria-hidden="true" />
          Indicadores del grupo
        </button>
        {showSucursalTab && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sucursal'}
            className={`${styles.indicatorTab} ${activeTab === 'sucursal' ? styles.indicatorTabActive : ''}`}
            onClick={() => setActiveTab('sucursal')}
          >
            <MapPin className={styles.indicatorTabIcon} aria-hidden="true" />
            Indicadores por sucursal
          </button>
        )}
      </div>

      {activeTab === 'sucursal' ? (
        <div className={styles.sucursalSection} aria-label="Indicadores por sucursal">
          <div className={styles.fechaPanel}>
            <div className={styles.sucursalTopFilter}>
              <FechaEmpresaSingleFilter
                selectedId={empresaTabFilter}
                onChange={setEmpresaTabFilter}
              />
              <SucursalSearchFilter
                selected={sucursalesTabFilter}
                onChange={setSucursalesTabFilter}
                items={SUCURSALES_FILTER}
                variant="fecha"
                showLabel
                label="Selecciona sucursal (s)"
                showSelectAll
              />
              <button
                type="button"
                className={styles.sucursalTopReset}
                onClick={() => {
                  setEmpresaTabFilter(DEFAULT_EMPRESAS_GRUPO[0])
                  setSucursalesTabFilter(DEFAULT_SUCURSALES_FILTER)
                }}
              >
                Restablecer
              </button>
            </div>
          </div>

          <SiniestrosTotalesChart
            sucursales={SUCURSALES_FILTER}
            selectedSucursales={sucursalesTabFilter}
          />

          <FechaPresentacionGrupoSection
            mesSelected={mesSucursalFecha}
            onMesChange={setMesSucursalFecha}
          />
        </div>
      ) : (
        <>
      {/* ── Info alert ── */}
      <div className={styles.infoBanner} role="status">
        <span className={styles.infoBannerIcon} aria-hidden="true">
          <Info className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className={styles.infoBannerBody}>
          <p>Registros de accidentes al <strong>09-08-2026</strong>.</p>
          <p>
            Los registros se actualizan{' '}
            <strong>1 vez al día con el acumulado del mes hasta el día anterior, a partir de las 09:00 AM</strong>.
          </p>
          <p>
            La <strong>tasa de accidentabilidad Con Tiempo Perdido (CTP) tiene un desfase de 2 meses</strong>, ya que
            las cotizaciones se reflejan luego de ese período.
          </p>
        </div>
      </div>

      {availableCharts.length > 0 && (
        <section className={styles.chartPicker} aria-label="Agregar gráficos al panel">
          <div className={styles.chartPickerIntro}>
            <span className={styles.chartPickerBadge} aria-hidden="true">
              <Plus className="h-3.5 w-3.5" />
            </span>
            <div>
              <h2 className={styles.chartPickerTitle}>Agregar gráficos a tu panel</h2>
              <p className={styles.chartPickerSubtitle}>
                Los dos indicadores principales ya están fijos. Elige abajo los adicionales que quieras ver.
              </p>
            </div>
          </div>

          <ul className={styles.chartPickerGrid}>
            {availableCharts.map(({ id, label, description, Icon }) => (
              <li key={id} className={styles.chartPickerCard}>
                <div className={styles.chartPickerCardTop}>
                  <span className={styles.chartPickerCardIcon} aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className={styles.chartPickerCardText}>
                    <h3 className={styles.chartPickerCardTitle}>{label}</h3>
                    <p className={styles.chartPickerCardDesc}>{description}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className={cn(styles.chartPickerAddBtn, 'gap-1')}
                  onClick={() => addChart(id)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar al panel
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Gráficos fijos + custom ── */}
      <div className={styles.customCharts}>
        <div className={`${styles.twoCol} ${styles.twoColEqual}`}>
          <ChartCard
            title="Tasa de accidentabilidad Con Tiempo Perdido (CTP)*"
            titleClassName={styles.timelineChartTitle}
          >
            <div className={styles.chartControls}>
              <RangeTabs options={RANGE_OPTIONS} active={rangeB} onChange={setRangeB} />
            </div>
            {isGrupoView ? (
              <GrupoTasaChartFilters
                empresas={empresasTasaAcc}
                onEmpresasChange={setEmpresasTasaAcc}
                sectores={sectoresTasaAccB}
                onSectoresChange={setSectoresTasaAccB}
                onReset={() => {
                  setEmpresasTasaAcc(DEFAULT_EMPRESAS_GRUPO)
                  setSectoresTasaAccB([])
                  setHiddenTasaAcc([])
                }}
              />
            ) : (
              <div className={styles.chartControls}>
                <SectorFilter selected={sectoresTasaAccB} onChange={setSectoresTasaAccB} />
              </div>
            )}
            <div className={styles.chartAreaTall}>
              <Line
                data={buildTimelineData(
                  rangeB,
                  sectoresTasaAccB,
                  hiddenTasaAcc,
                  isGrupoView ? empresasTasaAcc : null,
                )}
                options={lineOpts()}
              />
            </div>
            <ChartSeriesLegend
              items={
                isGrupoView
                  ? getGrupoTimelineLegendItems(empresasTasaAcc, sectoresTasaAccB)
                  : getTimelineLegendItems('Accidentabilidad empresa', sectoresTasaAccB)
              }
              hidden={hiddenTasaAcc}
              onToggle={id => toggleSeriesHidden(setHiddenTasaAcc, id)}
            />
            <div className={styles.downloadRow}>
              <Button type="button" variant="outline" size="md" className={cn(downloadOutlineBtnClass, 'gap-2')}>
                Descargar Excel de tasas de accidentabilidad
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
            <p className={styles.footnote}>
              *La <strong>tasa de accidentabilidad</strong> muestra la proporción de accidentes laborales con tiempo perdido respecto del total de trabajadores declarados y se calcula sobre la base de los últimos 12 meses. Los dos meses más recientes se están calculando debido al desfase en el pago de cotizaciones. No incluye casos asociados a COVID-19.
            </p>
          </ChartCard>

          <ChartCard
            title="Tasa de siniestralidad (trabajo y enfermedad profesional)"
            titleClassName={styles.timelineChartTitle}
          >
            <div className={styles.chartControls}>
              <RangeTabs options={RANGE_OPTIONS} active={rangeSin} onChange={setRangeSin} />
            </div>
            {isGrupoView ? (
              <GrupoTasaChartFilters
                empresas={empresasTasaSin}
                onEmpresasChange={setEmpresasTasaSin}
                sectores={sectoresTasaSin}
                onSectoresChange={setSectoresTasaSin}
                onReset={() => {
                  setEmpresasTasaSin(DEFAULT_EMPRESAS_GRUPO)
                  setSectoresTasaSin([])
                  setHiddenTasaSin([])
                }}
              />
            ) : (
              <div className={styles.chartControls}>
                <SectorFilter selected={sectoresTasaSin} onChange={setSectoresTasaSin} />
              </div>
            )}
            <div className={styles.chartAreaTall}>
              <Line
                data={buildSiniestroTimelineData(
                  rangeSin,
                  sectoresTasaSin,
                  hiddenTasaSin,
                  isGrupoView ? empresasTasaSin : null,
                )}
                options={lineOpts()}
              />
            </div>
            <ChartSeriesLegend
              items={
                isGrupoView
                  ? getGrupoTimelineLegendItems(empresasTasaSin, sectoresTasaSin)
                  : getTimelineLegendItems('Empresa', sectoresTasaSin)
              }
              hidden={hiddenTasaSin}
              onToggle={id => toggleSeriesHidden(setHiddenTasaSin, id)}
            />
            <div className={styles.downloadRow}>
              <Button type="button" variant="outline" size="md" className={cn(downloadOutlineBtnClass, 'gap-2')}>
                Descargar Excel de tasa de siniestralidad
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
            <div className={styles.footnote}>
              <p>
                <strong>Tasa de siniestralidad total</strong> se compone de dos elementos:
              </p>
              <ul className={styles.footnoteList}>
                <li>
                  <strong>Tasa promedio de siniestralidad temporal</strong>, que promedia las tasas por incapacidades temporales de los últimos 12 meses.
                </li>
                <li>
                  <strong>Tasa de siniestralidad por invalidez</strong> y muerte, que considera casos con invalidez igual o superior al 15% y fallecimientos.
                </li>
              </ul>
              <p>
                Ambas se suman para obtener la <a href="#" className={styles.footnoteLink}>Tasa de siniestralidad total</a>.
              </p>
            </div>
          </ChartCard>
        </div>

        {(addedCharts.includes('dias-perdidos') || addedCharts.includes('trabajadores')) && (
          <div className={styles.optionalChartsPair}>
            {addedCharts.includes('dias-perdidos') && (
              <ChartCard
                title="Días perdidos mensuales de accidentes de trabajo y enfermedad profesional"
                onRemove={() => removeChart('dias-perdidos')}
                className={styles.optionalChartCard}
              >
                <div className={styles.chartControls}>
                  <YearSelector years={years} active={yearDiasPerdidos} onChange={setYearDiasPerdidos} />
                </div>
                {isSinSucursalEmpresaView && (
                  <div className={styles.chartControls}>
                    <SucursalSearchFilter
                      selected={sucursalesDiasPerdidos}
                      onChange={setSucursalesDiasPerdidos}
                      items={SUCURSALES_FILTER}
                      showSelectAll
                      showLabel
                    />
                  </div>
                )}
                <ChartSeriesLegend items={DIAS_PERDIDOS_LEGEND} />
                <div className={styles.diasPerdidosChartArea}>
                  <Bar
                    data={diasPerdidosData}
                    options={diasPerdidosBarOpts()}
                    plugins={[diasPerdidosAlignPlugin]}
                  />
                </div>

                <TooltipProvider>
                  <div className={styles.diasPerdidosTable}>
                    <div className={`${styles.diasPerdidosTableRow} ${styles.diasPerdidosTableHead}`}>
                      <span className={styles.diasPerdidosTableLabel} />
                      {MESES.map(mes => (
                        <span key={mes} className={styles.diasPerdidosMonthHead}>{mes}</span>
                      ))}
                    </div>

                    <div className={styles.diasPerdidosTableRow}>
                      <span className={styles.diasPerdidosTableLabel}>
                        <span className={styles.diasPerdidosTableLabelText}>
                          <strong>Total días por incapacidad temporal</strong>
                        </span>
                        <UiTooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={styles.diasPerdidosInfoBtn}
                              aria-label="Info: Total días por incapacidad temporal"
                            >
                              <Info className={styles.diasPerdidosTableInfo} strokeWidth={2.5} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className={styles.diasPerdidosTooltip}>
                            Días perdidos de accidentes de trabajo + días perdidos por enfermedades profesionales.
                          </TooltipContent>
                        </UiTooltip>
                      </span>
                      {DIAS_PERDIDOS_TABLE.incapacidad.map((v, i) => (
                        <span key={`inc-${i}`} className={styles.diasPerdidosTableValue}>
                          {v == null ? '–' : v}
                        </span>
                      ))}
                    </div>

                    <div className={styles.diasPerdidosTableRow}>
                      <span className={styles.diasPerdidosTableLabel}>
                        <span className={styles.diasPerdidosTableLabelText}>
                          <strong>Total de días perdidos</strong>
                        </span>
                        <UiTooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={styles.diasPerdidosInfoBtn}
                              aria-label="Info: Total de días perdidos"
                            >
                              <Info className={styles.diasPerdidosTableInfo} strokeWidth={2.5} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className={styles.diasPerdidosTooltip}>
                            Incluye incapacidad temporal más cargos por fatales.
                          </TooltipContent>
                        </UiTooltip>
                      </span>
                      {DIAS_PERDIDOS_TABLE.perdidos.map((v, i) => (
                        <span key={`per-${i}`} className={styles.diasPerdidosTableValue}>
                          {v == null ? '–' : v}
                        </span>
                      ))}
                    </div>

                    <div className={styles.diasPerdidosTableRow}>
                      <span className={styles.diasPerdidosTableLabel}>
                        <span className={styles.diasPerdidosTableLabelText}>
                          <strong>Trabajadores del mes</strong>
                        </span>
                      </span>
                      {DIAS_PERDIDOS_TABLE.trabajadores.map((v, i) => (
                        <span key={`tra-${i}`} className={styles.diasPerdidosTableValue}>
                          {v == null ? '–' : v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.diasPerdidosFootnote}>
                    <p>Todos los valores presentados son mensuales.</p>
                    <p>
                      <strong>El total de días por incapacidad temporal</strong>
                      {' '}
                      = días perdidos de accidentes de trabajo + días perdidos por enfermedades profesionales.
                    </p>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className={styles.diasPerdidosSaberMas}>
                          Saber más...
                          <Info className={styles.diasPerdidosTableInfo} strokeWidth={2.5} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className={styles.diasPerdidosSaberMasTooltip}>
                        {DIAS_PERDIDOS_SABER_MAS}
                      </TooltipContent>
                    </UiTooltip>
                  </div>
                </TooltipProvider>
              </ChartCard>
            )}

            {addedCharts.includes('trabajadores') && (
              <TrabajadoresDiasChart onRemove={() => removeChart('trabajadores')} />
            )}
          </div>
        )}

        {addedCharts.includes('siniestros') && (
          <SiniestrosTotalesChart
            onRemove={() => removeChart('siniestros')}
            showEmpresaFilter={isGrupoView}
            showSucursalFilter={isSinSucursalEmpresaView}
            sucursales={SUCURSALES_FILTER}
          />
        )}
      </div>

      {/* ── Indicadores por fecha de presentación (mesSelected solo afecta este bloque) ── */}
      <section className={styles.fechaSection} aria-labelledby="accidentes-fecha-title">
        <h2 id="accidentes-fecha-title" className={styles.fechaTitle}>
          Indicadores por fecha de presentación
        </h2>
        <div className={styles.fechaPanel}>
          {isGrupoView ? (
            <div className={styles.fechaPanelGrupoFilters}>
              <MonthYearFilter
                value={mesSelected}
                onChange={setMesSelected}
                variant="grupo"
                hideProcessingNote
              />
              <FechaEmpresaFilter selected={empresasFecha} onChange={setEmpresasFecha} />
              <p className={styles.fechaGrupoProcessingNote}>
                *Los resultados del mes actual aún se están procesando. Como se actualizan día a día, podrías notar algunos cambios.
              </p>
            </div>
          ) : (
            <>
              {isSinSucursalEmpresaView ? (
                <div className={styles.fechaPanelEmpresaFilters}>
                  <div className={styles.fechaPanelGrupoFilters}>
                    <MonthYearFilter
                      value={mesSelected}
                      onChange={setMesSelected}
                      hideProcessingNote
                    />
                    <SucursalSearchFilter
                      selected={sucursalesFecha}
                      onChange={setSucursalesFecha}
                      items={SUCURSALES_FILTER}
                      variant="fecha"
                      showLabel
                      label="Selecciona sucursal (s)"
                      showSelectAll
                    />
                    <p className={styles.fechaGrupoProcessingNote}>
                      *Los resultados del mes actual aún se están procesando. Como se actualizan día a día, podrías notar algunos cambios.
                    </p>
                  </div>
                  <div className={styles.fechaActions}>
                    <Button type="button" variant="default" size="md" className={cn('gap-2', styles.fechaActionBtn)}>
                      Crear Informe PDF
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="default" size="md" className={cn('gap-2', styles.fechaActionBtn)}>
                      Enviar Excel últimos 12 meses
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <MonthYearFilter value={mesSelected} onChange={setMesSelected} />
                  <div className={styles.fechaActions}>
                    <Button type="button" variant="default" size="md" className={cn('gap-2', styles.fechaActionBtn)}>
                      Crear Informe PDF
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="default" size="md" className={cn('gap-2', styles.fechaActionBtn)}>
                      Enviar Excel últimos 12 meses
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

          {isGrupoView ? (
            <FechaGrupoChartsBlock mesSelected={mesSelected} />
          ) : (
            <div className={styles.fechaChartsGroup}>
              <KpiGrid
                title={`Indicadores acumulados de 12 meses a ${mesSelected}`}
                items={[
                  {
                    value: '0.68%',
                    label: 'Tasa de accidentabilidad CTP',
                    info: 'Proporción de accidentes con tiempo perdido respecto de los trabajadores declarados (últimos 12 meses).',
                  },
                  {
                    value: '395',
                    label: 'Siniestros ley',
                    info: 'Siniestros cubiertos por la ley de accidentes del trabajo y enfermedades profesionales.',
                  },
                  { value: '353', label: 'Siniestros no ley' },
                  {
                    value: '43',
                    label: 'Accidentes de trabajo CTP',
                    info: 'Accidentes de trabajo con tiempo perdido en el período acumulado.',
                  },
                  { value: '74', label: 'Accidentes de trayecto CTP' },
                  { value: '9', label: 'Enfermedades profesionales CTP' },
                  { value: '1.12%', label: 'Tasa de siniestralidad' },
                ]}
              />

              <KpiGrid
                title={`Indicadores de ${mesSelected}`}
                compact
                items={FECHA_MES_KPI_EMPRESA}
              />

              <div className={styles.fechaChartsRow}>
                <ChartCard title={`Siniestros por tipo ${mesSelected}`}>
                  <ChartSeriesLegend items={TIPO_LEGEND} />
                  <div className={styles.fechaTipoArea}>
                    <Bar data={siniestrosTipoData} options={tipoBarOpts()} />
                  </div>
                </ChartCard>
                <ChartCard title={`Siniestros por sexo biológico ${mesSelected}`}>
                  <ChartSeriesLegend items={SEXO_LEGEND} />
                  <div className={styles.fechaPieArea}>
                    <Pie data={siniestrosSexoData} options={pieOpts()} />
                  </div>
                </ChartCard>
              </div>

              <div className={styles.fechaChartsRow}>
                <ChartCard title={`Siniestros por parte del cuerpo afectada ${mesSelected}`}>
                  <FechaHBarList items={PARTES_CUERPO_ITEMS} />
                </ChartCard>
                <ChartCard title={`Siniestros por día de presentación semanal ${mesSelected}`}>
                  <div className={styles.fechaDiaArea}>
                    <Bar data={diasSemanaData} options={fechaVBarOpts()} />
                  </div>
                </ChartCard>
              </div>

              <ChartCard
                title={`Siniestros por mecanismo del accidente ${mesSelected}`}
                footnote="*La clasificación del mecanismo tiene un desfase de 2 días desde la fecha de presentación."
                fullWidth
                className={styles.mecanismoCard}
              >
                <FechaHBarList items={MECANISMO_ITEMS} />
              </ChartCard>
            </div>
          )}
      </section>

        </>
      )}

    </div>
  )
}
