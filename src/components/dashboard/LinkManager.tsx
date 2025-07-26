import React, { useState, useEffect, useCallback } from 'react'
import { Plus, GripVertical, ExternalLink, Trash2, Edit3, Save, X, Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Globe, Upload, Palette, Image as ImageIcon, Type, Eye, EyeOff } from 'lucide-react'
import { blink } from '../../blink/client'

interface Link {
  id: string
  user_id: string
  title: string
  url: string
  icon: string
  icon_style: string
  custom_icon_url?: string
  description?: string
  is_active: string // SQLite returns "0" or "1" as string
  position: number
  clicks: number
  created_at: number
  updated_at: number
}

const socialIcons = {
  instagram: { icon: Instagram, label: 'Instagram', color: '#E4405F' },
  x: { icon: Twitter, label: 'X (تويتر سابقاً)', color: '#000000' },
  facebook: { icon: Facebook, label: 'Facebook', color: '#1877F2' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: '#0077B5' },
  youtube: { icon: Youtube, label: 'YouTube', color: '#FF0000' },
  github: { icon: Github, label: 'GitHub', color: '#333' },
  website: { icon: Globe, label: 'موقع ويب', color: '#4285F4' },
  custom: { icon: ImageIcon, label: 'صورة مخصصة', color: '#6366F1' },
  default: { icon: ExternalLink, label: 'افتراضي', color: '#6B7280' }
}

const iconStyles = {
  filled: 'مملوء',
  outlined: 'محدد',
  rounded: 'دائري',
  square: 'مربع'
}

