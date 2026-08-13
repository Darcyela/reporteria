import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LogoSeguroLaboral } from '@achsux/ui'
import { ChevronDown } from 'lucide-react'
import { SIDEBAR_ITEMS } from '../routes.js'
import styles from './Sidebar.module.css'

function hasActiveChild(children, pathname) {
  return children?.some(child => pathname === child.path)
}

function SidebarGroup({ item, showLabel, onNavigate, pathname }) {
  const childActive = hasActiveChild(item.children, pathname)
  const [open, setOpen] = useState(childActive)

  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  return (
    <div className={`${styles.menuGroup} ${childActive ? styles.menuGroupActive : ''}`}>
      <button
        type="button"
        className={`${styles.menuItem} ${styles.menuGroupToggle} ${childActive ? styles.active : ''}`}
        title={!showLabel ? item.label : ''}
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={styles.icon}>{item.icon}</span>
        {showLabel && <span className={styles.label}>{item.label}</span>}
        {showLabel && (
          <ChevronDown
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
        )}
      </button>

      {open && showLabel && (
        <div className={styles.submenu} role="group" aria-label={item.label}>
          {item.children.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              end={child.path === '/capacitaciones'}
              className={({ isActive }) =>
                `${styles.submenuItem} ${isActive ? styles.submenuItemActive : ''}`
              }
              onClick={onNavigate}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}

      {!showLabel && open && (
        <div className={styles.submenuCollapsed} role="group" aria-label={item.label}>
          {item.children.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              end={child.path === '/capacitaciones'}
              title={child.label}
              className={({ isActive }) =>
                `${styles.submenuDot} ${isActive ? styles.submenuDotActive : ''}`
              }
              onClick={onNavigate}
            >
              <span className={styles.srOnly}>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, mobileOpen, isMobile, onNavigate }) {
  const location = useLocation()
  const cls = [
    styles.sidebar,
    collapsed && !isMobile ? styles.collapsed : '',
    isMobile ? styles.mobile : '',
    isMobile && mobileOpen ? styles.mobileOpen : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showLabel = isMobile ? true : !collapsed

  return (
    <aside className={cls}>
      <div className={styles.logoBar}>
        {showLabel ? (
          <LogoSeguroLaboral height={36} aria-label="ACHS Seguro Laboral" />
        ) : (
          <span className={styles.logoAchs}>achs</span>
        )}
      </div>
      <div className={styles.menuList}>
        {SIDEBAR_ITEMS.map((item, i) => {
          if (item.children?.length) {
            return (
              <SidebarGroup
                key={i}
                item={item}
                showLabel={showLabel}
                onNavigate={onNavigate}
                pathname={location.pathname}
              />
            )
          }

          const content = (
            <>
              <span className={styles.icon}>{item.icon}</span>
              {showLabel && <span className={styles.label}>{item.label}</span>}
            </>
          )

          if (!item.path) {
            return (
              <div key={i} className={styles.menuItem} title={!showLabel ? item.label : ''}>
                {content}
              </div>
            )
          }

          return (
            <NavLink
              key={i}
              to={item.path}
              title={!showLabel ? item.label : ''}
              className={({ isActive }) => `${styles.menuItem} ${isActive ? styles.active : ''}`}
              onClick={onNavigate}
            >
              {content}
            </NavLink>
          )
        })}
      </div>
      <div className={styles.footer}>
        {showLabel && <span className={styles.companyName}>Empresa demo</span>}
      </div>
    </aside>
  )
}
