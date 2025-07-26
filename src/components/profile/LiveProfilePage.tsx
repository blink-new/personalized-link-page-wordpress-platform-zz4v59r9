import React, { useState, useEffect, useCallback } from 'react'
import { ExternalLink, Instagram, Twitter, Linkedin, Github, Mail, Phone, Globe, MapPin, Image as ImageIcon } from 'lucide-react'
import { blink } from '../../blink/client'

interface ProfileData {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
  template: string
  primary_color: string
  background_color: string
  font_family: string
  font_size: string
  page_width: string
  is_rtl: boolean
  user_id: string
}

interface LinkData {
  id: string
  title: string
  url: string
  icon: string
  icon_style: string
  custom_icon_url?: string
  description?: string
  is_active: string
  position: number
  user_id: string
}

interface ContentBlock {
  id: string
  user_id: string
  type: string
  title: string
  content: string
  position: number
  is_active: string
}

interface LiveProfilePageProps {
  username: string
}

const socialIcons = {
  instagram: Instagram,
  x: Twitter,
  twitter: Twitter, // للتوافق مع البيانات القديمة
  linkedin: Linkedin,
  github: Github,
  email: Mail,
  phone: Phone,
  website: Globe,
  location: MapPin
}

const getFontSizeClass = (size: string) => {
  const sizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  }
  return sizes[size as keyof typeof sizes] || sizes.medium
}

const getPageWidthClass = (width: string) => {
  const widths = {
    narrow: 'max-w-sm mx-auto',
    normal: 'max-w-md mx-auto',
    wide: 'max-w-lg mx-auto',
    full: 'max-w-4xl mx-auto'
  }
  return widths[width as keyof typeof widths] || widths.normal
}

const getTemplateBackground = (template: string) => {
  const backgrounds = {
    designer: 'bg-gradient-to-br from-purple-50 to-pink-50',
    developer: 'bg-gradient-to-br from-gray-900 to-gray-800',
    doctor: 'bg-gradient-to-br from-green-50 to-blue-50',
    trainer: 'bg-gradient-to-br from-orange-50 to-red-50',
    business: 'bg-gradient-to-br from-gray-50 to-blue-50',
    artist: 'bg-gradient-to-br from-purple-50 to-pink-50',
    photographer: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    writer: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    chef: 'bg-gradient-to-br from-red-50 to-orange-50',
    musician: 'bg-gradient-to-br from-purple-50 to-blue-50',
    teacher: 'bg-gradient-to-br from-green-50 to-teal-50',
    influencer: 'bg-gradient-to-br from-pink-50 to-purple-50'
  }
  return backgrounds[template as keyof typeof backgrounds] || backgrounds.designer
}

