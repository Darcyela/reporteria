import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  cn,
} from '@achsux/ui'
import { FileDown, Filter, X } from 'lucide-react'
import EmpresaGrupoFilter from './EmpresaGrupoFilter.jsx'
import SucursalSearchFilter from './SucursalSearchFilter.jsx'
import { DEFAULT_EMPRESAS_SINIESTROS, EMPRESAS_GRUPO } from '../data/empresasGrupo.js'
import { chartFont, chartTooltip } from '../chartFonts.js'
import { downloadOutlineBtnClass } from '../uiButton.js'
import styles from '../pages/AccidentesPage.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const YEARS = [2023, 2024, 2025, 2026]

const TIPO_SINIESTRO_OPTIONS = [
  { id: 'ep', label: 'Enfermedad Profesional' },
  { id: 'incidente', label: 'Incidente sin lesión' },
  { id: 'no-ley', label: 'No Ley' },
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'trayecto', label: 'Trayecto' },
  { id: 'vigilancia', label: 'Vigilancia de la Salud' },
  { id: 'fuerza-mayor', label: 'Fuerza mayor extraña', disabled: true },
  { id: 'otra-mutualidad', label: 'Siniestro otra mutualidad', disabled: true },
]

const SINIESTROS_CTP = [13, 12, 18, 14, 11, 10, 10, 13, 9, 14, 15, 11]
const SINIESTROS_STP = [54, 49, 79, 54, 49, 46, 44, 56, 42, 58, 66, 44]

const SINIESTROS_TOOLTIP = {
  11: {
    ctp: { trayecto: 6, noLey: 4, trabajo: 1, vigilancia: 0 },
    stp: { noLey: 20, trayecto: 13, trabajo: 10, vigilancia: 1 },
  },
}

const LEGEND_ITEMS = [
  { id: 'ctp', label: 'CTP', color: '#27933e' },
  { id: 'stp', label: 'STP', color: '#4dd0e1' },
]

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

ChartJS.register(stackTotalLabelsPlugin)

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

