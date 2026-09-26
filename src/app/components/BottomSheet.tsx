import { useState, useRef, useCallback } from 'react'
import { Vehicle } from '../data/vehicles'
import { useLanguage } from '../../contexts/LanguageContext'
import SpeedGauge from './SpeedGauge'
import FuelGauge from './FuelGauge'

interface Props {
  vehicle: Vehicle
  height: 'peek' | 'mid' | 'full'
  onHeightChange: (h: 'peek' | 'mid' | 'full') => void
  onClose: () => void
}

const HEIGHTS: Record<string, number> = { peek: 60, mid: 270, full: 490 }

const statusCfg: Record<string, { color: string }> = {
  moving: { color: '#16a34a' },
  idle:   { color: '#9ca3af' },
  offline:{ color: '#ef4444' },
}

type TabId = 'trip' | 'vehicle' | 'sensors' | 'history'

function TripTab({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLanguage()
  const speed = vehicle.status === 'moving' ? vehicle.speed : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <SpeedGauge speed={speed} maxSpeed={120} size={128} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: t('lbl_distance'), value: vehicle.status !== 'offline' ? `${vehicle.tripDistance}` : '—', unit: 'km' },
            { label: t('lbl_duration'), value: vehicle.tripDuration, unit: '' },
            { label: t('lbl_started'), value: vehicle.tripStart, unit: '' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--secondary)', borderRadius: 8, padding: '8px 11px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                {s.value}
                {s.unit && <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted-foreground)', marginLeft: 2 }}>{s.unit}</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--secondary)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{t('lbl_location')}</div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--foreground)' }}>{vehicle.location}</div>
        </div>
      </div>
    </div>
  )
}

function VehicleInfoTab({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLanguage()
  const statusLabel: Record<string, string> = { moving: t('status_moving'), idle: t('status_idle'), offline: t('status_offline') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: t('lbl_vehicle_name'), value: vehicle.name },
          { label: t('lbl_plate'), value: vehicle.plate },
          { label: t('lbl_driver'), value: vehicle.driver },
          { label: t('lbl_status'), value: statusLabel[vehicle.status] },
          { label: t('lbl_odometer'), value: `${vehicle.odometer.toLocaleString()} km` },
          { label: t('lbl_engine_hours'), value: `${vehicle.engineHours.toLocaleString()} h` },
          { label: t('lbl_last_update'), value: vehicle.lastUpdate },
          { label: 'Zone', value: vehicle.zone },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--secondary)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--foreground)' }}>{item.value}</div>
          </div>
        ))}
      </div>
      <FuelGauge level={vehicle.fuelLevel} showLabel />
    </div>
  )
}

