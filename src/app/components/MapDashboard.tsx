import { useState, useCallback } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MapCanvas from './MapCanvas'
import BottomSheet from './BottomSheet'
import FABStack from './FABStack'
import LeftPanelStack from './LeftPanelStack'
import RightCardStack from './RightCardStack'
import { Vehicle, vehicles as allVehicles } from '../data/vehicles'
import { LeftPanel, RightCard, FABType, FleetFilter, defaultFilter } from '../types'
import { useTheme } from '../../contexts/ThemeContext'

export default function MapDashboard() {
  const { darkMode } = useTheme()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false)
  const [bottomSheetHeight, setBottomSheetHeight] = useState<'peek' | 'mid' | 'full'>('peek')

  const [leftPanels, setLeftPanels] = useState<LeftPanel[]>([])
  const [rightCards, setRightCards] = useState<RightCard[]>([])

  const [filter, setFilter] = useState<FleetFilter>(defaultFilter)

  // Bring vehicle card to top of stack without re-adding
  const openVehicleCard = useCallback((vehicle: Vehicle) => {
    setRightCards(prev => {
      const existing = prev.find(c => c.type === 'vehicle' && c.vehicleId === vehicle.id)
      if (existing) {
        return [{ ...existing, minimized: false }, ...prev.filter(c => c.id !== existing.id)]
      }
      return [{
        id: `v-${vehicle.id}-${Date.now()}`,
        type: 'vehicle' as const,
        vehicleId: vehicle.id,
        minimized: false,
        expanded: false,
      }, ...prev]
    })
  }, [])

  // Full vehicle select: from marker or list click — opens card AND bottom sheet
  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setBottomSheetVisible(true)
    setBottomSheetHeight('peek')
    openVehicleCard(vehicle)
  }, [openVehicleCard])

  // Card activate: clicking an existing card updates focus + bottom sheet WITHOUT re-sorting stack
  const handleCardActivate = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setBottomSheetVisible(true)
    setBottomSheetHeight('peek')
  }, [])

  const handleBottomSheetClose = useCallback(() => {
    setBottomSheetVisible(false)
    setSelectedVehicle(null)
  }, [])

  const openFilterCard = useCallback(() => {
    setRightCards(prev => {
      const existing = prev.find(c => c.type === 'filter')
      if (existing) return [{ ...existing, minimized: false }, ...prev.filter(c => c.id !== existing.id)]
      return [{
        id: `filter-${Date.now()}`,
        type: 'filter' as const,
        minimized: false,
        expanded: false,
      }, ...prev]
    })
  }, [])

  const handleFABClick = useCallback((type: FABType) => {
    if (type === 'vehicles') {
      setLeftPanels(prev => {
        const existing = prev.find(p => p.type === 'vehicles')
        if (existing) return prev.filter(p => p.id !== existing.id)
        return [...prev, { id: `vehicles-${Date.now()}`, type: 'vehicles' as const }]
      })
    } else if (type === 'legend') {
      setRightCards(prev => {
        const existing = prev.find(c => c.type === 'legend')
        if (existing) return prev.filter(c => c.id !== existing.id)
        return [{ id: `legend-${Date.now()}`, type: 'legend' as const, minimized: false, expanded: false }, ...prev]
      })
    }
  }, [])

  const vehiclesPanelOpen = leftPanels.some(p => p.type === 'vehicles')
  const legendCardOpen = rightCards.some(c => c.type === 'legend')
  const filterCardOpen = rightCards.some(c => c.type === 'filter')
  const activeBottomHeight = bottomSheetVisible ? bottomSheetHeight : 'peek'

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--background)' }}>
      <Sidebar activeRoute="map" />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapCanvas
          vehicles={allVehicles}
          selectedVehicle={selectedVehicle}
          onVehicleSelect={handleVehicleSelect}
          darkMode={darkMode}
        />

        <TopBar
          vehicles={allVehicles}
          onVehicleSelect={handleVehicleSelect}
          onOpenFilter={openFilterCard}
          filterActive={filterCardOpen}
        />

        <FABStack
          vehiclesPanelOpen={vehiclesPanelOpen}
          legendCardOpen={legendCardOpen}
          onOpen={handleFABClick}
        />

        <LeftPanelStack
          panels={leftPanels}
          onPanelsChange={setLeftPanels}
          vehicles={allVehicles}
          onVehicleSelect={handleVehicleSelect}
          bottomSheetHeight={activeBottomHeight}
          filter={filter}
        />

        <RightCardStack
          cards={rightCards}
          onCardsChange={setRightCards}
          bottomSheetHeight={activeBottomHeight}
          focusedVehicleId={selectedVehicle?.id}
          onVehicleActivate={handleCardActivate}
          filter={filter}
          onFilterChange={setFilter}
        />

        {bottomSheetVisible && selectedVehicle && (
          <BottomSheet
            vehicle={selectedVehicle}
            height={bottomSheetHeight}
            onHeightChange={setBottomSheetHeight}
            onClose={handleBottomSheetClose}
          />
        )}
      </div>
    </div>
  )
}
