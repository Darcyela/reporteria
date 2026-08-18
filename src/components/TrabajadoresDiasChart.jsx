import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle, cn } from '@achsux/ui'
import { X } from 'lucide-react'
import { chartFont, chartTooltip, FONT_ARIAL } from '../chartFonts.js'
import styles from '../pages/AccidentesPage.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

const YEARS = [2023, 2024, 2025, 2026]

const TRABAJADORES_DIAS_MOCK = [
  { mes: 'Ene', trabajadores: 7063, diasPerdidos: 1268 },
  { mes: 'Feb', trabajadores: 7080, diasPerdidos: 1274 },
  { mes: 'Mar', trabajadores: 7095, diasPerdidos: 1292 },
  { mes: 'Abr', trabajadores: 7102, diasPerdidos: 1377 },
  { mes: 'May', trabajadores: 7110, diasPerdidos: 1418 },
  { mes: 'Jun', trabajadores: 7118, diasPerdidos: 1448 },
  { mes: 'Jul', trabajadores: 7127, diasPerdidos: 1488 },
  { mes: 'Ago', trabajadores: null, diasPerdidos: null },
  { mes: 'Sep', trabajadores: null, diasPerdidos: null },
  { mes: 'Oct', trabajadores: null, diasPerdidos: null },
  { mes: 'Nov', trabajadores: null, diasPerdidos: null },
  { mes: 'Dic', trabajadores: null, diasPerdidos: null },
]

const LEGEND_ITEMS = [
  { id: 'dias', label: 'Días perdidos', color: '#27933e' },
  { id: 'trabajadores', label: 'N° de trabajadores', color: '#4dd0e1' },
]

const lineDataLabelsPlugin = {
  id: 'lineDataLabels',
  afterDatasetsDraw(chart) {
    const datasetIndex = chart.data.datasets.findIndex(d => d.type === 'line')
    if (datasetIndex < 0) return

    const { ctx } = chart
    const meta = chart.getDatasetMeta(datasetIndex)
    const dataset = chart.data.datasets[datasetIndex]
    const font = chartFont(11, 'normal', FONT_ARIAL)

    ctx.save()
    ctx.font = `${font.weight} ${font.size}px ${font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    meta.data.forEach((point, index) => {
      const value = dataset.data[index]
      if (value == null || meta.hidden) return
      ctx.fillStyle = '#4e4e4e'
      ctx.fillText(String(value), point.x, point.y - 8)
    })

    ctx.restore()
  },
}

function buildChartData(hidden = []) {
  return {
    labels: TRABAJADORES_DIAS_MOCK.map(d => d.mes),
    datasets: [
      {
        type: 'bar',
        label: 'N° de trabajadores',
        data: TRABAJADORES_DIAS_MOCK.map(d => d.trabajadores),
        backgroundColor: '#4dd0e1',
        borderRadius: 0,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        yAxisID: 'y',
        order: 2,
        hidden: hidden.includes('trabajadores'),
      },
      {
        type: 'line',
        label: 'Días perdidos',
        data: TRABAJADORES_DIAS_MOCK.map(d => d.diasPerdidos),
        borderColor: '#27933e',
        backgroundColor: '#27933e',
        borderWidth: 2,
        pointBackgroundColor: '#27933e',
        pointBorderColor: '#27933e',
        pointRadius: 5,
        pointStyle: 'circle',
        tension: 0,
        yAxisID: 'y1',
        order: 1,
        hidden: hidden.includes('dias'),
      },
    ],
  }
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { top: 14, right: 4, left: 4, bottom: 2 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        ...chartTooltip(12, FONT_ARIAL),
      },
      barValueLabels: false,
      stackTotalLabels: false,
      pieValueLabels: false,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: chartFont(11, 'normal', FONT_ARIAL), color: '#4e4e4e', maxRotation: 0, autoSkip: false },
        border: { display: true, color: '#c1c1c1' },
      },
      y: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 9000,
        title: {
          display: true,
          text: 'N° de trabajadores',
          font: chartFont(11, 'normal', FONT_ARIAL),
          color: '#4e4e4e',
        },
        grid: { color: '#c1c1c1', drawTicks: false, lineWidth: 1 },
        border: { display: false },
        ticks: {
          font: chartFont(11, 'normal', FONT_ARIAL),
          color: '#4e4e4e',
          stepSize: 1000,
          callback: value => value.toLocaleString('es-CL'),
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 1800,
        title: {
          display: true,
          text: 'Días perdidos',
          font: chartFont(11, 'normal', FONT_ARIAL),
          color: '#4e4e4e',
        },
        grid: { drawOnChartArea: false },
        border: { display: false },
        ticks: {
          font: chartFont(11, 'normal', FONT_ARIAL),
          color: '#4e4e4e',
          stepSize: 200,
          callback: value => value.toLocaleString('es-CL'),
        },
      },
    },
  }
}

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

export default function TrabajadoresDiasChart({ onRemove }) {
  const [year, setYear] = useState(2026)
  const [hidden, setHidden] = useState([])

  const chartData = useMemo(() => buildChartData(hidden), [hidden, year])
  const options = useMemo(() => chartOptions(), [])

  function toggleSeries(id) {
    setHidden(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  return (
    <Card elevation="sm" className={cn(styles.chartCard, styles.optionalChartCard)}>
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
        <CardTitle className={styles.chartTitle}>
          Total días perdidos y masa de trabajadores últimos 12 meses
        </CardTitle>
      </CardHeader>
      <CardContent className={styles.chartCardBody}>
        <div className={styles.chartControls}>
          <YearTabs years={YEARS} active={year} onChange={setYear} />
        </div>

        <SeriesLegend items={LEGEND_ITEMS} hidden={hidden} onToggle={toggleSeries} />

        <div className={styles.optionalChartArea}>
          <Chart
            type="bar"
            data={chartData}
            options={options}
            plugins={[lineDataLabelsPlugin]}
          />
        </div>

        <p className={styles.footnote}>
          *Los días perdidos son los totales por incapacidad temporal más cargo por fatales si los hay de los{' '}
          <strong>últimos 12 meses</strong>. La masa de cada mes corresponde al promedio de trabajadores de la
          empresa de los <strong>últimos 12 meses</strong> y tiene un desfase de dos meses por el pago de
          cotizaciones.
        </p>
      </CardContent>
    </Card>
  )
}