export default function LiveProfilePage({ username }: LiveProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [links, setLinks] = useState<LinkData[]>([])
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load profile data
      const profileData = await blink.db.profiles.list({
        where: { username },
        limit: 1
      })

      console.log('Profile data found:', profileData)

      if (profileData.length === 0) {
        setError('Profile not found')
        return
      }

      const userProfile = profileData[0] as ProfileData
      setProfile(userProfile)

      // Load links
      const linksData = await blink.db.links.list({
        where: { 
          user_id: userProfile.user_id,
          is_active: "1"
        },
        orderBy: { position: 'asc' }
      })

      setLinks(linksData as LinkData[])

      // Load content blocks (images and text boxes)
      const contentData = await blink.db.contentBlocks.list({
        where: { 
          user_id: userProfile.user_id,
          is_active: "1"
        },
        orderBy: { position: 'asc' }
      })

      setContentBlocks(contentData as ContentBlock[])

      // Track page view
      await blink.analytics.log('profile_view', {
        profile_id: userProfile.id,
        username: username,
        template: userProfile.template
      })

    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleLinkClick = async (link: LinkData) => {
    // Track link click
    await blink.analytics.log('link_click', {
      link_id: link.id,
      link_title: link.title,
      profile_id: profile?.id,
      username: username
    })

    // Open link
    window.open(link.url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">الملف الشخصي غير موجود</h1>
          <p className="text-gray-600">الملف الشخصي الذي تبحث عنه غير موجود.</p>
        </div>
      </div>
    )
  }

  const containerClass = profile.is_rtl ? 'rtl' : 'ltr'
  const backgroundStyle = getTemplateBackground(profile.template)
  const isDarkTemplate = profile.template === 'developer'
  const fontSizeClass = getFontSizeClass(profile.font_size || 'medium')
  const pageWidthClass = getPageWidthClass(profile.page_width || 'normal')

  return (
    <div 
      className={`min-h-screen ${backgroundStyle} ${containerClass}`} 
      dir={profile.is_rtl ? 'rtl' : 'ltr'}
      style={{ 
        backgroundColor: profile.background_color || undefined,
        fontFamily: profile.font_family || 'Inter, sans-serif'
      }}
    >
      <div className={`px-4 py-8 ${pageWidthClass}`}>
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile.avatar_url && (
            <div className="mb-6">
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 shadow-xl"
                style={{ borderColor: profile.primary_color || '#6366F1' }}
              />
            </div>
          )}
          
          <h1 
            className={`text-3xl font-bold mb-4 ${isDarkTemplate ? 'text-white' : 'text-gray-800'} ${fontSizeClass}`}
            style={{ 
              color: profile.primary_color || '#6366F1',
              fontFamily: profile.font_family || 'Inter, sans-serif'
            }}
          >
            {profile.display_name}
          </h1>
          
          {profile.bio && (
            <p 
              className={`leading-relaxed mb-6 ${isDarkTemplate ? 'text-gray-300' : 'text-gray-600'} ${fontSizeClass}`}
              style={{ fontFamily: profile.font_family || 'Inter, sans-serif' }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Content Blocks (Images and Text) */}
        {contentBlocks.length > 0 && (
          <div className="mb-8 space-y-6">
            {contentBlocks.map((block) => (
              <div key={block.id} className="w-full">
                {block.type === 'image' && (
                  <div className="text-center">
                    {block.title && (
                      <h3 
                        className={`text-lg font-semibold mb-3 ${isDarkTemplate ? 'text-white' : 'text-gray-800'} ${fontSizeClass}`}
                        style={{ 
                          color: profile.primary_color || '#6366F1',
                          fontFamily: profile.font_family || 'Inter, sans-serif'
                        }}
                      >
                        {block.title}
                      </h3>
                    )}
                    <img
                      src={block.content}
                      alt={block.title || 'Image'}
                      className="w-full rounded-xl shadow-lg object-cover max-h-80"
                    />
                  </div>
                )}
                
                {block.type === 'text' && (
                  <div 
                    className="p-6 rounded-xl shadow-lg backdrop-blur-sm"
                    style={{ 
                      backgroundColor: `${profile.primary_color}10`,
                      borderLeft: `4px solid ${profile.primary_color}`
                    }}
                  >
                    {block.title && (
                      <h3 
                        className={`text-lg font-semibold mb-3 ${isDarkTemplate ? 'text-white' : 'text-gray-800'} ${fontSizeClass}`}
                        style={{ 
                          color: profile.primary_color || '#6366F1',
                          fontFamily: profile.font_family || 'Inter, sans-serif'
                        }}
                      >
                        {block.title}
                      </h3>
                    )}
                    <div 
                      className={`prose prose-sm max-w-none leading-relaxed ${isDarkTemplate ? 'text-gray-300 prose-invert' : 'text-gray-700'} ${fontSizeClass}`}
                      style={{ fontFamily: profile.font_family || 'Inter, sans-serif' }}
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  </div>
                )}

                {block.type === 'gallery' && (
                  <div className="text-center">
                    {block.title && (
                      <h3 
                        className={`text-lg font-semibold mb-4 ${isDarkTemplate ? 'text-white' : 'text-gray-800'} ${fontSizeClass}`}
                        style={{ 
                          color: profile.primary_color || '#6366F1',
                          fontFamily: profile.font_family || 'Inter, sans-serif'
                        }}
                      >
                        {block.title}
                      </h3>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {JSON.parse(block.content || '[]').map((imageUrl: string, index: number) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-32 rounded-lg shadow-md object-cover cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="space-y-4 mb-8">
          {links.map((link) => {
            const renderLinkIcon = () => {
              if (link.icon === 'custom' && link.custom_icon_url) {
                return (
                  <img 
                    src={link.custom_icon_url} 
                    alt={link.title}
                    className={`w-6 h-6 object-cover group-hover:scale-110 transition-transform ${
                      link.icon_style === 'rounded' ? 'rounded-full' : 
                      link.icon_style === 'square' ? 'rounded-none' : 'rounded-md'
                    }`}
                  />
                )
              }
              
              const IconComponent = socialIcons[link.icon as keyof typeof socialIcons] || ExternalLink
              return (
                <IconComponent 
                  className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                    link.icon_style === 'outlined' ? 'stroke-2 fill-none' : 
                    link.icon_style === 'filled' ? 'fill-current' : ''
                  }`}
                  style={{ color: profile.primary_color || '#6366F1' }}
                />
              )
            }
            
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`w-full p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-lg group ${
                  isDarkTemplate ? 'border-white/20 bg-white/10 hover:bg-white/20' : 'border-gray-200 bg-white/80 hover:bg-white'
                }`}
                style={{ 
                  backgroundColor: `${profile.primary_color}15`,
                  borderColor: `${profile.primary_color}30`
                }}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    {renderLinkIcon()}
                  </div>
                  <div className="flex-1 text-center">
                    <span 
                      className={`font-medium block ${isDarkTemplate ? 'text-white' : 'text-gray-800'} ${fontSizeClass}`}
                      style={{ fontFamily: profile.font_family || 'Inter, sans-serif' }}
                    >
                      {link.title}
                    </span>
                    {link.description && (
                      <span 
                        className={`text-sm opacity-75 block mt-1 ${isDarkTemplate ? 'text-gray-300' : 'text-gray-600'}`}
                        style={{ fontFamily: profile.font_family || 'Inter, sans-serif' }}
                      >
                        {link.description}
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ExternalLink 
                      className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ${
                        isDarkTemplate ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className={`text-center pt-8 border-t ${isDarkTemplate ? 'border-white/20' : 'border-gray-200'}`}>
          <p 
            className={`text-xs opacity-60 ${isDarkTemplate ? 'text-gray-400' : 'text-gray-500'} ${fontSizeClass}`}
            style={{ fontFamily: profile.font_family || 'Inter, sans-serif' }}
          >
            تم الإنشاء بواسطة LinkTree Pro
          </p>
        </div>
      </div>
    </div>
  )
}