import { useMemo, useState } from 'react'
import { Button, Checkbox, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from '@achsux/ui'
import { ChevronDown, Filter, Search } from 'lucide-react'
import styles from '../pages/AccidentesPage.module.css'

/**
 * Filtro multiselección de sucursales con buscador.
 * variant: compact | siniestros | fecha
 */
export default function SucursalSearchFilter({
  selected,
  onChange,
  items = [],
  variant = 'compact',
  showSelectAll = true,
  showLabel = false,
  label = 'Selecciona sucursal',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const countLabel = `${selected.length} Sucursal(es)`

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return items
    return items.filter(item => item.label.toLowerCase().includes(normalizedQuery))
  }, [items, query])

  const allSelected = items.length > 0 && items.every(item => selected.includes(item.id))

  function closeDropdown() {
    setOpen(false)
    setQuery('')
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  function toggleAll(checked) {
    onChange(checked ? items.map(item => item.id) : [])
  }

  if (variant === 'fecha') {
    return (
      <div className={styles.fechaFilterGroup}>
        {showLabel && <Label className={styles.fechaLabel}>{label}</Label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className={styles.fechaMonthControl}>
              <span className={styles.fechaMonthControlText}>{countLabel}</span>
              <ChevronDown className={styles.fechaEmpresaChevron} aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={styles.fechaEmpresaPopover} align="start">
            <div className={styles.empresaGrupoSearch}>
              <Input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar sucursal..."
                className={styles.empresaGrupoSearchInput}
                aria-label="Buscar sucursal"
              />
              <Search className={styles.empresaGrupoSearchIcon} aria-hidden="true" />
            </div>
            <ul className={styles.fechaEmpresaList}>
              {showSelectAll && (
                <li>
                  <label className={styles.fechaEmpresaOption}>
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    <span>Seleccionar todas</span>
                  </label>
                </li>
              )}
              {filteredItems.map(item => (
                <li key={item.id}>
                  <label className={styles.fechaEmpresaOption}>
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onCheckedChange={() => toggle(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                </li>
              ))}
              {filteredItems.length === 0 && (
                <li>
                  <p className={styles.empresaGrupoEmpty}>No se encontraron sucursales.</p>
                </li>
              )}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  const isSiniestros = variant === 'siniestros'
  const wrapClass = isSiniestros
    ? styles.siniestrosFilterWrap
    : cn(styles.sectorFilterWrap, styles.empresaGrupoFilterWrap)
  const triggerClass = isSiniestros ? styles.siniestrosFilterTrigger : styles.sectorFilterTrigger
  const textClass = isSiniestros ? styles.siniestrosFilterTriggerText : styles.sectorFilterTriggerText
  const iconClass = isSiniestros ? styles.siniestrosFilterIcon : styles.sectorFilterIcon
  const dropdownClass = cn(
    isSiniestros ? styles.siniestrosFilterDropdown : styles.sectorDropdown,
    styles.empresaGrupoDropdown,
  )
  const optionClass = isSiniestros ? styles.siniestrosFilterOption : styles.empresaGrupoOption

  return (
    <div className={wrapClass}>
      {showLabel && !isSiniestros && (
        <Label className={styles.sectorFilterLabel}>{label}</Label>
      )}
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen(openState => !openState)}
        aria-expanded={open}
      >
        <span className={textClass}>{countLabel}</span>
        <Filter className={iconClass} aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className={styles.sectorDropdownBackdrop} onClick={closeDropdown} />
          <div className={dropdownClass}>
            <div className={styles.empresaGrupoSearch}>
              <Input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar sucursal..."
                className={styles.empresaGrupoSearchInput}
                aria-label="Buscar sucursal"
              />
              <Search className={styles.empresaGrupoSearchIcon} aria-hidden="true" />
            </div>
            <div className={styles.empresaGrupoList}>
              {showSelectAll && (
                <label className={optionClass}>
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  <span>Seleccionar todas</span>
                </label>
              )}
              {filteredItems.map(item => (
                <label key={item.id} className={optionClass}>
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
              {filteredItems.length === 0 && (
                <p className={styles.empresaGrupoEmpty}>No se encontraron sucursales.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