export default function LinkManager() {
  const [links, setLinks] = useState<Link[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [newLink, setNewLink] = useState({ 
    title: '', 
    url: '', 
    icon: 'default', 
    icon_style: 'filled',
    custom_icon_url: '',
    description: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      if (!user) {
        setLoading(false)
        return
      }
      
      // Get user profile
      const profiles = await blink.db.profiles.list({
        where: { user_id: user.id },
        limit: 1
      })
      
      if (profiles.length > 0) {
        setProfile(profiles[0])
        
        // Get links for this user
        const userLinks = await blink.db.links.list({
          where: { user_id: user.id },
          orderBy: { position: 'asc' }
        })
        
        setLinks(userLinks)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleIconUpload = async (file: File) => {
    if (!file) return

    setUploadingIcon(true)
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `icons/${Date.now()}_${file.name}`,
        { upsert: true }
      )
      
      setNewLink({ ...newLink, custom_icon_url: publicUrl, icon: 'custom' })
    } catch (error) {
      console.error('Error uploading icon:', error)
      alert('خطأ في رفع الأيقونة. حاول مرة أخرى.')
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleAddLink = async () => {
    if (!profile || !newLink.title || !newLink.url) return

    try {
      const user = await blink.auth.me()
      if (!user) return

      const linkData = {
        id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        title: newLink.title,
        url: newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`,
        icon: newLink.icon || 'default',
        icon_style: newLink.icon_style || 'filled',
        custom_icon_url: newLink.custom_icon_url || null,
        description: newLink.description || null,
        is_active: '1', // SQLite boolean as string
        position: links.length,
        clicks: 0
      }

      const createdLink = await blink.db.links.create(linkData)
      setLinks([...links, createdLink])
      setNewLink({ 
        title: '', 
        url: '', 
        icon: 'default', 
        icon_style: 'filled',
        custom_icon_url: '',
        description: ''
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding link:', error)
      alert('خطأ في إضافة الرابط. حاول مرة أخرى.')
    }
  }

  const handleUpdateLink = async (linkId: string, updates: Partial<Link>) => {
    try {
      await blink.db.links.update(linkId, updates)
      setLinks(links.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      ))
      setEditingLink(null)
    } catch (error) {
      console.error('Error updating link:', error)
      alert('خطأ في تحديث الرابط. حاول مرة أخرى.')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return

    try {
      await blink.db.links.delete(linkId)
      setLinks(links.filter(link => link.id !== linkId))
    } catch (error) {
      console.error('Error deleting link:', error)
      alert('خطأ في حذف الرابط. حاول مرة أخرى.')
    }
  }

  const handleToggleActive = async (linkId: string, isActive: boolean) => {
    await handleUpdateLink(linkId, { is_active: isActive ? '1' : '0' })
  }

  const moveLink = (fromIndex: number, toIndex: number) => {
    const newLinks = [...links]
    const [movedLink] = newLinks.splice(fromIndex, 1)
    newLinks.splice(toIndex, 0, movedLink)
    
    // Update positions
    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      position: index
    }))
    
    setLinks(updatedLinks)
    
    // Save new order to database
    updatedLinks.forEach(async (link) => {
      await blink.db.links.update(link.id, { position: link.position })
    })
  }

  const renderIcon = (link: Link, size = 'w-5 h-5') => {
    if (link.icon === 'custom' && link.custom_icon_url) {
      return (
        <img 
          src={link.custom_icon_url} 
          alt={link.title}
          className={`${size} object-cover rounded-${link.icon_style === 'rounded' ? 'full' : link.icon_style === 'square' ? 'none' : 'md'}`}
        />
      )
    }
    
    const iconData = socialIcons[link.icon as keyof typeof socialIcons] || socialIcons.default
    const IconComponent = iconData.icon
    
    return (
      <IconComponent 
        className={`${size} ${
          link.icon_style === 'outlined' ? 'stroke-2 fill-none' : 
          link.icon_style === 'filled' ? 'fill-current' : ''
        }`}
        style={{ color: iconData.color }}
      />
    )
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
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">يرجى إنشاء ملفك الشخصي أولاً</p>
        <button className="text-indigo-600 hover:text-indigo-700 font-medium">
          اذهب إلى محرر الملف الشخصي
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الروابط</h1>
          <p className="text-gray-600">أضف ونظم روابطك مع أيقونات مخصصة</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          إضافة رابط
        </button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">إضافة رابط جديد</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنوان الرابط
              </label>
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="موقعي الشخصي"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الرابط
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الأيقونة
              </label>
              <select
                value={newLink.icon}
                onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(socialIcons).map(([key, data]) => (
                  <option key={key} value={key}>{data.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شكل الأيقونة
              </label>
              <select
                value={newLink.icon_style}
                onChange={(e) => setNewLink({ ...newLink, icon_style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(iconStyles).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رفع أيقونة مخصصة
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleIconUpload(e.target.files[0])}
                  className="hidden"
                  id="icon-upload"
                />
                <label
                  htmlFor="icon-upload"
                  className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                    uploadingIcon ? 'opacity-50' : ''
                  }`}
                >
                  {uploadingIcon ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="text-sm">رفع</span>
                </label>
                {newLink.custom_icon_url && (
                  <img src={newLink.custom_icon_url} alt="Custom icon" className="w-8 h-8 rounded" />
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وصف الرابط (اختياري)
            </label>
            <textarea
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="وصف مختصر للرابط..."
              rows={2}
            />
          </div>

          {/* Icon Preview */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">معاينة الأيقونة:</h3>
            <div className="flex items-center gap-3">
              {renderIcon({ 
                ...newLink, 
                id: 'preview',
                user_id: '',
                is_active: '1',
                position: 0,
                clicks: 0,
                created_at: 0,
                updated_at: 0
              } as Link, 'w-8 h-8')}
              <span className="text-gray-700">{newLink.title || 'عنوان الرابط'}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddLink}
              disabled={!newLink.title || !newLink.url}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              إضافة الرابط
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد روابط بعد</h3>
            <p className="text-gray-500 mb-4">أضف رابطك الأول للبدء</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              إضافة رابط
            </button>
          </div>
        ) : (
          links.map((link, index) => {
            const isEditing = editingLink === link.id
            
            return (
              <div
                key={link.id}
                className={`bg-white rounded-lg border p-4 ${
                  link.is_active === '0' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <button
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                      // Simple drag implementation
                      const startY = e.clientY
                      const startIndex = index
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaY = e.clientY - startY
                        const newIndex = Math.max(0, Math.min(links.length - 1, 
                          startIndex + Math.round(deltaY / 60)
                        ))
                        
                        if (newIndex !== startIndex) {
                          moveLink(startIndex, newIndex)
                        }
                      }
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove)
                        document.removeEventListener('mouseup', handleMouseUp)
                      }
                      
                      document.addEventListener('mousemove', handleMouseMove)
                      document.addEventListener('mouseup', handleMouseUp)
                    }}
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {renderIcon(link)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          defaultValue={link.title}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onBlur={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                          placeholder="عنوان الرابط"
                        />
                        <input
                          type="url"
                          defaultValue={link.url}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onBlur={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                          placeholder="الرابط"
                        />
                        {link.description && (
                          <textarea
                            defaultValue={link.description}
                            className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onBlur={(e) => handleUpdateLink(link.id, { description: e.target.value })}
                            placeholder="وصف الرابط"
                            rows={2}
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{link.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{link.url}</p>
                        {link.description && (
                          <p className="text-xs text-gray-400 mt-1">{link.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {link.clicks || 0} نقرة
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {iconStyles[link.icon_style as keyof typeof iconStyles] || 'مملوء'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(link.id, link.is_active === '0')}
                      className={`p-1 rounded ${
                        link.is_active === '1' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={link.is_active === '1' ? 'إخفاء الرابط' : 'إظهار الرابط'}
                    >
                      {link.is_active === '1' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingLink(isEditing ? null : link.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title="تحرير الرابط"
                    >
                      {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-400 hover:text-red-600"
                      title="حذف الرابط"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* External Link */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                      title="فتح الرابط"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Preview Link */}
      {profile && (
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-indigo-900">صفحتك الشخصية</h3>
              <p className="text-sm text-indigo-700">
                شارك هذا الرابط: <span className="font-mono">/{profile.username}</span>
              </p>
            </div>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <ExternalLink className="w-4 h-4" />
              عرض الصفحة
            </a>
          </div>
        </div>
      )}
    </div>
  )
}