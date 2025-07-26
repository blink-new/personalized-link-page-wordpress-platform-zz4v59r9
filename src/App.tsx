import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Header } from './components/layout/Header'
import { Hero } from './components/sections/Hero'
import { Features } from './components/sections/Features'
import { Templates } from './components/sections/Templates'
import { Pricing } from './components/sections/Pricing'
import { Footer } from './components/layout/Footer'
import { Toaster } from './components/ui/toaster'
import Dashboard from './components/dashboard/Dashboard'
import Router from './components/Router'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  return (
    <Router>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-white rounded opacity-50" />
            </div>
            <p className="text-gray-600">Loading LinkTree Pro...</p>
          </div>
        </div>
      ) : user ? (
        // User is authenticated - show dashboard
        <>
          <Dashboard />
          <Toaster />
        </>
      ) : (
        // User is not authenticated - show landing page
        <div className="min-h-screen">
          <Header />
          <main>
            <Hero />
            <Features />
            <Templates />
            <Pricing />
          </main>
          <Footer />
          <Toaster />
        </div>
      )}
    </Router>
  )
}

export default App