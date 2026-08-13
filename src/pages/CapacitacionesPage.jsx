import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Button,
  Calendar,
  Checkbox,
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
import { Building, Building2, Calendar as CalendarIcon, ChevronDown, ChevronRight, FileDown, Info, Sparkles, Target } from 'lucide-react'
import { chartFont, chartTooltip } from '../chartFonts.js'
import { outlineBtnClass } from '../uiButton.js'
import styles from './CapacitacionesPage.module.css'

const MODALIDADES = [
  { id: 'presencial', label: 'Presencial' },
  { id: 'elearning', label: 'E-learning' },
  { id: 'mixta', label: 'Mixta' },
  { id: 'charla', label: 'Charla' },
  { id: 'taller', label: 'Taller' },
  { id: 'seminario', label: 'Seminario' },
  { id: 'programa', label: 'Programa integral' },
]

const DEFAULT_MODALIDADES = MODALIDADES.map(m => m.id)

const TOTALES_KPI = [
  {
    value: '19,352',
    label: 'Cantidad de capacitados',
  },
  {
    value: '223',
    label: 'Cantidad de cursos',
    info: 'Incluye charlas, cursos, programas integrales y seminarios. Excluye e-learning.',
  },
  {
    value: '7,112',
    label: 'Cantidad de Rut únicos',
    info: 'Trabajadores únicos (RUT) que participaron en al menos una capacitación en el período.',
  },
]

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const COLOR_2025 = '#5bc5e6'
const COLOR_2026 = '#24b34b'

const barStyle = {
  borderRadius: 0,
  borderSkipped: false,
  barPercentage: 1,
  categoryPercentage: 0.38,
  skipNull: true,
}

const capacitadosData = {
  labels: MESES,
  datasets: [
    {
      label: '2025',
      data: [720, 980, 1320, 1680, 2200, 2100, 2050, 1980, 1920, 1860, 1800, 1750],
      backgroundColor: COLOR_2025,
      ...barStyle,
    },
    {
      label: '2026',
      data: [380, 560, 820, 1180, 1520, null, null, null, null, null, null, null],
      backgroundColor: COLOR_2026,
      ...barStyle,
    },
  ],
}

const cursosData = {
  labels: MESES,
  datasets: [
    {
      label: '2025',
      data: [12, 16, 20, 26, 32, 33, 31, 30, 28, 26, 24, 22],
      backgroundColor: COLOR_2025,
      ...barStyle,
    },
    {
      label: '2026',
      data: [7, 11, 15, 21, 28, null, null, null, null, null, null, null],
      backgroundColor: COLOR_2026,
      ...barStyle,
    },
  ],
}

const unicosData = {
  labels: MESES,
  datasets: [
    {
      label: '2025',
      data: [540, 710, 890, 1050, 1280, 1340, 1310, 1260, 1190, 1120, 1080, 1020],
      backgroundColor: COLOR_2025,
      ...barStyle,
    },
    {
      label: '2026',
      data: [310, 420, 580, 740, 910, null, null, null, null, null, null, null],
      backgroundColor: COLOR_2026,
      ...barStyle,
    },
  ],
}

const COLOR_MODALIDAD = [
  '#c45c3e', // E-Learning
  '#4dd0e1', // Presencial
  '#27933e', // Streaming
  '#81d877', // CERM
  '#00b2a9', // Charlas
  '#5bc5e6', // Semi Presencial
  '#24b34b', // Aula Virtual
]

const COLOR_CURSO_A = '#81d877'
const COLOR_CURSO_B = '#4dd0e1'

const CURSOS_POR_CURSO = [
  { label: 'Primera respuesta frente a emergencias de salud', value: 2178 },
  { label: 'Hipobaria intermitente crónica', value: 1529 },
  { label: 'Uso de extintores', value: 1452 },
  { label: 'Uso de extintores - gamificado', value: 1030 },
  { label: 'Orientación en prevención de riesgos de acuerdo al ds 44', value: 900 },
  { label: 'Uso de extintores (vr)', value: 840 },
  { label: 'Primera respuesta frente a emergencias de salud - gamificado', value: 650 },
]

