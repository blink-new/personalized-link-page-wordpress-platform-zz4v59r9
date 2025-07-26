import React, { useState, useEffect, useCallback } from 'react'
import { User, Link, BarChart3, Settings, LogOut, Home, Eye, Image } from 'lucide-react'
import { blink } from '../../blink/client'
import Analytics from './Analytics'
import ProfileEditor from './ProfileEditor'
import LinkManager from './LinkManager'
import ContentManager from './ContentManager'

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string
  profile_image: string
  template: string
  primary_color: string
  background_color: string
  text_color: string
  is_rtl: boolean
  user_id: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const profiles = await blink.db.profiles.list({
        where: { user_id: user.id },
        limit: 1
      })

      if (profiles.length > 0) {
        setProfile(profiles[0] as Profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'links', label: 'Links', icon: Link },
    { id: 'content', label: 'Content', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-white rounded opacity-90" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">LinkTree Pro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {profile && (
                <a
                  href={`/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Page</span>
                </a>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                    <p className="text-gray-600">Welcome to your LinkTree Pro dashboard!</p>
                  </div>

                  {profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Your Profile</h3>
                        <p className="text-sm text-gray-600 mb-4">@{profile.username}</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{profile.display_name}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Template</h3>
                        <p className="text-sm text-gray-600 mb-4">Current design</p>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: profile.primary_color }}
                          >
                            <div className="w-4 h-4 bg-white rounded opacity-90" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{profile.template}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
                        <p className="text-sm text-gray-600 mb-4">Manage your page</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => setActiveTab('profile')}
                            className="w-full text-left text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit Profile →
                          </button>
                          <button
                            onClick={() => setActiveTab('links')}
                            className="w-full text-left text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Manage Links →
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Profile</h3>
                      <p className="text-gray-600 mb-6">Get started by setting up your personalized link page.</p>
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Create Profile
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && <ProfileEditor />}

              {activeTab === 'links' && <LinkManager />}

              {activeTab === 'content' && <ContentManager />}

              {activeTab === 'analytics' && <Analytics />}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Account Settings</h3>
                    <p className="text-gray-600">Settings panel coming soon!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}