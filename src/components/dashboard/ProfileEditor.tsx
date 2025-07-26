import React, { useState, useEffect, useCallback } from 'react'
import { User, Upload, Palette, Type, Globe, Save } from 'lucide-react'
import { blink } from '../../blink/client'

interface Profile {
  id: string
  user_id: string
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
  created_at: string
  updated_at: string
}

const templates = [
  { id: 'designer', name: 'مصمم', preview: '🎨', description: 'إبداعي ومرئي' },
  { id: 'developer', name: 'مطور', preview: '💻', description: 'تقني ومتخصص' },
  { id: 'doctor', name: 'طبيب', preview: '⚕️', description: 'طبي واحترافي' },
  { id: 'trainer', name: 'مدرب', preview: '💪', description: 'لياقة وصحة' },
  { id: 'business', name: 'أعمال', preview: '💼', description: 'مؤسسي واحترافي' },
  { id: 'artist', name: 'فنان', preview: '🎭', description: 'عرض إبداعي' },
  { id: 'photographer', name: 'مصور', preview: '📸', description: 'معرض صور احترافي' },
  { id: 'writer', name: 'كاتب', preview: '✍️', description: 'أدبي وثقافي' },
  { id: 'chef', name: 'طباخ', preview: '👨‍🍳', description: 'طعام وطبخ' },
  { id: 'musician', name: 'موسيقي', preview: '🎵', description: 'موسيقى وفن' },
  { id: 'teacher', name: 'معلم', preview: '👨‍🏫', description: 'تعليمي وأكاديمي' },
  { id: 'influencer', name: 'مؤثر', preview: '⭐', description: 'وسائل التواصل' }
]

const colorPresets = [
  { name: 'نيلي', primary: '#6366F1', background: '#F8FAFC' },
  { name: 'بنفسجي', primary: '#8B5CF6', background: '#FAF5FF' },
  { name: 'أزرق', primary: '#3B82F6', background: '#EFF6FF' },
  { name: 'أخضر', primary: '#10B981', background: '#ECFDF5' },
  { name: 'وردي', primary: '#EC4899', background: '#FDF2F8' },
  { name: 'برتقالي', primary: '#F59E0B', background: '#FFFBEB' },
  { name: 'أحمر', primary: '#EF4444', background: '#FEF2F2' },
  { name: 'أصفر', primary: '#EAB308', background: '#FEFCE8' },
  { name: 'فيروزي', primary: '#06B6D4', background: '#F0F9FF' },
  { name: 'رمادي', primary: '#6B7280', background: '#F9FAFB' },
  { name: 'ذهبي', primary: '#D97706', background: '#FFFBEB' },
  { name: 'أسود', primary: '#1F2937', background: '#F3F4F6' }
]

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Cairo', value: 'Cairo, sans-serif' },
  { name: 'Tajawal', value: 'Tajawal, sans-serif' }
]

const fontSizeOptions = [
  { name: 'صغير', value: 'small' },
  { name: 'متوسط', value: 'medium' },
  { name: 'كبير', value: 'large' },
  { name: 'كبير جداً', value: 'xl' }
]