function SensorsTab({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {vehicle.sensors.map(sensor => {
        const isNA = sensor.value === 'N/A'
        const pct = !isNA && sensor.current !== undefined && sensor.max
          ? Math.max(0, Math.min(100, ((sensor.current! - (sensor.min || 0)) / ((sensor.max || 100) - (sensor.min || 0))) * 100))
          : 0
        const barColor = pct > 80 ? '#ef4444' : pct > 55 ? '#f59e0b' : '#16a34a'

        return (
          <div key={sensor.label} style={{ background: 'var(--secondary)', borderRadius: 8, padding: '12px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 7 }}>
              {sensor.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 9 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: isNA ? 'var(--muted-foreground)' : 'var(--foreground)', fontFamily: 'var(--font-mono)' }}>
                {sensor.value}
              </span>
              {sensor.unit && !isNA && (
                <span style={{ fontSize: 11.5, color: 'var(--muted-foreground)', fontWeight: 500 }}>{sensor.unit}</span>
              )}
            </div>
            <div style={{ height: 4, background: 'var(--muted)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: isNA ? 'var(--muted)' : barColor, borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
            {sensor.min !== undefined && sensor.max !== undefined && !isNA && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 9.5, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{sensor.min}</span>
                <span style={{ fontSize: 9.5, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{sensor.max}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function HistoryTab({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLanguage()
  if (!vehicle.tripHistory.length) {
    return <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-foreground)', fontSize: 13.5 }}>{t('no_history')}</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {vehicle.tripHistory.map((point, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < vehicle.tripHistory.length - 1 ? 12 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === vehicle.tripHistory.length - 1 ? 'var(--primary)' : 'var(--border)', border: `2px solid ${i === vehicle.tripHistory.length - 1 ? 'var(--primary)' : 'var(--border)'}`, marginTop: 2 }} />
            {i < vehicle.tripHistory.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', minHeight: 20, marginTop: 2 }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 1 }}>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--muted-foreground)' }}>{point.time}</span>
              <span style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>·</span>
              <span style={{ fontSize: 11.5, color: point.speed > 0 ? 'var(--primary)' : 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                {point.speed} km/h
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{point.location}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BottomSheet({ vehicle, height, onHeightChange, onClose }: Props) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabId>('trip')
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef<number | null>(null)
  const dragStartHeight = useRef<string>('peek')

  const cfg = statusCfg[vehicle.status]
  const currentH = HEIGHTS[height]

  const tabs: { id: TabId; label: string }[] = [
    { id: 'trip', label: t('tab_trip') },
    { id: 'vehicle', label: t('tab_vehicle') },
    { id: 'sensors', label: t('tab_sensors') },
    { id: 'history', label: t('tab_history') },
  ]

  const cycleHeight = () => {
    if (height === 'peek') onHeightChange('mid')
    else if (height === 'mid') onHeightChange('full')
    else onHeightChange('mid')
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartY.current = e.clientY
    dragStartHeight.current = height
    setIsDragging(true)
    setDragOffset(0)
  }, [height])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartY.current === null) return
    setDragOffset(dragStartY.current - e.clientY)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartY.current === null) return
    const delta = dragStartY.current - e.clientY
    const startH = dragStartHeight.current as 'peek' | 'mid' | 'full'
    if (delta > 40) {
      if (startH === 'peek') onHeightChange('mid')
      else if (startH === 'mid') onHeightChange('full')
    } else if (delta < -40) {
      if (startH === 'full') onHeightChange('mid')
      else if (startH === 'mid') onHeightChange('peek')
      else onClose()
    }
    dragStartY.current = null
    setIsDragging(false)
    setDragOffset(0)
  }, [onHeightChange, onClose])

  const displayH = Math.max(HEIGHTS.peek, Math.min(HEIGHTS.full, currentH + (isDragging ? dragOffset : 0)))
  const showContent = height !== 'peek' || (isDragging && displayH > HEIGHTS.peek + 36)

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: isDragging ? displayH : currentH,
      background: 'color-mix(in srgb, var(--card) 97%, transparent)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      borderRadius: '14px 14px 0 0',
      boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
      zIndex: 30,
      display: 'flex', flexDirection: 'column',
      transition: isDragging ? 'none' : 'height 0.32s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>
      {/* Drag handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0 5px', cursor: 'grab', flexShrink: 0, userSelect: 'none', touchAction: 'none' }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${cfg.color}18`, borderRadius: 99, padding: '2px 9px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t(`status_${vehicle.status}` as any)}
            </span>
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--foreground)' }}>{vehicle.name}</span>
          <span style={{ fontSize: 12.5, color: 'var(--muted-foreground)' }}>{vehicle.plate}</span>
          {vehicle.status === 'moving' && (
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {vehicle.speed} <span style={{ fontSize: 10.5, fontWeight: 500 }}>km/h</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={cycleHeight} title={height === 'full' ? t('ctrl_collapse') : t('ctrl_expand')} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            {height === 'full'
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            }
          </button>
          <button onClick={onClose} title={t('ctrl_dismiss')} style={{ width: 29, height: 29, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs + content — rendered as soon as drag height exceeds peek */}
      {showContent && (
        <>
          <div style={{ display: 'flex', padding: '0 14px', borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '8px 13px',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s', marginBottom: -1,
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '14px' }}>
            {activeTab === 'trip' && <TripTab vehicle={vehicle} />}
            {activeTab === 'vehicle' && <VehicleInfoTab vehicle={vehicle} />}
            {activeTab === 'sensors' && <SensorsTab vehicle={vehicle} />}
            {activeTab === 'history' && <HistoryTab vehicle={vehicle} />}
          </div>
        </>
      )}
    </div>
  )
}
