import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@achsux/ui'

export default function EmptySectionPage({ title }) {
  return (
    <div className="empty-tab">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>
            Sección sin contenido en esta demo.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
