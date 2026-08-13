import { useState } from 'react'
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
  InformativeAlert,
  Label,
  NegativeAlert,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  WarningAlert,
  cn,
} from '@achsux/ui'
import { Bell, Download } from 'lucide-react'
import { outlineBtnClass } from '../uiButton.js'
import { chartFont, chartTooltip } from '../chartFonts.js'
import styles from './VigilanciaPage.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

/* ── Mock data ── */
const agentesData = {
  labels: ['Hipobaria', 'Ruido', 'Arsénico', 'Sílice', 'Plaguicida', 'Otro'],
  datasets: [
    {
      label: 'Protegido',
      data: [800, 45, 20, 10, 1, 1],
      backgroundColor: '#27933e',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'No protegido',
      data: [29, 5, 4, 1, 0, 0],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

const evaluacionData = {
  labels: [
    'Examen efectuado',
    'No se presentó',
    'Pendiente de estado',
    'Sin exposición transitoria',
    'Empresa solicita reprogramar',
  ],
  datasets: [
    {
      label: 'Protegido',
      data: [38, 13, 13, 4, 1],
      backgroundColor: '#27933e',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'No protegido',
      data: [10, 5, 3, 2, 0],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

const diagnosticoData = {
  labels: [
    'Aumenta daño',
    'Examen alterado',
    'Examen normal',
    'Mantiene daño',
    'No se dispone de resultado',
    'No se presentó',
    'Rechaza examen',
    'Sin examen de egreso',
    'Vacías',
  ],
  datasets: [
    {
      label: 'Protegido',
      data: [38, 13, 13, 4, 4, 4, 4, 4, 4],
      backgroundColor: '#27933e',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'No protegido',
      data: [10, 5, 3, 2, 1, 1, 1, 1, 1],
      backgroundColor: '#4dd0e1',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

const sedesData = {
  labels: ['Las Condes', 'San Felipe', 'La Calera', 'Otros', 'Otros'],
  datasets: [
    {
      label: 'Centros vigentes',
      data: [38, 13, 13, 4, 1],
      backgroundColor: '#81d877',
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Centros no vigentes',
      data: [5, 3, 2, 1, 0],
      backgroundColor: '#00b2a9',
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}

/* ── Shared chart options ── */
function barOptions(title, horizontal = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        position: 'top',
        labels: { font: chartFont(13), padding: 16 },
      },
      title: { display: false },
      tooltip: { mode: 'index', intersect: false, ...chartTooltip(12) },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: chartFont(12) },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: chartFont(12) },
      },
    },
  }
}

/* ── Sub-components ── */
function AlertRed() {
  return (
    <NegativeAlert
      title="Folios INE duplicados"
      description={
        <p>
          Hemos detectado en nuestros registros que para un mismo trabajador hay más de un folio INE del mismo agente de riesgo,{' '}
          <a href="#" className={styles.alertLink}>¡revisa cuáles son!</a>
        </p>
      }
    />
  )
}

function AlertYellow() {
  return (
    <WarningAlert
      title="Próximo control"
      description={
        <p>
          Hemos detectado una <strong>fecha de próximo control</strong> para el <strong>08/07/2026</strong>.{' '}
          <a href="#" className={styles.alertLink}>¡Revisa el Excel de próximas evaluaciones presionando en &quot;Descargar detalle trabajadores&quot;!</a>
        </p>
      }
    />
  )
}

function AlertInfo() {
  return (
    <InformativeAlert
      title="Información importante"
      description={
        <ul className={styles.alertList}>
          <li>
            <strong>Estamos en marcha blanca.</strong> Si ves diferencias entre la información que aparece y la realidad de tu empresa, por favor contacta a tu equipo de atención con copia a{' '}
            <a href="mailto:gestionine@achs.cl" className={styles.alertLink}>gestionine@achs.cl</a>
          </li>
          <li>Los trabajadores se consideran por agentes y sucursales donde están expuestos.</li>
          <li>Registros de datos en nuestros sistemas al 22-06-2026. Si solicitaste la actualización de la nómina de trabajadores expuestos hace menos de 15 días, es posible que los cambios aún no se reflejen.</li>
        </ul>
      }
    />
  )
}

function KpiCard({ value, label }) {
  return (
    <Card elevation="sm" className={styles.kpiCard}>
      <CardContent className={styles.kpiCardContent}>
        <div className={styles.kpiValue}>{value}</div>
        <div className={styles.kpiLabel}>{label}</div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, children, footnote }) {
  return (
    <Card elevation="sm" className={styles.chartCard}>
      <CardHeader className={styles.chartCardHeader}>
        <CardTitle className={styles.chartTitle}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={styles.chartCardBody}>
        <div className={styles.chartArea}>{children}</div>
        {footnote && <p className={styles.chartFootnote}>{footnote}</p>}
      </CardContent>
    </Card>
  )
}

function FilterBar({ sucursal, agente, onSucursalChange, onAgenteChange, onReset }) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <Label className={styles.filterLabel}>Selecciona sucursal</Label>
        <Select value={sucursal} onValueChange={onSucursalChange}>
          <SelectTrigger className={styles.filterSelect}>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className={styles.filterGroup}>
        <Label className={styles.filterLabel}>Selecciona agente</Label>
        <Select value={agente} onValueChange={onAgenteChange}>
          <SelectTrigger className={styles.filterSelect}>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="button" variant="outline" size="sm" className={outlineBtnClass} onClick={onReset}>
        Reestablecer selección
      </Button>
    </div>
  )
}

/* ── Main Page ── */
export default function VigilanciaPage() {
  const [sucursal, setSucursal] = useState('Todas')
  const [agente, setAgente] = useState('Todas')

  return (
    <div className={styles.page}>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Indicadores de Vigilancia de la salud</h1>
        <Button type="button" variant="default" size="md" className="gap-2">
          Descargar detalle trabajadores
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <p className={styles.pageSubtitle}>
        Monitoreamos la salud de los trabajadores expuestos a riesgos laborales, promoviendo la prevención y el cuidado oportuno.
        Para entender tus indicadores, te recomendamos revisar la sección de <a href="#ayuda" className={styles.link}>Ayuda</a> al final de la página.
      </p>

      {/* ── Alerts ── */}
      <section className={styles.alertsSection}>
        <h2 className={styles.sectionLabel}>
          <Bell className="h-4 w-4" /> Alertas
        </h2>
        <div className={styles.alertsStack}>
          <AlertRed />
          <AlertYellow />
          <AlertInfo />
        </div>
      </section>

      {/* ── Filters ── */}
      <section className={styles.filtersSection}>
        <FilterBar
          sucursal={sucursal}
          agente={agente}
          onSucursalChange={setSucursal}
          onAgenteChange={setAgente}
          onReset={() => {
            setSucursal('Todas')
            setAgente('Todas')
          }}
        />
        <p className={styles.filterNote}>*Podrás seleccionar las sucursales que tienen trabajadores en programa de vigilancia de la salud</p>
      </section>

      {/* ── KPI + Agentes chart row ── */}
      <div className={styles.row}>
        <div className={styles.kpiWrapper}>
          <KpiCard value="882" label="Trabajadores en vigilancia de la salud" />
        </div>
        <ChartCard title="Cantidad de trabajadores por agente de riesgo*">
          <Bar
            data={agentesData}
            options={barOptions('Agentes')}
            height={280}
          />
        </ChartCard>
      </div>

      {/* ── Estado evaluación de salud ── */}
      <ChartCard
        title="Estado de la evaluación de salud de los trabajadores*"
        footnote="*Este gráfico muestra el estado de la evaluación de salud como acción administrativa registrada por la enfermera de vigilancia. Los colores indican si el trabajador está protegido (cotizaciones al día) o no protegido."
      >
        <Bar
          data={evaluacionData}
          options={barOptions('Evaluación')}
          height={320}
        />
      </ChartCard>

      {/* ── Diagnóstico de enfermería ── */}
      <ChartCard
        title="Diagnóstico de enfermería*"
        footnote="*Diagnóstico de enfermería registrado tras la evaluación de salud."
      >
        <Bar
          data={diagnosticoData}
          options={barOptions('Diagnóstico')}
          height={320}
        />
      </ChartCard>

      {/* ── Centro ACHS sedes ── */}
      <ChartCard title="Centro ACHS en el que el trabajador se encuentra en programa de Vigilancia de la Salud">
        <Bar
          data={sedesData}
          options={barOptions('Sedes')}
          height={300}
        />
      </ChartCard>

      {/* ── Información folios INE ── */}
      <section className={styles.ineSection}>
        <h2 className={styles.ineSectionTitle}>Información de folios INEs de tu empresa</h2>
        <Card elevation="sm" className={styles.ineCard}>
          <CardHeader className={styles.ineCardHeader}>
            <CardTitle className={styles.ineCardTitle}>
              Información de trabajadores por puestos de trabajo de tu empresa
            </CardTitle>
          </CardHeader>
          <CardContent className={styles.ineCardBody}>
            <div className={styles.ineContent}>
              <div className={styles.ineLeft}>
                <div className={styles.ineIcon}>📄</div>
                <div className={styles.ineKpi}>
                  <span className={styles.ineValue}>10</span>
                  <span className={styles.ineLabel}>Total puestos de trabajo registrados</span>
                </div>
              </div>
              <div className={styles.ineDivider} />
              <div className={styles.ineRight}>
                <p className={styles.ineDesc}>Revisa el detalle de trabajadores por puestos de trabajo (Folio INE)</p>
                <Button type="button" variant="outline" size="sm" className={cn(outlineBtnClass, "gap-2")}>
                  ↗ Descargar Excel de nómina INE
                </Button>
                <p className={styles.ineWarning}>
                  ¿Ves trabajadores duplicados o asociados a más de un empleador? Revisa cómo validar la información antes de completar la planilla INE
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
