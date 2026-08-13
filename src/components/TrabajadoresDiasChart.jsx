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
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from '@achsux/ui'
import { X } from 'lucide-react'
import { outlineBtnClass } from '../uiButton.js'
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

const YEARS = [2022, 2023, 2024, 2025, 2026]

const TRABAJADORES_DIAS_MOCK = [
  { mes: 'Ene', trabajadores: 6250, diasPerdidos: 769 },
  { mes: 'Feb', trabajadores: 6300, diasPerdidos: 785 },
  { mes: 'Mar', trabajadores: 6380, diasPerdidos: 690 },
  { mes: 'Abr', trabajadores: 6420, diasPerdidos: 660 },
  { mes: 'May', trabajadores: 6480, diasPerdidos: 672 },
  { mes: 'Jun', trabajadores: 6540, diasPerdidos: 695 },
  { mes: 'Jul', trabajadores: 6600, diasPerdidos: 745 },
  { mes: 'Ago', trabajadores: 6650, diasPerdidos: 936 },
  { mes: 'Sep', trabajadores: 6700, diasPerdidos: 1062 },
  { mes: 'Oct', trabajadores: 6750, diasPerdidos: 1197 },
  { mes: 'Nov', trabajadores: 6450, diasPerdidos: 1252 },
  { mes: 'Dic', trabajadores: 6800, diasPerdidos: 1229 },
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
    ctx.textBaseline = 'middle'

    meta.data.forEach((point, index) => {
      const value = dataset.data[index]
      if (value == null || meta.hidden) return

      const text = String(value)
      const paddingX = 5
      const paddingY = 3
      const textWidth = ctx.measureText(text).width
      const boxWidth = textWidth + paddingX * 2
      const boxHeight = font.size + paddingY * 2
      const x = point.x
      const y = point.y - 14

      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#d7d7d7'
      ctx.lineWidth = 1
      ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight)
      ctx.strokeRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight)

      ctx.fillStyle = '#373737'
      ctx.fillText(text, x, y)
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
        borderRadius: 2,
        borderSkipped: false,
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
        tension: 0.1,
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
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        ...chartTooltip(12, FONT_ARIAL),
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: chartFont(11, 'normal', FONT_ARIAL) },
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
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          font: chartFont(11, 'normal', FONT_ARIAL),
          stepSize: 1000,
          callback: value => value.toLocaleString('es-CL'),
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 1600,
        title: {
          display: true,
          text: 'Días perdidos',
          font: chartFont(11, 'normal', FONT_ARIAL),
          color: '#4e4e4e',
        },
        grid: { drawOnChartArea: false },
        ticks: {
          font: chartFont(11, 'normal', FONT_ARIAL),
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

export default function TrabajadoresDiasChart({ onRemove }) {
  const [year, setYear] = useState(2025)
  const [hidden, setHidden] = useState([])

  const chartData = useMemo(() => buildChartData(hidden), [hidden, year])
  const options = useMemo(() => chartOptions(), [])

  function toggleSeries(id) {
    setHidden(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  return (
    <Card elevation="sm" className={`${styles.chartCard} ${styles.fullWidth}`}>
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
          <div className={styles.yearSelector}>
            {YEARS.map(y => (
              <Button
                key={y}
                type="button"
                size="sm"
                variant={year === y ? 'default' : 'outline'}
                className={year === y ? undefined : outlineBtnClass}
                onClick={() => setYear(y)}
              >
                {y}
              </Button>
            ))}
          </div>
        </div>

        <SeriesLegend items={LEGEND_ITEMS} hidden={hidden} onToggle={toggleSeries} />

        <div className={styles.chartAreaTall}>
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
