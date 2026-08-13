import { Avatar, AvatarFallback, Button, LogoSeguroLaboral, cn } from '@achsux/ui'
import { CircleHelp, Menu } from 'lucide-react'
import { outlineBtnClass } from '../uiButton.js'
import styles from './Header.module.css'

export default function Header({ collapsed, onToggle }) {
  return (
    <header
      className={styles.header}
      style={{
        paddingLeft: collapsed
          ? 'calc(var(--sidebar-collapsed-width) + 16px)'
          : 'calc(var(--sidebar-width) + 16px)',
      }}
    >
      <div className={styles.left}>
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          className="text-[var(--color-text-gray)] hover:bg-transparent hover:text-[var(--color-text-dark)]"
          onClick={onToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {collapsed && (
          <div className={styles.achsLogo}>
            <LogoSeguroLaboral height={28} aria-label="ACHS Seguro Laboral" />
          </div>
        )}
      </div>

      <div className={styles.right}>
        <Button type="button" variant="outline" size="sm" className={cn(outlineBtnClass, 'gap-2')}>
          <CircleHelp className="h-4 w-4" />
          Ayuda
        </Button>
        <span className={styles.userName}>Rita Socorro</span>
        <Avatar className="h-9 w-9 rounded-xl">
          <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
            RS
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
