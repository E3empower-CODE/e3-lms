import { Hammer } from 'lucide-react'
import { EmptyState } from '../EmptyState/EmptyState'
import { Card } from '../Card/Card'

/**
 * Stand-in for a route whose feature ships in a later phase. Keeps every
 * declared route reachable (and the four-data-state pattern visible) without
 * pretending data exists yet.
 */
export function PlaceholderPage({ title, phase, description }) {
  return (
    <Card title={title}>
      <EmptyState
        icon={Hammer}
        title={phase ? `Planned for ${phase}` : 'Coming soon'}
        description={
          description ||
          'This area is part of the phased roadmap in FRONTEND_PLAN.md and will be built in a later phase.'
        }
      />
    </Card>
  )
}