function SeriesLegend({ items, hidden, onToggle }) {
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

function YearTabs({ years, active, onChange }) {
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

function TipoSiniestroFilter({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const enabledOptions = TIPO_SINIESTRO_OPTIONS.filter(o => !o.disabled)
  const allSelected = enabledOptions.every(o => selected.includes(o.id))

  function toggleAll(checked) {
    onChange(checked ? enabledOptions.map(o => o.id) : [])
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className={styles.siniestrosFilterWrap}>
      <button
        type="button"
        className={styles.siniestrosFilterTrigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.siniestrosFilterTriggerText}>
          {selected.length} Tipo siniestro(s)
        </span>
        <Filter className={styles.siniestrosFilterIcon} aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className={styles.sectorDropdownBackdrop} onClick={() => setOpen(false)} />
          <div className={styles.siniestrosFilterDropdown}>
            <label className={styles.siniestrosFilterOption}>
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span>Seleccionar todos</span>
            </label>
            {TIPO_SINIESTRO_OPTIONS.map(option => (
              <label
                key={option.id}
                className={`${styles.siniestrosFilterOption} ${option.disabled ? styles.siniestrosFilterOptionDisabled : ''}`}
              >
                <Checkbox
                  checked={selected.includes(option.id)}
                  disabled={option.disabled}
                  onCheckedChange={() => !option.disabled && toggle(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function scaleValuesByEmpresas(values, selectedEmpresas) {
  const factor = selectedEmpresas.length / EMPRESAS_GRUPO.length
  return values.map(value => Math.max(0, Math.round(value * factor)))
}

function scaleValuesBySelection(values, selectedCount, totalCount) {
  const safeTotal = Math.max(totalCount, 1)
  const factor = Math.max(selectedCount, 0) / safeTotal
  return values.map(value => Math.max(0, Math.round(value * factor)))
}

function buildChartData(hidden = [], selectedEmpresas = DEFAULT_EMPRESAS_SINIESTROS, scaleFactor = 1) {
  const ctp = scaleValuesByEmpresas(SINIESTROS_CTP, selectedEmpresas).map(value =>
    Math.max(0, Math.round(value * scaleFactor)),
  )
  const stp = scaleValuesByEmpresas(SINIESTROS_STP, selectedEmpresas).map(value =>
    Math.max(0, Math.round(value * scaleFactor)),
  )

  return {
    labels: MESES,
    datasets: [
      {
        label: 'Con Tiempo Perdido (CTP)',
        data: ctp,
        backgroundColor: '#27933e',
        borderRadius: 0,
        borderSkipped: false,
        hidden: hidden.includes('ctp'),
      },
      {
        label: 'Sin Tiempo Perdido (STP)',
        data: stp,
        backgroundColor: '#4dd0e1',
        borderRadius: 0,
        borderSkipped: false,
        hidden: hidden.includes('stp'),
      },
    ],
  }
}

function tooltipBreakdown(monthIndex) {
  const detail = SINIESTROS_TOOLTIP[monthIndex]
  if (!detail) return []

  return [
    '',
    `CTP Trayecto: ${detail.ctp.trayecto}`,
    `CTP No Ley: ${detail.ctp.noLey}`,
    `CTP Trabajo: ${detail.ctp.trabajo}`,
    `CTP Vigilancia de la Salud: ${detail.ctp.vigilancia}`,
    '',
    `STP No Ley: ${detail.stp.noLey}`,
    `STP Trayecto: ${detail.stp.trayecto}`,
    `STP Trabajo: ${detail.stp.trabajo}`,
    `STP Vigilancia de la Salud: ${detail.stp.vigilancia}`,
  ]
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 22, right: 8, left: 4, bottom: 2 } },
    plugins: {
      legend: { display: false },
      barValueLabels: false,
      stackTotalLabels: true,
      pieValueLabels: false,
      tooltip: {
        mode: 'index',
        intersect: false,
        ...chartTooltip(12),
        callbacks: {
          title: items => items[0]?.label ?? '',
          label(ctx) {
            const value = ctx.raw
            if (ctx.datasetIndex === 0) return `Con Tiempo Perdido: ${value}`
            return `Sin Tiempo Perdido: ${value}`
          },
          labelColor(ctx) {
            return {
              borderColor: 'transparent',
              backgroundColor: ctx.datasetIndex === 0 ? '#27933e' : '#4dd0e1',
            }
          },
          afterBody: items => tooltipBreakdown(items[0]?.dataIndex ?? 0),
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        offset: false,
        grid: { display: false },
        ticks: {
          font: chartFont(11),
          color: '#4e4e4e',
          padding: 6,
          maxRotation: 0,
          autoSkip: false,
        },
        border: { display: true, color: '#c1c1c1' },
      },
      y: {
        stacked: true,
        min: 0,
        max: 120,
        grid: { color: '#c1c1c1', drawTicks: false, lineWidth: 1 },
        ticks: {
          stepSize: 20,
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
  }
}

export default function SiniestrosTotalesChart({
  onRemove,
  showEmpresaFilter = false,
  showSucursalFilter = false,
  sucursales = [],
  selectedSucursales,
}) {
  const [year, setYear] = useState(2023)
  const [hidden, setHidden] = useState([])
  const [empresasSelected, setEmpresasSelected] = useState(DEFAULT_EMPRESAS_SINIESTROS)
  const [sucursalesSelected, setSucursalesSelected] = useState(() => sucursales.map(item => item.id))
  const [tiposSelected, setTiposSelected] = useState(
    TIPO_SINIESTRO_OPTIONS.filter(o => !o.disabled).map(o => o.id),
  )

  const effectiveEmpresas = showEmpresaFilter
    ? empresasSelected
    : EMPRESAS_GRUPO.map(empresa => empresa.id)

  const effectiveSucursales = selectedSucursales ?? sucursalesSelected
  const sucursalScale = sucursales.length
    ? effectiveSucursales.length / sucursales.length
    : 1

  const chartData = useMemo(
    () => buildChartData(hidden, effectiveEmpresas, sucursalScale),
    [hidden, effectiveEmpresas, sucursalScale, year],
  )
  const tableValues = useMemo(() => ({
    ctp: scaleValuesBySelection(
      scaleValuesByEmpresas(SINIESTROS_CTP, effectiveEmpresas),
      effectiveSucursales.length,
      Math.max(sucursales.length, 1),
    ),
    stp: scaleValuesBySelection(
      scaleValuesByEmpresas(SINIESTROS_STP, effectiveEmpresas),
      effectiveSucursales.length,
      Math.max(sucursales.length, 1),
    ),
  }), [effectiveEmpresas, effectiveSucursales.length, sucursales.length])
  const options = useMemo(() => chartOptions(), [])

  function toggleSeries(id) {
    setHidden(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  return (
    <Card elevation="sm" className={styles.chartCard}>
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
        <CardTitle className={styles.chartTitle}>Ingresos siniestros totales</CardTitle>
      </CardHeader>
      <CardContent className={styles.chartCardBody}>
        <div className={styles.siniestrosChartControls}>
          <YearTabs years={YEARS} active={year} onChange={setYear} />
          <div className={styles.siniestrosFiltersRow}>
            {showEmpresaFilter && (
              <EmpresaGrupoFilter
                selected={empresasSelected}
                onChange={setEmpresasSelected}
                countFormat="count"
                showSelectAll
                variant="siniestros"
              />
            )}
            {showSucursalFilter && (
              <SucursalSearchFilter
                selected={sucursalesSelected}
                onChange={setSucursalesSelected}
                items={sucursales}
                variant="siniestros"
                showSelectAll
              />
            )}
            <TipoSiniestroFilter selected={tiposSelected} onChange={setTiposSelected} />
          </div>
          <SeriesLegend items={LEGEND_ITEMS} hidden={hidden} onToggle={toggleSeries} />
        </div>

        <div className={styles.siniestrosChartArea}>
          <Bar data={chartData} options={options} plugins={[stackTotalLabelsPlugin]} />
        </div>

        <div className={styles.siniestrosTable}>
          <div className={`${styles.siniestrosTableRow} ${styles.siniestrosTableHead}`}>
            <span className={styles.siniestrosTableLabel} />
            {MESES.map(mes => (
              <span key={mes} className={styles.siniestrosMonthHead}>{mes}</span>
            ))}
          </div>
          <div className={styles.siniestrosTableRow}>
            <span className={styles.siniestrosTableLabel}>
              <strong>Con Tiempo Perdido (CTP)</strong>
            </span>
            {tableValues.ctp.map((v, i) => (
              <span key={`ctp-${i}`} className={styles.siniestrosTableValue}>{v}</span>
            ))}
          </div>
          <div className={styles.siniestrosTableRow}>
            <span className={styles.siniestrosTableLabel}>
              <strong>Sin Tiempo Perdido (STP)</strong>
            </span>
            {tableValues.stp.map((v, i) => (
              <span key={`stp-${i}`} className={styles.siniestrosTableValue}>{v}</span>
            ))}
          </div>
        </div>

        <div className={styles.downloadRow}>
          <Button type="button" variant="outline" size="md" className={cn(downloadOutlineBtnClass, 'gap-2')}>
            Descargar Excel de siniestros
            <FileDown className="h-4 w-4" />
          </Button>
        </div>

        <p className={styles.siniestrosFootnote}>
          *Este gráfico incluye el total de siniestros mensuales según fecha de presentación. Los siniestros
          incluidos son accidentes de trabajo, trayecto, enfermedad profesional, fuerza mayor extraña, vigilancia
          de la Salud, incidente sin lesión, no ley, siniestro otra mutualidad, abuso y ayudo.
        </p>
      </CardContent>
    </Card>
  )
}