const CURSOS_POR_CURSO_MAX = Math.max(...CURSOS_POR_CURSO.map(item => item.value))
const CURSOS_TOTAL = 435

const EMPRESAS_POR_CAPACITACION = [
  { id: 'constructora-andes', label: 'Constructora Andes Pacífico SpA', value: 4820 },
  { id: 'minera-norte', label: 'Minera El Norte Ltda.', value: 3910 },
  { id: 'transportes-sur', label: 'Transportes del Sur S.A.', value: 3145 },
  { id: 'servicios-austral', label: 'Servicios Industriales Austral SpA', value: 2780 },
  { id: 'alimentos-valle', label: 'Alimentos Valle Central S.A.', value: 2410 },
  { id: 'logistica-puerto', label: 'Logística Puerto Central Ltda.', value: 1985 },
  { id: 'ingenieria-cordillera', label: 'Ingeniería y Montajes Cordillera SpA', value: 1620 },
]

const EMPRESAS = EMPRESAS_POR_CAPACITACION.map(({ id, label }) => ({ id, label }))
const DEFAULT_EMPRESAS = EMPRESAS.map(e => e.id)
const EMPRESAS_TOTAL = 48

const CURSOS_RECOMENDADOS = [
  'Cultivando el compañerismo para entornos de trabajo saludables',
  'Observación de comportamientos',
  'Carga de trabajo: estrategias y soluciones para entornos de trabajo saludables',
]

const COLOR_APROBADO = '#24b34b'
const COLOR_EN_CURSO = '#5bc5e6'
const COLOR_REPROBADO = '#f48fb1'

const elearningEstadoData = {
  labels: ['Aprobado', 'En curso'],
  datasets: [
    {
      data: [13448, 2593],
      backgroundColor: [COLOR_APROBADO, COLOR_EN_CURSO],
      borderWidth: 0,
    },
  ],
}

const presencialEstadoData = {
  labels: ['Aprobado', 'Reprobado'],
  datasets: [
    {
      data: [3209, 7],
      backgroundColor: [COLOR_APROBADO, COLOR_REPROBADO],
      borderWidth: 0,
    },
  ],
}

const pieValueLabelsPlugin = {
  id: 'pieValueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      if (meta.hidden) return
      meta.data.forEach((arc, index) => {
        const value = dataset.data[index]
        if (value == null) return
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

function pieOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 8 },
    plugins: {
      legend: { display: false },
      tooltip: { ...chartTooltip(12) },
    },
  }
}

const modalidadData = {
  labels: ['E-Learning', 'Presencial', 'Streaming', 'CERM', 'Charlas', 'Semi Presencial', 'Aula Virtual'],
  datasets: [
    {
      label: 'Capacitados',
      data: [16041, 3216, 50, 31, 11, 2, 1],
      backgroundColor: COLOR_MODALIDAD,
      borderRadius: 0,
      borderSkipped: false,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    },
  ],
}

const barValueLabelsPlugin = {
  id: 'barValueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      if (meta.hidden) return
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index]
        if (value == null) return
        ctx.save()
        ctx.fillStyle = '#4e4e4e'
        ctx.font = '11px ACHS Nueva Sans, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(String(value), bar.x, bar.y - 4)
        ctx.restore()
      })
    })
  },
}

function barOptions({ max, stepSize, showValueLabels = false, categoryPercentage, barPercentage, minBarLength }) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: showValueLabels ? 22 : 4, right: 12, bottom: 4, left: 4 },
    },
    datasets: {
      bar: {
        barPercentage: barPercentage ?? 1,
        categoryPercentage: categoryPercentage ?? 0.38,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
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
        border: {
          display: true,
          color: '#c1c1c1',
        },
      },
      y: {
        min: 0,
        max,
        border: { display: false },
        grid: {
          color: '#c1c1c1',
          drawTicks: false,
          lineWidth: 1,
        },
        ticks: {
          stepSize,
          font: chartFont(11),
          color: '#4e4e4e',
          padding: 8,
          callback: value => Number(value).toLocaleString('es-CL'),
        },
      },
    },
    ...(minBarLength
      ? {
          elements: {
            bar: { minBarLength },
          },
        }
      : {}),
  }
}

