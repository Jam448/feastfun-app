'use client'

import { useCallback, useEffect, useState } from 'react'

type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

interface HapticPatterns {
  light: number | number[]
  medium: number | number[]
  heavy: number | number[]
  success: number[]
  warning: number[]
  error: number[]
}

const HAPTIC_PATTERNS: HapticPatterns = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20], // Short, pause, short
  warning: [30, 30, 30], // Three quick pulses
  error: [50, 100, 50],  // Strong, pause, strong
}

export function useHaptics() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if vibration API is supported
    setIsSupported(typeof window !== 'undefined' && 'vibrate' in navigator)
    
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('feastfun_haptics')
      if (saved !== null) {
        setIsEnabled(saved === 'true')
      }
    }
  }, [])

  const trigger = useCallback((intensity: HapticIntensity = 'light') => {
    if (!isEnabled || !isSupported) return false

    try {
      const pattern = HAPTIC_PATTERNS[intensity]
      navigator.vibrate(pattern)
      return true
    } catch (e) {
      console.warn('Haptic feedback failed:', e)
      return false
    }
  }, [isEnabled, isSupported])

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('feastfun_haptics', String(newValue))
      }
      // Give feedback when enabling
      if (newValue && isSupported) {
        navigator.vibrate(10)
      }
      return newValue
    })
  }, [isSupported])

  const enable = useCallback(() => {
    setIsEnabled(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('feastfun_haptics', 'true')
    }
  }, [])

  const disable = useCallback(() => {
    setIsEnabled(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('feastfun_haptics', 'false')
    }
  }, [])

  // Convenience methods for common game events
  const onTap = useCallback(() => trigger('light'), [trigger])
  const onSelect = useCallback(() => trigger('light'), [trigger])
  const onSwap = useCallback(() => trigger('medium'), [trigger])
  const onMatch = useCallback(() => trigger('medium'), [trigger])
  const onCombo = useCallback(() => trigger('heavy'), [trigger])
  const onSpecial = useCallback(() => trigger('heavy'), [trigger])
  const onLevelComplete = useCallback(() => trigger('success'), [trigger])
  const onLevelFail = useCallback(() => trigger('error'), [trigger])
  const onInvalidMove = useCallback(() => trigger('warning'), [trigger])

  return {
    // State
    isEnabled,
    isSupported,
    
    // Core methods
    trigger,
    toggle,
    enable,
    disable,
    
    // Game-specific convenience methods
    onTap,
    onSelect,
    onSwap,
    onMatch,
    onCombo,
    onSpecial,
    onLevelComplete,
    onLevelFail,
    onInvalidMove,
  }
}

// Standalone function for use outside React components
export function triggerHaptic(intensity: HapticIntensity = 'light'): boolean {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return false
  }

  // Check if haptics are enabled
  const saved = localStorage.getItem('feastfun_haptics')
  if (saved === 'false') {
    return false
  }

  try {
    const pattern = HAPTIC_PATTERNS[intensity]
    navigator.vibrate(pattern)
    return true
  } catch (e) {
    return false
  }
}
