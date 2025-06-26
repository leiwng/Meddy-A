'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface SettingContextType {
  collapsed: boolean
  toggleCollapsed: () => void
  setCollapsed: (value: boolean) => void
  isMobile: boolean
  setIsMobile: (value: boolean) => void
}

const SettingContext = createContext<SettingContextType>({
  collapsed: false,
  toggleCollapsed: () => {},
  setCollapsed: () => {},
  isMobile: false,
  setIsMobile: () => {},
})

export const SettingProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkMobile = () => {
      const is = window.innerWidth <= 768;
      setIsMobile(is)
      if (is) {
        setCollapsed(true);
      }
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev)
  }

  return (
    <SettingContext.Provider
    value={{
      collapsed,
      toggleCollapsed,
      setCollapsed,
      isMobile,
      setIsMobile,
    }}
    >
      {children}
    </SettingContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingProvider')
  }
  return context
}