const CHART_NAV_ITEMS = [
  {
    id: 'capacitados',
    label: 'Cantidad de capacitados',
    data: capacitadosData,
    options: { max: 2268, stepSize: 756 },
    footnote: (
      <p>
        *<strong>Indica el número de asistentes a capacitaciones</strong>, se incluyen todas las actividades de
        capacitación que hayan sido <strong>iniciadas y/o finalizadas</strong> por trabajadores de la empresa,{' '}
        <strong>independiente de si el curso fue aprobado o no.</strong> En el caso de las capacitaciones e-learning,
        se contabilizan desde el momento en que el trabajador <strong>inicia la actividad en la plataforma.</strong>
      </p>
    ),
  },
  {
    id: 'cursos',
    label: 'Cantidad de cursos',
    data: cursosData,
    options: { max: 36, stepSize: 12 },
    footnote: (
      <p>
        *Por mes contabiliza las actividades de capacitación, incluye charlas, cursos, programas integrales y
        seminarios. Excluye capacitaciones en modalidad e-learning.
      </p>
    ),
  },
  {
    id: 'unicos',
    label: 'Cantidad de trabajadores únicos capacitados',
    data: unicosData,
    options: { max: 1500, stepSize: 500 },
    footnote: (
      <p>
        *Considera trabajadores <strong>únicos</strong> que participaron en al menos una actividad de capacitación
        durante el mes, <strong>sin duplicar</strong> a quienes asistieron a más de un curso.
      </p>
    ),
  },
]

function CheckCircle({ color, selected = true }) {
  return (
    <span
      className={`${styles.checkCircle} ${selected ? styles.checkCircleOn : ''}`}
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

function ChartLegend() {
  return (
    <div className={styles.chartLegend}>
      <span className={styles.legendItem}>
        <CheckCircle color={COLOR_2025} />
        2025
      </span>
      <span className={styles.legendItem}>
        <CheckCircle color={COLOR_2026} />
        2026
      </span>
    </div>
  )
}

function CollapsibleFootnote({ children }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.chartFootnote}>
      <div className={expanded ? undefined : styles.footnoteCollapsed}>{children}</div>
      <button
        type="button"
        className={styles.footnoteToggle}
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
      >
        {expanded ? 'Ver menos' : 'Ver más'}
      </button>
    </div>
  )
}

function ChartCard({
  title,
  children,
  footnote,
  fullWidth = false,
  showLegend = true,
  tall = false,
  collapsibleFootnote = false,
}) {
  return (
    <div className={`${styles.chartCard} ${fullWidth ? styles.chartCardFull : ''}`}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {showLegend && <ChartLegend />}
      <div
        className={`${styles.chartArea} ${fullWidth ? styles.chartAreaFull : ''} ${tall ? styles.chartAreaTall : ''}`}
      >
        {children}
      </div>
      {footnote &&
        (collapsibleFootnote ? (
          <CollapsibleFootnote>{footnote}</CollapsibleFootnote>
        ) : (
          <div className={styles.chartFootnote}>{footnote}</div>
        ))}
    </div>
  )
}

