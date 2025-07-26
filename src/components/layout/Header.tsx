import { Button } from "@/components/ui/button"
import { Link, User, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { blink } from "@/blink/client"

export function Header() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogin = () => {
    blink.auth.login()
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LinkTree Pro</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">
              Templates
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={handleLogin}>
                  Sign In
                </Button>
                <Button onClick={handleLogin}>
                  Get Started
                </Button>
              </>
            )}
            
            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}