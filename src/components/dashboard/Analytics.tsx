import React, { useState, useEffect, useCallback } from 'react'
import { Eye, MousePointer, TrendingUp, Users, Calendar, ExternalLink } from 'lucide-react'
import { blink } from '../../blink/client'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  clickThroughRate: number
  topLinks: Array<{
    title: string
    clicks: number
    url: string
  }>
  dailyViews: Array<{
    date: string
    views: number
    clicks: number
  }>
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    clickThroughRate: 0,
    topLinks: [],
    dailyViews: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get user profile
      const user = await blink.auth.me()
      const profiles = await blink.db.profiles.list({
        where: { user_id: user.id },
        limit: 1
      })

      if (profiles.length === 0) {
        setLoading(false)
        return
      }

      const profile = profiles[0]

      // Simulate analytics data (in real app, this would come from analytics events)
      const mockAnalytics: AnalyticsData = {
        totalViews: Math.floor(Math.random() * 1000) + 100,
        totalClicks: Math.floor(Math.random() * 500) + 50,
        clickThroughRate: Math.random() * 20 + 5,
        topLinks: [
          { title: 'Portfolio Website', clicks: 45, url: 'https://portfolio.com' },
          { title: 'LinkedIn Profile', clicks: 32, url: 'https://linkedin.com' },
          { title: 'GitHub Repository', clicks: 28, url: 'https://github.com' },
          { title: 'Contact Email', clicks: 15, url: 'mailto:contact@example.com' }
        ],
        dailyViews: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          views: Math.floor(Math.random() * 50) + 10,
          clicks: Math.floor(Math.random() * 25) + 5
        }))
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, loadAnalytics])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalClicks.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MousePointer className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.clickThroughRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(analytics.totalViews * 0.8).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+15%</span>
            <span className="text-gray-500 ml-1">from last period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Daily Activity
          </h3>
          <div className="space-y-3">
            {analytics.dailyViews.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{day.views} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{day.clicks} clicks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Links */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Top Performing Links
          </h3>
          <div className="space-y-4">
            {analytics.topLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{link.title}</p>
                  <p className="text-sm text-gray-500 truncate">{link.url}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{link.clicks}</p>
                  <p className="text-xs text-gray-500">clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">🚀 Performance</h4>
            <p className="text-sm text-gray-600">Your profile is performing well with a {analytics.clickThroughRate.toFixed(1)}% click-through rate, which is above average!</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">💡 Tip</h4>
            <p className="text-sm text-gray-600">Consider adding more engaging link titles to increase your click-through rate even further.</p>
          </div>
        </div>
      </div>
    </div>
  )
}