function HorizontalRankCard({ title, items, maxValue, footerLabel }) {
  return (
    <div className={`${styles.chartCard} ${styles.chartCardFull} ${styles.cursosCard}`}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ul className={styles.cursosList}>
        {items.map((item, index) => {
          const widthPct = Math.max((item.value / maxValue) * 100, 2)
          const color = index % 2 === 0 ? COLOR_CURSO_A : COLOR_CURSO_B
          return (
            <li key={item.label} className={styles.cursoItem}>
              <div className={styles.cursoLabel}>{item.label}</div>
              <div className={styles.cursoBarRow}>
                <div className={styles.cursoBarGroup} style={{ width: `${widthPct}%` }}>
                  <div className={styles.cursoBarFill} style={{ backgroundColor: color }} />
                  <span className={styles.cursoValue}>{item.value}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className={styles.cursosFooter}>
        <Button type="button" variant="outline" size="md" className={cn(outlineBtnClass, styles.cursosBtn)}>
          {footerLabel}
        </Button>
      </div>
    </div>
  )
}

function CursosPorCursoCard() {
  return (
    <HorizontalRankCard
      title="Capacitaciones realizadas por curso"
      items={CURSOS_POR_CURSO}
      maxValue={CURSOS_POR_CURSO_MAX}
      footerLabel={`Ver todos los cursos (${CURSOS_TOTAL})`}
    />
  )
}

function EmpresasPorCapacitacionCard({ selectedIds = DEFAULT_EMPRESAS }) {
  const items = EMPRESAS_POR_CAPACITACION.filter(item => selectedIds.includes(item.id))
  const maxValue = items.length ? Math.max(...items.map(item => item.value)) : 1

  return (
    <HorizontalRankCard
      title="Empresas que se capacitan más"
      items={items}
      maxValue={maxValue}
      footerLabel={`Ver todas las empresas (${EMPRESAS_TOTAL})`}
    />
  )
}

function SingleDateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const label = value ? formatDateLabel(value) : 'Selecciona'

  return (
    <div className={styles.estadoFilter}>
      <Label className={styles.estadoFilterLabel}>Selecciona fecha</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(styles.filterControl, styles.estadoFilterControl, !value && styles.filterPlaceholder)}
          >
            <span className={styles.filterControlText}>{label}</span>
            <CalendarIcon className={styles.filterControlIcon} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={value}
            onSelect={date => {
              onChange(date)
              setOpen(false)
            }}
            defaultMonth={value}
          />
        </PopoverContent>
      </Popover>
      <button type="button" className={styles.resetLinkCentered} onClick={() => onChange(undefined)}>
        Reestablecer filtro
      </button>
    </div>
  )
}

function EstadoModalidadCard({ title, info, legendItems, data }) {
  const [fecha, setFecha] = useState(undefined)

  return (
    <div className={`${styles.chartCard} ${styles.estadoCard}`}>
      <div className={styles.estadoHeader}>
        <h3 className={styles.estadoCardTitle}>{title}</h3>
        <div className={styles.estadoInfoBox}>{info}</div>
      </div>

      <SingleDateFilter value={fecha} onChange={setFecha} />

      <div className={styles.chartLegend}>
        {legendItems.map(item => (
          <span key={item.label} className={styles.legendItem}>
            <CheckCircle color={item.color} />
            {item.label}
          </span>
        ))}
      </div>

      <div className={styles.estadoPieArea}>
        <Pie data={data} options={pieOptions()} plugins={[pieValueLabelsPlugin]} />
      </div>
    </div>
  )
}

function RecomendacionesCard() {
  return (
    <div className={styles.recomendacionesCard}>
      <div className={styles.recomendacionesHeader}>
        <div className={styles.recomendacionesHeaderText}>
          <h3 className={styles.recomendacionesCardTitle}>
            Capacita a tus trabajadores con los cursos que necesitan
          </h3>
          <p className={styles.recomendacionesCardSubtitle}>
            Revisa nuestras recomendaciones y gestiona su inscripción en simples pasos
          </p>
        </div>
        <span className={styles.iaBadge}>
          <Sparkles className={styles.iaBadgeIcon} aria-hidden="true" />
          Generado con IA
        </span>
      </div>

      <div className={styles.recomendacionesGrid}>
        {CURSOS_RECOMENDADOS.map(curso => (
          <article key={curso} className={styles.recomendacionItem}>
            <span className={styles.recomendacionIcon} aria-hidden="true">
              <Target className={styles.recomendacionIconSvg} strokeWidth={2.2} />
            </span>
            <div className={styles.recomendacionContent}>
              <h4 className={styles.recomendacionTitle}>{curso}</h4>
              <a href="#conoce-mas" className={styles.recomendacionLink}>
                Conoce más <ChevronRight className={styles.recomendacionLinkIcon} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function AchsCapacitaBanner() {
  return (
    <div className={styles.capacitaBanner}>
      <picture>
        <source media="(max-width: 767px)" srcSet="/banners/achs-capacita-mobile.jpg" />
        <source media="(max-width: 1023px)" srcSet="/banners/achs-capacita-tablet.jpg" />
        <img
          src="/banners/achs-capacita-desktop.jpg"
          alt="Achs Capacita. La nueva app donde cAPPas y cAPPos se capacitan. Descárgala en Google Play y App Store."
          className={styles.capacitaBannerImg}
        />
      </picture>
    </div>
  )
}

function DateRangeFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const label =
    value?.from && value?.to
      ? `${formatDateLabel(value.from)} – ${formatDateLabel(value.to)}`
      : value?.from
        ? formatDateLabel(value.from)
        : 'Selecciona'

  return (
    <div className={styles.filterGroup}>
      <Label className={styles.filterLabel}>Selecciona fechas</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(styles.filterControl, !value?.from && styles.filterPlaceholder)}
          >
            <span className={styles.filterControlText}>{label}</span>
            <CalendarIcon className={styles.filterControlIcon} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={onChange}
            defaultMonth={value?.from}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ModalidadFilter({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const count = selected.length
  const label = count === 0 ? 'Selecciona' : `(${count}) Modalidad (es)`

  const toggle = id => {
    onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  return (
    <div className={styles.filterGroup}>
      <Label className={styles.filterLabel}>Selecciona modalidad</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(styles.filterControl, count === 0 && styles.filterPlaceholder)}
          >
            <span className={styles.filterControlText}>{label}</span>
            <ChevronDown className={styles.filterChevron} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.modalidadPopover} align="start">
          <ul className={styles.modalidadList}>
            {MODALIDADES.map(item => (
              <li key={item.id}>
                <label className={styles.modalidadOption}>
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function EmpresaFilter({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const count = selected.length
  const label = count === 0 ? 'Selecciona' : `(${count}) Empresa(s)`

  const toggle = id => {
    onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  return (
    <div className={cn(styles.filterGroup, styles.empresaFilterGroup)}>
      <Label className={styles.filterLabel}>Selecciona empresa</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(styles.filterControl, count === 0 && styles.filterPlaceholder)}
          >
            <span className={styles.filterControlText}>{label}</span>
            <ChevronDown className={styles.filterChevron} aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.empresaPopover} align="start">
          <ul className={styles.modalidadList}>
            {EMPRESAS.map(item => (
              <li key={item.id}>
                <label className={styles.modalidadOption}>
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function TotalesKpi({ items }) {
  return (
    <TooltipProvider>
      <div className={styles.totalesCard}>
        {items.map(item => (
          <div key={item.label} className={styles.totalesItem}>
            <div className={styles.totalesValue}>{item.value}</div>
            <div className={styles.totalesLabelRow}>
              <span className={styles.totalesLabel}>{item.label}</span>
              {item.info && (
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className={styles.infoBtn} aria-label={`Info: ${item.label}`}>
                      <Info className={styles.infoIcon} strokeWidth={2.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className={styles.infoTooltip}>
                    {item.info}
                  </TooltipContent>
                </UiTooltip>
              )}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default function CapacitacionesPage() {
  const location = useLocation()
  const layoutV2 = location.pathname.endsWith('/v2')
  const [activeTab, setActiveTab] = useState('empresa')
  const [activeChart, setActiveChart] = useState('capacitados')
  const [dateRange, setDateRange] = useState(undefined)
  const [modalidades, setModalidades] = useState(DEFAULT_MODALIDADES)
  const [empresas, setEmpresas] = useState(DEFAULT_EMPRESAS)

  const totalesTitle = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `Indicadores totales desde ${formatDateLabel(dateRange.from)} hasta ${formatDateLabel(dateRange.to)}`
    }
    return 'Indicadores totales desde 01 Enero 2025 hasta 10 Agosto 2026'
  }, [dateRange])

  const resetFilters = () => {
    setDateRange(undefined)
    setModalidades(DEFAULT_MODALIDADES)
    setEmpresas(DEFAULT_EMPRESAS)
  }

  const activeChartItem = CHART_NAV_ITEMS.find(item => item.id === activeChart) || CHART_NAV_ITEMS[0]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Indicadores de Capacitaciones</h1>
          <p className={styles.pageSubtitle}>
            Monitoreamos continuamente los indicadores clave relacionados con las capacitaciones laborales para
            asegurar un entorno seguro y saludable para todos los empleados.
          </p>
        </div>
        {activeTab === 'empresa' && (
          <div className={styles.downloadBox}>
            <Button type="button" variant="default" size="md" className={`gap-2 ${styles.downloadBtn}`}>
              Descargar Excel cursos realizados
              <FileDown className="h-4 w-4" />
            </Button>
            <p className={styles.downloadNote}>Datos de los 2 últimos años.</p>
          </div>
        )}
      </div>

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

      {layoutV2 ? (
        <div className={styles.chartExplorer}>
          {activeTab === 'grupo' && (
            <div className={styles.chartExplorerFilter}>
              <EmpresaFilter selected={empresas} onChange={setEmpresas} />
            </div>
          )}
          <div className={styles.chartExplorerBody}>
            <nav className={styles.chartNav} aria-label="Gráficos de:">
              <h2 className={styles.chartNavTitle}>
                <svg className={styles.chartNavTitleIcon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M3 3v18h18v-2H5V3H3zm4 14h2V9H7v8zm4 0h2V5h-2v12zm4 0h2v-6h-2v6zm4 0h2V7h-2v10z"
                  />
                </svg>
                Gráficos de:
              </h2>
              <ul className={styles.chartNavList}>
                {CHART_NAV_ITEMS.map(item => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`${styles.chartNavItem} ${activeChart === item.id ? styles.chartNavItemActive : ''}`}
                      onClick={() => setActiveChart(item.id)}
                      aria-current={activeChart === item.id ? 'true' : undefined}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              <label className={styles.chartNavSelectWrap}>
                <span className={styles.srOnly}>Seleccionar gráfico</span>
                <select
                  className={styles.chartNavSelect}
                  value={activeChart}
                  onChange={e => setActiveChart(e.target.value)}
                >
                  {CHART_NAV_ITEMS.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </nav>

            <div className={styles.chartPanel}>
              <ChartCard
                title={activeChartItem.label}
                fullWidth
                footnote={activeChartItem.footnote}
                collapsibleFootnote={activeChartItem.id === 'capacitados'}
              >
                <Bar
                  data={activeChartItem.data}
                  options={barOptions(activeChartItem.options)}
                />
              </ChartCard>
            </div>
          </div>
        </div>
      ) : activeTab === 'grupo' ? (
        <div className={styles.chartExplorer}>
          <div className={styles.chartExplorerFilter}>
            <EmpresaFilter selected={empresas} onChange={setEmpresas} />
          </div>
          <div className={styles.chartsRow}>
            <ChartCard
              title={CHART_NAV_ITEMS[0].label}
              footnote={CHART_NAV_ITEMS[0].footnote}
              collapsibleFootnote
            >
              <Bar data={CHART_NAV_ITEMS[0].data} options={barOptions(CHART_NAV_ITEMS[0].options)} />
            </ChartCard>

            <ChartCard title={CHART_NAV_ITEMS[1].label} footnote={CHART_NAV_ITEMS[1].footnote}>
              <Bar data={CHART_NAV_ITEMS[1].data} options={barOptions(CHART_NAV_ITEMS[1].options)} />
            </ChartCard>
          </div>

          <div className={`${styles.chartsFull} ${styles.chartsFullInExplorer}`}>
            <ChartCard title={CHART_NAV_ITEMS[2].label} fullWidth footnote={CHART_NAV_ITEMS[2].footnote}>
              <Bar data={CHART_NAV_ITEMS[2].data} options={barOptions(CHART_NAV_ITEMS[2].options)} />
            </ChartCard>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.chartsRow}>
            <ChartCard
              title={CHART_NAV_ITEMS[0].label}
              footnote={CHART_NAV_ITEMS[0].footnote}
              collapsibleFootnote
            >
              <Bar data={CHART_NAV_ITEMS[0].data} options={barOptions(CHART_NAV_ITEMS[0].options)} />
            </ChartCard>

            <ChartCard title={CHART_NAV_ITEMS[1].label} footnote={CHART_NAV_ITEMS[1].footnote}>
              <Bar data={CHART_NAV_ITEMS[1].data} options={barOptions(CHART_NAV_ITEMS[1].options)} />
            </ChartCard>
          </div>

          <div className={styles.chartsFull}>
            <ChartCard title={CHART_NAV_ITEMS[2].label} fullWidth footnote={CHART_NAV_ITEMS[2].footnote}>
              <Bar data={CHART_NAV_ITEMS[2].data} options={barOptions(CHART_NAV_ITEMS[2].options)} />
            </ChartCard>
          </div>
        </>
      )}

      <section className={styles.fechaSection} aria-labelledby="capacitaciones-fecha-title">
        <h2 id="capacitaciones-fecha-title" className={styles.sectionTitle}>
          Indicadores de capacitaciones por fecha
        </h2>

        <div className={styles.filterPanel}>
          <div className={styles.filterRow}>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <ModalidadFilter selected={modalidades} onChange={setModalidades} />
            {activeTab === 'grupo' && (
              <EmpresaFilter selected={empresas} onChange={setEmpresas} />
            )}
            <button type="button" className={styles.resetLink} onClick={resetFilters}>
              Restablecer filtros
            </button>
          </div>
          <p className={styles.filterNote}>
            Si no has realizado una selección, por defecto se mostrarán los datos acumulados desde hace 2 años hasta
            la fecha.
          </p>
        </div>

        <h3 className={styles.totalesTitle}>{totalesTitle}</h3>
        <TotalesKpi items={TOTALES_KPI} />

        <div className={styles.chartsFull}>
          <ChartCard
            title="Cantidad de capacitados por modalidad de cursos"
            fullWidth
            showLegend={false}
            tall
            footnote={
              <p>
                *Se consideran cursos iniciados, aprobados y reprobados. No se consideran los inscritos que no han
                iniciado cursos de modalidad e-learning
              </p>
            }
          >
            <Bar
              data={modalidadData}
              options={barOptions({
                max: 20000,
                stepSize: 5000,
                showValueLabels: true,
                barPercentage: 0.6,
                categoryPercentage: 0.75,
                minBarLength: 3,
              })}
              plugins={[barValueLabelsPlugin]}
            />
          </ChartCard>
        </div>

        <div className={styles.chartsFull}>
          <CursosPorCursoCard />
        </div>

        {activeTab === 'grupo' && (
          <div className={styles.chartsFull}>
            <EmpresasPorCapacitacionCard selectedIds={empresas} />
          </div>
        )}
      </section>

      <section className={styles.estadoSection} aria-labelledby="estado-modalidad-title">
        <h2 id="estado-modalidad-title" className={styles.sectionTitle}>
          Estado de los cursos por modalidad
        </h2>
        <div className={styles.estadoRow}>
          <EstadoModalidadCard
            title="Cursos e-learning"
            info="*Cantidad de cursos aprobados vs en curso según fecha de inicio"
            legendItems={[
              { label: 'Aprobado', color: COLOR_APROBADO },
              { label: 'En curso', color: COLOR_EN_CURSO },
            ]}
            data={elearningEstadoData}
          />
          <EstadoModalidadCard
            title="Cursos presenciales"
            info="*Cantidad de cursos aprobados vs reprobados según fecha de finalización"
            legendItems={[
              { label: 'Aprobado', color: COLOR_APROBADO },
              { label: 'Reprobado', color: COLOR_REPROBADO },
            ]}
            data={presencialEstadoData}
          />
        </div>
      </section>

      <section className={styles.alcanceSection} aria-labelledby="alcance-title">
        <h2 id="alcance-title" className={styles.sectionTitle}>
          Capacitaciones al alcance de todos
        </h2>
        <p className={styles.alcanceSubtitle}>
          ¡Únete a nuestra comunidad de más de 1.300.000 trabajadores que asisten a nuestras capacitaciones al año!
        </p>
        <RecomendacionesCard />
        <AchsCapacitaBanner />
      </section>
    </div>
  )
}
