import { useState, useEffect, useRef } from 'react'
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
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  cn,
} from '@achsux/ui'
import { Building2, Building, BarChart3, ChartColumn, ChevronDown, Download, FileDown, Info, Plus, Users, X } from 'lucide-react'
import { outlineBtnClass } from '../uiButton.js'
import TrabajadoresDiasChart from '../components/TrabajadoresDiasChart.jsx'
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
  { id: '5A',   label: '5 años' },
  { id: '4A',   label: '4 años' },
  { id: '3A',   label: '3 años' },
  { id: '2A',   label: '2 años' },
  { id: '1A',   label: '1 año' },
  { id: '2026', label: '2026' },
]

function buildTimelineChartData(range, selectedSectors, { empresaTimeline, sectorTimeline, empresaLabel, hidden = [] }) {
  const [start, end] = RANGE_SLICES[range] || RANGE_SLICES['2026']
  const labels = TIMELINE_LABELS.slice(start, end)
  return {
    labels,
    datasets: [
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

function buildTimelineData(range, selectedSectors, hidden = []) {
  return buildTimelineChartData(range, selectedSectors, {
    empresaTimeline: EMPRESA_TIMELINE,
    sectorTimeline: SECTOR_TIMELINE,
    empresaLabel: 'Accidentabilidad empresa',
    hidden,
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

function buildSiniestroTimelineData(range, selectedSectors, hidden = []) {
  return buildTimelineChartData(range, selectedSectors, {
    empresaTimeline: EMPRESA_SIN_TIMELINE,
    sectorTimeline: SECTOR_SIN_TIMELINE,
    empresaLabel: 'Empresa',
    hidden,
  })
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

const siniestrosTotalesData = {
  labels: MESES,
  datasets: [
    {
      label: 'CTP',
      data: [105, 94, 80, 75, 68, 40, null, null, null, null, null, null],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'STP',
      data: [14, 10, 22, 18, 17, 49, null, null, null, null, null, null],
      backgroundColor: '#27933e',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

const diasPerdidosData = {
  labels: MESES,
  datasets: [
    {
      label: 'Trabajo',
      data: [61, 57, 67, 68, 179, 179, null, null, null, null, null, null],
      backgroundColor: '#4dd0e1',
      borderRadius: 3,
      borderSkipped: false,
    },
    {
      label: 'Enfermedad Profesional',
      data: [20, 25, 18, 22, 0, 0, null, null, null, null, null, null],
      backgroundColor: '#27933e',
      borderRadius: 3,
      borderSkipped: false,
    },
    {
      label: 'Cargo por fallec.',
      data: [0, 0, 0, 0, 0, 0, null, null, null, null, null, null],
      backgroundColor: '#81d877',
      borderRadius: 3,
      borderSkipped: false,
    },
  ],
}

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

const siniestrosTipoData = {
  labels: ['No Ley', 'Trabajo', 'Trayecto', 'Enfermedad Profesional'],
  datasets: [
    {
      label: 'Con tiempo perdido (CTP)',
      data: [18, 13, 1, 0],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Sin tiempo perdido (STP)',
      data: [0, 8, 0, 0],
      backgroundColor: '#27933e',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

const siniestrosSexoData = {
  labels: ['Femenino', 'Masculino', 'No binario'],
  datasets: [{
    data: [10, 20, 2],
    backgroundColor: ['#81d877', '#27933e', '#4dd0e1'],
    borderWidth: 0,
  }],
}

const partesCuerpoData = {
  labels: [
    'Otras partes del cuerpo reconocidas',
    'Dedos de la mano',
    'Pie',
    'Rodilla',
    'Múltiples partes del cuerpo',
    'Ojo',
    'Mano',
  ],
  datasets: [{
    label: 'Siniestros',
    data: [40, 10, 8, 6, 5, 4, 3],
    backgroundColor: '#27933e',
    borderRadius: 4,
    borderSkipped: false,
  }],
}

const diasSemanaData = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'CTP',
      data: [12, 8, 6, 5, 3, 2, 1],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'STP',
      data: [5, 4, 3, 2, 2, 1, 0],
      backgroundColor: '#27933e',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

const mecanismoData = {
  labels: [
    'No informado',
    'Accidentes que involucran vehículos',
    'Contacto con objetos cortopunzantes',
    'Esfuerzos excesivos',
    'Caídas, resbalones y sobresaltos',
    'Contacto e inhalación de sustancias químicas, biológicas o radiaciones',
    'Siniestro en locales según relato paciente',
    'Accidente en locales según relato paciente',
  ],
  datasets: [{
    label: 'Siniestros',
    data: [1, 3, 3, 3, 4, 6, 7, 8],
    backgroundColor: '#27933e',
    borderRadius: 4,
    borderSkipped: false,
  }],
}

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

const barOpts = (stacked = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { font: chartFont(12), padding: 12 } },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
  },
  scales: {
    x: { stacked, grid: { display: false }, ticks: { font: chartFont(11) } },
    y: { stacked, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: chartFont(11) } },
  },
})

const hBarOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: chartFont(11) } },
    y: { grid: { display: false }, ticks: { font: chartFont(11) } },
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

const doughnutOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { font: chartFont(12), padding: 12 } },
    tooltip: chartTooltip(12),
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

function ChartSeriesLegend({ items, hidden, onToggle }) {
  return (
    <div className={styles.chartSeriesLegend}>
      {items.map(item => {
        const active = !hidden.includes(item.id)
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

function ChartCard({ title, children, footnote, fullWidth = false, onRemove }) {
  return (
    <Card elevation="sm" className={`${styles.chartCard} ${fullWidth ? styles.fullWidth : ''}`}>
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
        <CardTitle className={styles.chartTitle}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.chartCardBody}>
        {children}
        {footnote && <p className={styles.footnote}>{footnote}</p>}
      </CardContent>
    </Card>
  )
}

function SectorFilter({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const allSelected = SECTORES.every(s => selected.includes(s.id))

  function toggleAll(checked) {
    onChange(checked ? SECTORES.map(s => s.id) : [])
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className={styles.sectorFilterWrap}>
      <Label className={styles.industryFilterLabel}>
        Selecciona sector
      </Label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(outlineBtnClass, styles.sectorDropdownBtn, 'gap-2')}
        onClick={() => setOpen(o => !o)}
      >
        <span>{selected.length} Sector{selected.length !== 1 ? 'es' : ''}</span>
        <span className={styles.filterIcon}>▼</span>
      </Button>
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

function YearSelector({ years, active, onChange }) {
  return (
    <div className={styles.yearSelector}>
      {years.map(y => (
        <Button
          key={y}
          type="button"
          size="sm"
          variant={active === y ? 'default' : 'outline'}
          className={active === y ? undefined : outlineBtnClass}
          onClick={() => onChange(y)}
        >
          {y}
        </Button>
      ))}
    </div>
  )
}

function KpiGrid({ title, items }) {
  return (
    <Card elevation="sm" className={styles.kpiSection}>
      <CardHeader className={styles.kpiSectionHeader}>
        <CardTitle className={styles.kpiSectionTitle}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.kpiSectionBody}>
        <div className={styles.kpiGrid}>
          {items.map((item, i) => (
            <div key={i} className={styles.kpiItem}>
              <span className={styles.kpiValue}>{item.value}</span>
              <span className={styles.kpiLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
    id: 'siniestros',
    label: 'Ingresos siniestros totales',
    description: 'CTP y STP mensuales del año seleccionado.',
    Icon: BarChart3,
  },
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
]

/* ─── Page ───────────────────────────────────────── */
export default function AccidentesPage() {
  const [activeTab, setActiveTab] = useState('empresa')
  const [mesSelected, setMesSelected] = useState('Junio 2026')
  const [addedCharts, setAddedCharts] = useState([])

  const years = [2022, 2023, 2024, 2025, 2026]
  const availableCharts = OPTIONAL_CHARTS.filter(c => !addedCharts.includes(c.id))

  function addChart(id) {
    setAddedCharts(prev => (prev.includes(id) ? prev : [...prev, id]))
  }

  function removeChart(id) {
    setAddedCharts(prev => prev.filter(x => x !== id))
  }

  // Independent state per chart
  const [yearSiniestros, setYearSiniestros] = useState(2025)
  const [yearDiasPerdidos, setYearDiasPerdidos] = useState(2025)

  // Tasa accidentabilidad: timeline continua
  const [rangeB, setRangeB] = useState('2026')
  const [sectoresTasaAccB, setSectoresTasaAccB] = useState([])
  const [hiddenTasaAcc, setHiddenTasaAcc] = useState([])

  // Tasa siniestralidad: timeline continua
  const [rangeSin, setRangeSin] = useState('2026')
  const [sectoresTasaSin, setSectoresTasaSin] = useState([])
  const [hiddenTasaSin, setHiddenTasaSin] = useState([])

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
        <div className={styles.headerRight}>
          <ExcelReportsDownload />
        </div>
      </div>

      {/* ── Tabs empresa / grupo ── */}
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
      </div>

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

      {/* ── Gráficos fijos + custom ── */}
      <div className={styles.customCharts}>
        <div className={`${styles.twoCol} ${styles.twoColEqual}`}>
          <ChartCard title="Tasa de accidentabilidad Con Tiempo Perdido (CTP) *">
            <div className={styles.chartControls}>
              <div className={styles.yearSelector}>
                {RANGE_OPTIONS.map(({ id, label }) => (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={rangeB === id ? 'default' : 'outline'}
                    className={rangeB === id ? undefined : outlineBtnClass}
                    onClick={() => setRangeB(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className={styles.chartControls}>
              <SectorFilter selected={sectoresTasaAccB} onChange={setSectoresTasaAccB} />
            </div>
            <div className={styles.chartAreaTall}>
              <Line data={buildTimelineData(rangeB, sectoresTasaAccB, hiddenTasaAcc)} options={lineOpts()} />
            </div>
            <ChartSeriesLegend
              items={getTimelineLegendItems('Accidentabilidad empresa', sectoresTasaAccB)}
              hidden={hiddenTasaAcc}
              onToggle={id => toggleSeriesHidden(setHiddenTasaAcc, id)}
            />
            <div className={styles.downloadRow}>
              <Button type="button" variant="outline" size="sm" className={cn(outlineBtnClass, "gap-2")}>
                Descargar Excel de tasas de accidentabilidad
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
            <p className={styles.footnote}>
              *La <strong>tasa de accidentabilidad</strong> muestra la proporción de accidentes laborales con tiempo perdido respecto del total de trabajadores declarados y se calcula sobre la base de los últimos 12 meses. Los dos meses más recientes se están calculando debido al desfase en el pago de cotizaciones. No incluye casos asociados a COVID-19.
            </p>
          </ChartCard>

          <ChartCard title="Tasa de siniestralidad (accidentes de trabajo y enfermedades profesionales)*">
            <div className={styles.chartControls}>
              <div className={styles.yearSelector}>
                {RANGE_OPTIONS.map(({ id, label }) => (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={rangeSin === id ? 'default' : 'outline'}
                    className={rangeSin === id ? undefined : outlineBtnClass}
                    onClick={() => setRangeSin(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className={styles.chartControls}>
              <SectorFilter selected={sectoresTasaSin} onChange={setSectoresTasaSin} />
            </div>
            <div className={styles.chartAreaTall}>
              <Line data={buildSiniestroTimelineData(rangeSin, sectoresTasaSin, hiddenTasaSin)} options={lineOpts()} />
            </div>
            <ChartSeriesLegend
              items={getTimelineLegendItems('Empresa', sectoresTasaSin)}
              hidden={hiddenTasaSin}
              onToggle={id => toggleSeriesHidden(setHiddenTasaSin, id)}
            />
            <div className={styles.downloadRow}>
              <Button type="button" variant="outline" size="sm" className={cn(outlineBtnClass, "gap-2")}>
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

        {addedCharts.includes('siniestros') && (
          <ChartCard
            title="Ingresos siniestros totales"
            footnote="*Este gráfico incluye el total de siniestros mensuales. Agrupa todos los siniestros incluyendo envíos tardíos, abuso, ayudo, interno y pronunciaciones no ley, siniestros de otra mutualidad."
            onRemove={() => removeChart('siniestros')}
          >
            <div className={styles.chartControls}>
              <YearSelector years={years} active={yearSiniestros} onChange={setYearSiniestros} />
            </div>
            <div className={styles.chartAreaMd}>
              <Bar data={siniestrosTotalesData} options={barOpts()} />
            </div>
            <div className={styles.tableSmall}>
              <div className={styles.tableRow}><span></span>{MESES.slice(0,6).map(m => <span key={m}>{m}</span>)}</div>
              <div className={styles.tableRow}><span className={styles.labelCTP}>CTP</span>{[14,10,22,18,17,49].map((v,i) => <span key={i}>{v}</span>)}</div>
              <div className={styles.tableRow}><span className={styles.labelSTP}>STP</span>{[40,35,41,37,36,68].map((v,i) => <span key={i}>{v}</span>)}</div>
            </div>
            <div className={styles.downloadRow}>
              <Button type="button" variant="outline" size="sm" className={cn(outlineBtnClass, "gap-2")}>
                Descargar Excel de siniestros
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </ChartCard>
        )}

        {addedCharts.includes('dias-perdidos') && (
          <ChartCard
            title="Días perdidos mensuales de accidentes de trabajo y enfermedad profesional"
            footnote="Todos los valores son mensuales. El total de días por Incapacidad temporal = días perdidos."
            onRemove={() => removeChart('dias-perdidos')}
          >
            <div className={styles.chartControls}>
              <YearSelector years={years} active={yearDiasPerdidos} onChange={setYearDiasPerdidos} />
            </div>
            <div className={styles.chartAreaMd}>
              <Bar data={diasPerdidosData} options={barOpts()} />
            </div>
            <div className={styles.tableSmall}>
              <div className={styles.tableRow}><span></span>{MESES.slice(0,6).map(m => <span key={m}>{m}</span>)}</div>
              <div className={styles.tableRow}><span>Total</span>{[51,62,57,60,179,179].map((v,i) => <span key={i}>{v}</span>)}</div>
            </div>
          </ChartCard>
        )}

        {addedCharts.includes('trabajadores') && (
          <TrabajadoresDiasChart onRemove={() => removeChart('trabajadores')} />
        )}

        {availableCharts.length > 0 && (
          <section className={styles.chartPicker} aria-label="Agregar gráficos al panel">
            <div className={styles.chartPickerIntro}>
              <span className={styles.chartPickerBadge} aria-hidden="true">
                <Plus className="h-4 w-4" />
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
                      <Icon className="h-5 w-5" />
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
                    className={cn(styles.chartPickerAddBtn, 'gap-1.5')}
                    onClick={() => addChart(id)}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar al panel
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ── Indicadores por fecha ── */}
      <div className={styles.fechaSection}>
        <h2 className={styles.fechaTitle}>Indicadores por fecha de presentación</h2>
        <div className={styles.fechaControls}>
          <div className={styles.fechaLeft}>
            <label className={styles.fechaLabel}>Selecciona un mes/año</label>
            <p className={styles.fechaNote}>*Los meses disponibles son los últimos 13 meses (desde el mes actual hasta 13 meses atrás, siendo el más reciente el mes actual).</p>
            <div className={styles.dateInput}>
              <span>📅</span>
              <span>{mesSelected}</span>
            </div>
            <p className={styles.processingNote}>⚠ Los resultados del mes actual se están procesando. Como se actualiza 1 día, podrás tener algunos cambios.</p>
          </div>
          <div className={styles.fechaRight}>
            <Button type="button" variant="default" size="md" className="gap-2">
              Crear Informe PDF
            </Button>
            <Button type="button" variant="outline" size="md" className={cn(outlineBtnClass, "gap-2")}>
              Enviar Excel últimos 12 meses
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPIs acumulados (7 items) ── */}
      <KpiGrid
        title="Indicadores acumulados de 12 meses a Junio 2026"
        items={[
          { value: '0.68%', label: 'Tasa de accidentabilidad CTP' },
          { value: '395', label: 'Siniestros ley' },
          { value: '353', label: 'Siniestros no ley' },
          { value: '43', label: 'Accidentes de trabajo CTP' },
          { value: '74', label: 'Accidentes de trayecto CTP' },
          { value: '9', label: 'Enfermedades profesionales CTP' },
          { value: '1.12%', label: 'Tasa de siniestralidad' },
        ]}
      />

      {/* ── KPIs del mes (3 items) ── */}
      <KpiGrid
        title="Indicadores de Junio 2026"
        items={[
          { value: '2', label: 'Accidentes de trabajo CTP' },
          { value: '7', label: 'Accidentes de trayecto CTP' },
          { value: '2', label: 'Enfermedades profesionales CTP' },
        ]}
      />

      {/* ── Siniestros por tipo (2fr) + sexo biológico (1fr) ── */}
      <div className={styles.twoColWide}>
        <ChartCard title="Siniestros por tipo Junio 2026">
          <div className={styles.chartAreaMd}>
            <Bar data={siniestrosTipoData} options={barOpts()} />
          </div>
        </ChartCard>
        <ChartCard title="Siniestros por sexo biológico Junio 2026">
          <div className={styles.chartAreaMd}>
            <Doughnut data={siniestrosSexoData} options={doughnutOpts()} />
          </div>
        </ChartCard>
      </div>

      {/* ── Días semana (1fr) + Partes del cuerpo (2fr) ── */}
      <div className={styles.twoColNarrow}>
        <ChartCard title="Siniestros por día de presentación semanal Junio 2026">
          <div className={styles.chartAreaSm}>
            <Bar data={diasSemanaData} options={barOpts()} />
          </div>
        </ChartCard>
        <ChartCard title="Siniestros por parte del cuerpo afectada Junio 2026">
          <div className={styles.chartAreaSm}>
            <Bar data={partesCuerpoData} options={hBarOpts()} />
          </div>
        </ChartCard>
      </div>

      {/* ── Mecanismo (full width) ── */}
      <ChartCard
        title="Siniestros por mecanismo del accidente Junio 2026"
        footnote="*La clasificación de mecanismo tiene un desfase de 1 día desde la fecha de presentación."
        fullWidth
      >
        <div className={styles.chartAreaHbar}>
          <Bar data={mecanismoData} options={hBarOpts()} />
        </div>
      </ChartCard>

    </div>
  )
}
