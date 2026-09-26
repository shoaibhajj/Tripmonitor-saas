import { useState, useRef, useCallback } from 'react'
import { LeftPanel, FleetFilter } from '../types'
import { Vehicle } from '../data/vehicles'
import VehicleListPanel from './VehicleListPanel'
import { useLanguage } from '../../contexts/LanguageContext'

interface Props {
  panels: LeftPanel[]
  onPanelsChange: (panels: LeftPanel[]) => void
  vehicles: Vehicle[]
  onVehicleSelect: (v: Vehicle) => void
  bottomSheetHeight: 'peek' | 'mid' | 'full'
  filter: FleetFilter
}

const SHEET_BOTTOM: Record<string, number> = { peek: 68, mid: 268, full: 488 }

export default function LeftPanelStack({ panels, onPanelsChange, vehicles, onVehicleSelect, bottomSheetHeight, filter }: Props) {
  const { isRTL } = useLanguage()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragAllowed = useRef(false)

  const removePanel = useCallback((id: string) => {
    onPanelsChange(panels.filter(p => p.id !== id))
  }, [panels, onPanelsChange])

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!dragAllowed.current) { e.preventDefault(); return }
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!draggingId || draggingId === id) return
    const fromIdx = panels.findIndex(p => p.id === draggingId)
    const toIdx = panels.findIndex(p => p.id === id)
    if (fromIdx === toIdx) return
    const next = [...panels]
    const [item] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, item)
    onPanelsChange(next)
  }, [panels, draggingId, onPanelsChange])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    dragAllowed.current = false
  }, [])

  if (!panels.length) return null

  return (
    <div style={{
      position: 'absolute',
      top: 72,
      left: isRTL ? undefined : 118,
      right: isRTL ? 118 : undefined,
      bottom: SHEET_BOTTOM[bottomSheetHeight] + 4,
      width: 272,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 25,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: 4,
    }}>
      {panels.map(panel => (
        <div
          key={panel.id}
          draggable
          onDragStart={e => handleDragStart(e, panel.id)}
          onDragOver={e => handleDragOver(e, panel.id)}
          onDragEnd={handleDragEnd}
          style={{ flexShrink: 0, opacity: draggingId === panel.id ? 0.45 : 1, transition: 'opacity 0.15s' }}
        >
          {panel.type === 'vehicles' && (
            <VehicleListPanel
              vehicles={vehicles}
              filter={filter}
              onVehicleSelect={v => { onVehicleSelect(v) }}
              onClose={() => removePanel(panel.id)}
              isDragging={draggingId === panel.id}
              dragHandleProps={{
                onMouseDown: () => { dragAllowed.current = true },
                onMouseUp: () => { dragAllowed.current = false },
                style: {},
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
