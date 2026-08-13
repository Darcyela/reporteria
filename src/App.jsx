import { useState, useEffect } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { TypographyH2, buttonVariants, cn } from '@achsux/ui'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import VigilanciaPage from './pages/VigilanciaPage'
import AccidentesPage from './pages/AccidentesPage'
import CapacitacionesPage from './pages/CapacitacionesPage'
import EmptySectionPage from './pages/EmptySectionPage'
import { NAV_SECTIONS, ROUTES } from './routes.js'
import { outlineBtnClass } from './uiButton.js'
import './App.css'

function NavChips() {
  return (
    <div className="nav-chips">
      {NAV_SECTIONS.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' }),
              !isActive && outlineBtnClass,
              'gap-2 no-underline',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  )
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => {
      setIsMobile(e.matches)
      if (!e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleToggle = () => {
    if (isMobile) setMobileOpen(o => !o)
    else setCollapsed(c => !c)
  }

  const sidebarMargin = isMobile
    ? '0px'
    : collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'

  return (
    <>
      <Sidebar
        collapsed={isMobile ? false : collapsed}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        onNavigate={() => setMobileOpen(false)}
      />

      {isMobile && mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <Header
        collapsed={isMobile ? false : collapsed}
        onToggle={handleToggle}
      />

      <div
        className="main-content"
        style={{ marginLeft: sidebarMargin, marginTop: 'var(--header-height)' }}
      >
        <div className="page-title-bar">
          <TypographyH2 className="report-title">
            Revisa reportes de Asociación Chilena De Seguridad
          </TypographyH2>
          <NavChips />
        </div>

        <Routes>
          <Route path={ROUTES.home} element={<Navigate to={ROUTES.vigilancia} replace />} />
          <Route path={ROUTES.vigilancia} element={<VigilanciaPage />} />
          <Route path={ROUTES.accidentes} element={<AccidentesPage />} />
          <Route
            path={ROUTES.lgf}
            element={<EmptySectionPage title="Lesiones Graves y Fatales (LGF)" />}
          />
          <Route
            path={ROUTES.gestionRiesgo}
            element={<EmptySectionPage title="Gestión del riesgo" />}
          />
          <Route path={ROUTES.capacitaciones} element={<CapacitacionesPage />} />
          <Route path={ROUTES.capacitacionesV2} element={<CapacitacionesPage />} />
          <Route
            path={ROUTES.acerca}
            element={<EmptySectionPage title="Acerca de reportería" />}
          />
          <Route path="*" element={<Navigate to={ROUTES.vigilancia} replace />} />
        </Routes>
      </div>
    </>
  )
}
