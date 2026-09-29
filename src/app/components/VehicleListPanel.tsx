import { useState } from 'react'
import { Vehicle } from '../data/vehicles'
import { FleetFilter } from '../types'
import { useLanguage } from '../../contexts/LanguageContext'

interface Props {
  vehicles: Vehicle[]
  filter: FleetFilter
  onVehicleSelect: (v: Vehicle) => void
  onClose: () => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
  isDragging: boolean
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  moving:  { color: '#00a385', bg: 'rgba(0,163,133,0.10)' },
  idle:    { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  offline: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
}

type FilterStatus = 'all' | 'moving' | 'idle' | 'offline'

export default function VehicleListPanel({ vehicles, filter, onVehicleSelect, onClose, dragHandleProps, isDragging }: Props) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  const filtered = vehicles.filter(v => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    const q = query.toLowerCase()
    const matchesQuery = !q || v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q)
    // Apply global fleet filter
    const matchesGlobalStatus = filter.statuses.length === 0 || filter.statuses.includes(v.status)
    const matchesType = filter.types.length === 0 || filter.types.includes(v.vehicleType)
    const matchesZone = filter.zones.length === 0 || filter.zones.includes(v.zone)
    const matchesFuel = v.fuelLevel >= filter.minFuel
    const matchesDriver = filter.driversOnly === 'all'
      || (filter.driversOnly === 'assigned' && v.driver !== 'Unassigned')
      || (filter.driversOnly === 'unassigned' && v.driver === 'Unassigned')
    return matchesStatus && matchesQuery && matchesGlobalStatus && matchesType && matchesZone && matchesFuel && matchesDriver
  })

  const filterChips: { status: FilterStatus; labelKey: 'filter_all' | 'filter_moving' | 'filter_idle' | 'filter_offline' }[] = [
    { status: 'all', labelKey: 'filter_all' },
    { status: 'moving', labelKey: 'filter_moving' },
    { status: 'idle', labelKey: 'filter_idle' },
    { status: 'offline', labelKey: 'filter_offline' },
  ]

  return (
    <div style={{
      background: 'color-mix(in srgb, var(--card) 98%, transparent)',
      backdropFilter: 'blur(18px)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.22)' : '0 4px 20px rgba(0,0,0,0.10)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      maxHeight: '100%',
      opacity: isDragging ? 0.92 : 1,
      transition: 'box-shadow 0.18s, opacity 0.18s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 10px 9px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div {...dragHandleProps} style={{ cursor: 'grab', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', padding: '2px 3px', borderRadius: 4, flexShrink: 0, userSelect: 'none', ...dragHandleProps.style }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
            <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
            <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            {t('vehicles_panel_title')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
            {filtered.length} {t('vehicles_of')} {vehicles.length}
          </div>
        </div>

        <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 10px 6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--secondary)', borderRadius: 7, padding: '5px 9px', border: '1px solid var(--border)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search_name_plate')}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 4, padding: '0 10px 8px', flexShrink: 0, overflowX: 'auto' }}>
        {filterChips.map(f => {
          const cfg = f.status !== 'all' ? statusConfig[f.status] : null
          const count = f.status === 'all' ? vehicles.length : vehicles.filter(v => v.status === f.status).length
          const isActive = statusFilter === f.status
          return (
            <button key={f.status} onClick={() => setStatusFilter(f.status)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 99,
              border: `1px solid ${isActive ? (cfg?.color || 'var(--primary)') : 'transparent'}`,
              background: isActive ? (cfg ? cfg.bg : 'color-mix(in srgb, var(--primary) 10%, transparent)') : 'var(--secondary)',
              color: isActive ? (cfg?.color || 'var(--primary)') : 'var(--muted-foreground)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              {cfg && <div style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />}
              {t(f.labelKey)}
              <span style={{ opacity: 0.7 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Vehicle list */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 12 }}>
            {t('no_vehicles')}
          </div>
        ) : filtered.map((v, i) => {
          const cfg = statusConfig[v.status]
          return (
            <button
              key={v.id}
              onClick={() => onVehicleSelect(v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'transparent', border: 'none', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--secondary)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: v.status === 'moving' ? `0 0 6px ${cfg.color}90` : 'none', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.driver !== 'Unassigned' ? v.driver : t('no_driver')} · {v.plate}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {v.status === 'moving' && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)' }}>
                    {v.speed}<span style={{ fontSize: 9, fontWeight: 500, marginLeft: 1 }}>{t('kmh')}</span>
                  </div>
                )}
                {v.status === 'idle' && <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{t('status_idle')}</div>}
                {v.status === 'offline' && <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{t('status_offline')}</div>}
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{v.lastUpdate}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
