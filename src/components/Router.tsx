import React, { useState, useEffect } from 'react'
import LiveProfilePage from './profile/LiveProfilePage'

interface RouterProps {
  children: React.ReactNode
}

export default function Router({ children }: RouterProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Check if this is a profile page (starts with /@)
  if (currentPath.startsWith('/@')) {
    const username = currentPath.slice(2) // Remove /@
    return <LiveProfilePage username={username} />
  }

  // Check if this is a profile page (just /username)
  if (currentPath !== '/' && !currentPath.includes('.') && currentPath.split('/').length === 2) {
    const username = currentPath.slice(1) // Remove /
    return <LiveProfilePage username={username} />
  }

  // Default to main app
  return <>{children}</>
}