const pageWidthOptions = [
  { name: 'ضيق', value: 'narrow' },
  { name: 'عادي', value: 'normal' },
  { name: 'واسع', value: 'wide' },
  { name: 'كامل', value: 'full' }
]

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
    narrow: 'max-w-sm',
    normal: 'max-w-md',
    wide: 'max-w-lg',
    full: 'max-w-full'
  }
  return widths[width as keyof typeof widths] || widths.normal
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  const loadProfile = useCallback(async () => {
    try {
      const userData = await blink.auth.me()
      if (!userData) {
        console.error('No user data found')
        setLoading(false)
        return
      }
      
      setUser(userData)
      
      const profiles = await blink.db.profiles.list({
        where: { user_id: userData.id },
        limit: 1
      })
      
      if (profiles.length > 0) {
        setProfile(profiles[0])
      } else {
        // Create default profile
        const username = userData.email ? userData.email.split('@')[0] : `user_${Date.now()}`
        const displayName = userData.displayName || userData.email?.split('@')[0] || 'User'
        
        const defaultProfile = {
          user_id: userData.id,
          username: username,
          display_name: displayName,
          bio: 'مرحباً بكم في صفحتي!',
          avatar_url: '',
          template: 'designer',
          primary_color: '#6366F1',
          background_color: '#F8FAFC',
          font_family: 'Inter, sans-serif',
          font_size: 'medium',
          page_width: 'normal',
          is_rtl: true // تفعيل RTL افتراضياً
        }
        
        const newProfile = await blink.db.profiles.create(defaultProfile)
        setProfile(newProfile)
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

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      await blink.db.profiles.update(profile.id, {
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url, // إضافة حفظ صورة الملف الشخصي
        template: profile.template,
        primary_color: profile.primary_color,
        background_color: profile.background_color,
        font_family: profile.font_family,
        font_size: profile.font_size || 'medium',
        page_width: profile.page_width || 'normal',
        is_rtl: profile.is_rtl
      })
      
      alert('تم حفظ الملف الشخصي بنجاح!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('خطأ في حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `avatars/${profile.user_id}/${file.name}`,
        { upsert: true }
      )
      
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('خطأ في رفع الصورة. يرجى المحاولة مرة أخرى.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12" dir="rtl">
        <p className="text-gray-500">غير قادر على تحميل الملف الشخصي. يرجى المحاولة مرة أخرى.</p>
        <button 
          onClick={loadProfile}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">محرر الملف الشخصي</h1>
          <p className="text-gray-600">خصص صفحتك الشخصية</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الأساسية
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="اسم-المستخدم"
                />
                <p className="text-xs text-gray-500 mt-1">
                  صفحتك ستكون متاحة على: /{profile.username}
                </p>
                <button
                  onClick={() => window.open(`/${profile.username}`, '_blank')}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  عرض الصفحة ←
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم المعروض
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النبذة التعريفية
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="أخبر الناس عن نفسك..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صورة الملف الشخصي
                </label>
                <div className="flex items-center gap-4">
                  {profile.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <label className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200">
                    <Upload className="w-4 h-4" />
                    رفع صورة
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">اختيار القالب</h2>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setProfile({ ...profile, template: template.id })}
                  className={`p-4 rounded-lg border-2 text-right transition-colors ${
                    profile.template === template.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{template.preview}</div>
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              الألوان
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setProfile({
                    ...profile,
                    primary_color: preset.primary,
                    background_color: preset.background
                  })}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    profile.primary_color === preset.primary
                      ? 'border-indigo-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div className="text-xs font-medium">{preset.name}</div>
                </button>
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لون مخصص (اللون الأساسي)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={profile.primary_color}
                    onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={profile.primary_color}
                    onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#6366F1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لون الخلفية
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={profile.background_color}
                    onChange={(e) => setProfile({ ...profile, background_color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={profile.background_color}
                    onChange={(e) => setProfile({ ...profile, background_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="#F8FAFC"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              الخط والتخطيط
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخط
                </label>
                <select
                  value={profile.font_family}
                  onChange={(e) => setProfile({ ...profile, font_family: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حجم الخط
                </label>
                <select
                  value={profile.font_size || 'medium'}
                  onChange={(e) => setProfile({ ...profile, font_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {fontSizeOptions.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عرض الصفحة
                </label>
                <select
                  value={profile.page_width || 'normal'}
                  onChange={(e) => setProfile({ ...profile, page_width: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {pageWidthOptions.map((width) => (
                    <option key={width.value} value={width.value}>
                      {width.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profile.is_rtl}
                    onChange={(e) => setProfile({ ...profile, is_rtl: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    تفعيل دعم اللغة العربية (RTL)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">معاينة مباشرة</h2>
            <div className="border rounded-lg overflow-hidden">
              <div
                className={`p-6 min-h-[500px] ${getTemplateBackground(profile.template)} mx-auto ${getPageWidthClass(profile.page_width || 'normal')}`}
                style={{
                  backgroundColor: profile.background_color || undefined,
                  fontFamily: profile.font_family,
                  direction: profile.is_rtl ? 'rtl' : 'ltr'
                }}
              >
                {/* Profile Header */}
                <div className="text-center mb-6">
                  {profile.avatar_url && (
                    <div className="mb-4">
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 shadow-lg"
                        style={{ borderColor: profile.primary_color }}
                      />
                    </div>
                  )}
                  
                  <h3
                    className={`${getFontSizeClass(profile.font_size || 'medium')} font-bold mb-3 ${profile.template === 'developer' ? 'text-white' : 'text-gray-800'}`}
                    style={{ 
                      color: profile.primary_color,
                      fontFamily: profile.font_family
                    }}
                  >
                    {profile.display_name || 'اسمك'}
                  </h3>
                  
                  {profile.bio && (
                    <p 
                      className={`text-sm leading-relaxed mb-4 ${profile.template === 'developer' ? 'text-gray-300' : 'text-gray-600'}`}
                      style={{ fontFamily: profile.font_family }}
                    >
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Sample Links */}
                <div className="space-y-3 mb-6">
                  <div 
                    className="p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      backgroundColor: `${profile.primary_color}15`,
                      borderColor: `${profile.primary_color}30`
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                      <div 
                        className="w-5 h-5 rounded"
                        style={{ backgroundColor: profile.primary_color }}
                      />
                      <span 
                        className={`font-medium ${profile.template === 'developer' ? 'text-white' : 'text-gray-800'} ${getFontSizeClass(profile.font_size || 'medium')}`}
                        style={{ fontFamily: profile.font_family }}
                      >
                        موقعي الشخصي
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      backgroundColor: `${profile.primary_color}15`,
                      borderColor: `${profile.primary_color}30`
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                      <div 
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: '#E4405F' }}
                      />
                      <span 
                        className={`font-medium ${profile.template === 'developer' ? 'text-white' : 'text-gray-800'} ${getFontSizeClass(profile.font_size || 'medium')}`}
                        style={{ fontFamily: profile.font_family }}
                      >
                        Instagram
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`text-center pt-4 border-t ${profile.template === 'developer' ? 'border-white/20' : 'border-gray-200'}`}>
                  <p 
                    className={`text-xs opacity-60 ${profile.template === 'developer' ? 'text-gray-400' : 'text-gray-500'}`}
                    style={{ fontFamily: profile.font_family }}
                  >
                    تم الإنشاء بواسطة LinkTree Pro
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              معاينة قالب {templates.find(t => t.id === profile.template)?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}