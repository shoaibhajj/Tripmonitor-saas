import { useLanguage } from '../../contexts/LanguageContext'

interface Props {
  minimized: boolean
  onMinimize: () => void
  onClose: () => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
  isDragging: boolean
}

function GripIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="5" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="19" r="1.2" fill="currentColor"/>
      <circle cx="15" cy="5" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="19" r="1.2" fill="currentColor"/>
    </svg>
  )
}
function CtrlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 22, height: 22, borderRadius: 5,
      border: '1px solid var(--border)', background: 'var(--secondary)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--muted-foreground)', transition: 'background 0.12s', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {children}
    </div>
  )
}

export default function LegendCard({ minimized, onMinimize, onClose, dragHandleProps, isDragging }: Props) {
  const { t } = useLanguage()

  const markerStatuses = [
    { color: '#00a385', label: t('status_moving'), desc: t('legend_moving_desc'), pulse: true },
    { color: '#9ca3af', label: t('legend_idle_label'), desc: t('legend_idle_desc'), pulse: false },
    { color: '#ef4444', label: t('legend_offline_label'), desc: t('legend_offline_desc'), pulse: false },
  ]

  const sensorRows = [
    { label: 'Engine Temp', range: `80–100 °C ${t('legend_normal')}` },
    { label: 'Oil Pressure', range: `30–55 psi ${t('legend_normal')}` },
    { label: 'Battery', range: `12.6–14.4 V ${t('legend_healthy')}` },
    { label: 'RPM', range: `600–3000 rpm ${t('legend_typical')}` },
  ]

  return (
    <div style={{
      background: 'color-mix(in srgb, var(--card) 98%, transparent)',
      backdropFilter: 'blur(18px)',
      border: '1px solid var(--border)',
      borderRadius: 11,
      boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.22)' : '0 3px 16px rgba(0,0,0,0.10)',
      overflow: 'hidden',
      opacity: isDragging ? 0.88 : 1,
      transition: 'box-shadow 0.18s, opacity 0.18s',
      animation: 'legend-in 0.2s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <style>{`
        @keyframes legend-in { from { opacity: 0; transform: translateX(12px) scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes legend-pulse { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(1.8); opacity: 0; } }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 8px 8px 6px',
        borderBottom: minimized ? 'none' : '1px solid var(--border)',
      }}>
        <div {...dragHandleProps} style={{ cursor: 'grab', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', padding: '2px', borderRadius: 4, flexShrink: 0, userSelect: 'none', opacity: 0.5, ...dragHandleProps.style }}>
          <GripIcon />
        </div>

        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--foreground)' }}>{t('legend_title')}</div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{t('legend_subtitle')}</div>
        </div>

        <div style={{ display: 'flex', gap: 3 }}>
          <CtrlBtn onClick={onMinimize} title={minimized ? t('ctrl_restore') : t('ctrl_minimize')}>
            {minimized
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          </CtrlBtn>
          <CtrlBtn onClick={onClose} title={t('ctrl_close')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </CtrlBtn>
        </div>
      </div>

      {!minimized && (
        <div style={{ padding: '10px' }}>
          <SectionLabel>{t('legend_markers')}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, marginBottom: 12 }}>
            {markerStatuses.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ position: 'relative', flexShrink: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="20" viewBox="0 0 32 38" fill="none">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 14 22 16 22s16-11.5 16-22C32 7.163 24.837 0 16 0z" fill={s.color}/>
                    <circle cx="16" cy="16" r="5" fill="white" opacity="0.85"/>
                  </svg>
                  {s.pulse && (
                    <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1.5px solid ${s.color}`, animation: 'legend-pulse 2s ease-out infinite', pointerEvents: 'none' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 10 }} />

          <SectionLabel>{t('legend_sensors')}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6, marginBottom: 10 }}>
            {sensorRows.map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--foreground)' }}>{r.label}</span>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{r.range}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 10 }} />

          <SectionLabel>{t('legend_speed_guide')}</SectionLabel>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { color: '#00a385', label: '0–60 km/h', note: t('legend_city') },
              { color: '#f59e0b', label: '60–100 km/h', note: t('legend_highway') },
              { color: '#ef4444', label: '100+ km/h', note: t('legend_highspeed') },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 5, borderRadius: 99, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-mono)', minWidth: 72 }}>{s.label}</span>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
