import { useMemo, useState } from 'react'
import { Checkbox, Input, cn } from '@achsux/ui'
import { Filter, Search } from 'lucide-react'
import { EMPRESAS_GRUPO } from '../data/empresasGrupo.js'
import styles from '../pages/AccidentesPage.module.css'

export default function EmpresaGrupoFilter({
  selected,
  onChange,
  countFormat = 'ratio',
  showSelectAll = false,
  variant = 'compact',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const countLabel = countFormat === 'count'
    ? `${selected.length} Empresa(s)`
    : `${selected.length}/${EMPRESAS_GRUPO.length} Empresa (s)`

  const filteredEmpresas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return EMPRESAS_GRUPO
    return EMPRESAS_GRUPO.filter(empresa =>
      empresa.label.toLowerCase().includes(normalizedQuery)
      || empresa.rut.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  const allSelected = EMPRESAS_GRUPO.every(empresa => selected.includes(empresa.id))
  const isSiniestros = variant === 'siniestros'

  function closeDropdown() {
    setOpen(false)
    setQuery('')
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  function toggleAll(checked) {
    onChange(checked ? EMPRESAS_GRUPO.map(empresa => empresa.id) : [])
  }

  return (
    <div
      className={cn(
        isSiniestros ? styles.siniestrosFilterWrap : styles.sectorFilterWrap,
        !isSiniestros && styles.empresaGrupoFilterWrap,
      )}
    >
      <button
        type="button"
        className={isSiniestros ? styles.siniestrosFilterTrigger : styles.sectorFilterTrigger}
        onClick={() => setOpen(openState => !openState)}
        aria-expanded={open}
      >
        <span className={isSiniestros ? styles.siniestrosFilterTriggerText : styles.sectorFilterTriggerText}>
          {countLabel}
        </span>
        <Filter className={isSiniestros ? styles.siniestrosFilterIcon : styles.sectorFilterIcon} aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className={styles.sectorDropdownBackdrop} onClick={closeDropdown} />
          <div
            className={cn(
              isSiniestros ? styles.siniestrosFilterDropdown : styles.sectorDropdown,
              styles.empresaGrupoDropdown,
            )}
          >
            <div className={styles.empresaGrupoSearch}>
              <Input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar empresa..."
                className={styles.empresaGrupoSearchInput}
                aria-label="Buscar empresa"
              />
              <Search className={styles.empresaGrupoSearchIcon} aria-hidden="true" />
            </div>
            <div className={styles.empresaGrupoList}>
              {showSelectAll && (
                <label className={styles.siniestrosFilterOption}>
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  <span>Seleccionar todos</span>
                </label>
              )}
              {filteredEmpresas.map(empresa => (
                <label
                  key={empresa.id}
                  className={isSiniestros ? styles.siniestrosFilterOption : styles.empresaGrupoOption}
                >
                  <Checkbox
                    checked={selected.includes(empresa.id)}
                    onCheckedChange={() => toggle(empresa.id)}
                  />
                  <span>{empresa.rut} - {empresa.label}</span>
                </label>
              ))}
              {filteredEmpresas.length === 0 && (
                <p className={styles.empresaGrupoEmpty}>No se encontraron empresas.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
