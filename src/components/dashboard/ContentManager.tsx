import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Image as ImageIcon, Type, Grid, Upload, Edit2, Trash2, GripVertical, Eye, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link, List, ListOrdered } from 'lucide-react'
import { blink } from '../../blink/client'

interface ContentBlock {
  id: string
  user_id: string
  type: string
  title: string
  content: string
  position: number
  is_active: string
}

interface User {
  id: string
  email: string
}

export default function ContentManager() {
  const [user, setUser] = useState<User | null>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null)
  const [newBlock, setNewBlock] = useState({
    type: 'text',
    title: '',
    content: ''
  })
  const [uploading, setUploading] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Rich text editor state
  const [selectedText, setSelectedText] = useState('')
  const [textAlign, setTextAlign] = useState('left')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const loadUser = useCallback(async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }, [])

  const loadContentBlocks = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const blocks = await blink.db.contentBlocks.list({
        where: { user_id: user.id },
        orderBy: { position: 'asc' }
      })
      setContentBlocks(blocks as ContentBlock[])
    } catch (error) {
      console.error('Error loading content blocks:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    if (user) {
      loadContentBlocks()
    }
  }, [user, loadContentBlocks])

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const { publicUrl } = await blink.storage.upload(
        file,
        `content/${user?.id}/${Date.now()}-${file.name}`,
        { upsert: true }
      )
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryImageUpload = async (files: FileList) => {
    try {
      setUploadingGallery(true)
      const uploadPromises = Array.from(files).map(file => handleImageUpload(file))
      const imageUrls = await Promise.all(uploadPromises)
      setGalleryImages(prev => [...prev, ...imageUrls])
    } catch (error) {
      console.error('Error uploading gallery images:', error)
      alert('Error uploading images. Please try again.')
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddBlock = async () => {
    if (!user) return

    let content = newBlock.content
    if (newBlock.type === 'gallery') {
      content = JSON.stringify(galleryImages)
    }

    if (!content.trim() && newBlock.type !== 'gallery') return
    if (newBlock.type === 'gallery' && galleryImages.length === 0) return

    try {
      const maxPosition = Math.max(...contentBlocks.map(b => b.position), 0)
      
      await blink.db.contentBlocks.create({
        id: `block_${Date.now()}`,
        user_id: user.id,
        type: newBlock.type,
        title: newBlock.title,
        content: content,
        position: maxPosition + 1,
        is_active: '1'
      })

      setNewBlock({ type: 'text', title: '', content: '' })
      setGalleryImages([])
      setShowAddModal(false)
      loadContentBlocks()
    } catch (error) {
      console.error('Error adding content block:', error)
    }
  }

  const handleUpdateBlock = async () => {
    if (!editingBlock) return

    try {
      await blink.db.contentBlocks.update(editingBlock.id, {
        title: editingBlock.title,
        content: editingBlock.content
      })

      setEditingBlock(null)
      loadContentBlocks()
    } catch (error) {
      console.error('Error updating content block:', error)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this content block?')) return

    try {
      await blink.db.contentBlocks.delete(blockId)
      loadContentBlocks()
    } catch (error) {
      console.error('Error deleting content block:', error)
    }
  }

  const handleToggleActive = async (block: ContentBlock) => {
    try {
      await blink.db.contentBlocks.update(block.id, {
        is_active: block.is_active === '1' ? '0' : '1'
      })
      loadContentBlocks()
    } catch (error) {
      console.error('Error toggling block status:', error)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imageUrl = await handleImageUpload(file)
      setNewBlock(prev => ({ ...prev, content: imageUrl }))
    } catch (error) {
      alert('Error uploading image. Please try again.')
    }
  }

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    await handleGalleryImageUpload(files)
  }

  // Rich text editor functions
  const applyTextFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const insertLink = () => {
    if (linkUrl) {
      applyTextFormat('createLink', linkUrl)
      setShowLinkDialog(false)
      setLinkUrl('')
    }
  }

  const handleTextContentChange = (content: string) => {
    setNewBlock(prev => ({ ...prev, content }))
  }

  const handleEditTextContentChange = (content: string) => {
    if (editingBlock) {
      setEditingBlock(prev => prev ? { ...prev, content } : null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المحتوى</h2>
          <p className="text-gray-600">أضف الصور وصناديق النص والمعارض إلى ملفك الشخصي</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محتوى</span>
        </button>
      </div>

      {/* Content Blocks List */}
      <div className="space-y-4">
        {contentBlocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد كتل محتوى بعد</h3>
            <p className="text-gray-600 mb-4">أضف الصور وصناديق النص أو المعارض لتحسين ملفك الشخصي</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              أضف أول كتلة محتوى
            </button>
          </div>
        ) : (
          contentBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-4 border rounded-lg ${
                block.is_active === '1' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {block.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                      {block.type === 'text' && <Type className="w-4 h-4 text-green-600" />}
                      {block.type === 'gallery' && <Grid className="w-4 h-4 text-purple-600" />}
                      
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {block.type === 'image' ? 'صورة' : block.type === 'text' ? 'نص' : 'معرض'} 
                      </span>
                      
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        block.is_active === '1' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {block.is_active === '1' ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>

                    {block.title && (
                      <h4 className="font-medium text-gray-900 mb-1">{block.title}</h4>
                    )}

                    <div className="text-sm text-gray-600">
                      {block.type === 'image' && (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={block.content} 
                            alt={block.title || 'Image'} 
                            className="w-16 h-16 object-cover rounded"
                          />
                          <span>محتوى صورة</span>
                        </div>
                      )}
                      {block.type === 'text' && (
                        <div 
                          className="line-clamp-2 prose prose-sm"
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      )}
                      {block.type === 'gallery' && (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {JSON.parse(block.content || '[]').slice(0, 3).map((img: string, idx: number) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt={`Gallery ${idx + 1}`} 
                                className="w-12 h-12 object-cover rounded"
                              />
                            ))}
                          </div>
                          <span>{JSON.parse(block.content || '[]').length} صور</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(block)}
                    className={`p-2 rounded-lg transition-colors ${
                      block.is_active === '1'
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={block.is_active === '1' ? 'إخفاء' : 'إظهار'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setEditingBlock(block)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تحرير"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">إضافة كتلة محتوى</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المحتوى
                </label>
                <select
                  value={newBlock.type}
                  onChange={(e) => {
                    setNewBlock(prev => ({ ...prev, type: e.target.value, content: '' }))
                    setGalleryImages([])
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="text">صندوق نص</option>
                  <option value="image">صورة واحدة</option>
                  <option value="gallery">معرض صور</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان (اختياري)
                </label>
                <input
                  type="text"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="أدخل العنوان..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحتوى
                </label>
                
                {newBlock.type === 'text' && (
                  <div>
                    {/* Rich Text Editor Toolbar */}
                    <div className="border border-gray-300 rounded-t-lg p-2 bg-gray-50 flex flex-wrap items-center space-x-1">
                      {/* Font Size */}
                      <select
                        onChange={(e) => applyTextFormat('fontSize', e.target.value)}
                        className="px-2 py-1 border rounded text-sm mr-2"
                        title="حجم الخط"
                      >
                        <option value="1">صغير جداً</option>
                        <option value="2">صغير</option>
                        <option value="3" selected>عادي</option>
                        <option value="4">كبير</option>
                        <option value="5">كبير جداً</option>
                        <option value="6">ضخم</option>
                      </select>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => applyTextFormat('bold')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="عريض"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('italic')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="مائل"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('underline')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="تحته خط"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => applyTextFormat('justifyLeft')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="محاذاة يسار"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('justifyCenter')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="محاذاة وسط"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('justifyRight')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="محاذاة يمين"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => applyTextFormat('insertUnorderedList')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="قائمة نقطية"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('insertOrderedList')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="قائمة مرقمة"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => setShowLinkDialog(true)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="إدراج رابط"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Rich Text Editor */}
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => handleTextContentChange(e.currentTarget.innerHTML)}
                      className="w-full p-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] prose prose-sm max-w-none"
                      style={{ outline: 'none' }}
                      placeholder="أدخل محتوى النص..."
                    />
                    
                    {/* Link Dialog */}
                    {showLinkDialog && (
                      <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="أدخل الرابط..."
                            className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={insertLink}
                            className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                          >
                            إدراج
                          </button>
                          <button
                            onClick={() => {
                              setShowLinkDialog(false)
                              setLinkUrl('')
                            }}
                            className="text-gray-600 px-3 py-2 rounded text-sm hover:text-gray-800"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {newBlock.type === 'image' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {newBlock.content && (
                      <div className="mt-2">
                        <img 
                          src={newBlock.content} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {uploading && (
                      <div className="mt-2 text-sm text-gray-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        جاري الرفع...
                      </div>
                    )}
                  </div>
                )}

                {newBlock.type === 'gallery' && (
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryFileSelect}
                        className="hidden"
                        id="gallery-upload"
                      />
                      <label
                        htmlFor="gallery-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          انقر لرفع عدة صور
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF حتى 10 ميجابايت لكل صورة
                        </span>
                      </label>
                    </div>
                    
                    {uploadingGallery && (
                      <div className="mt-2 text-sm text-gray-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        جاري رفع الصور...
                      </div>
                    )}
                    
                    {galleryImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          صور المعرض ({galleryImages.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {galleryImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewBlock({ type: 'text', title: '', content: '' })
                  setGalleryImages([])
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddBlock}
                disabled={
                  (newBlock.type !== 'gallery' && !newBlock.content.trim()) ||
                  (newBlock.type === 'gallery' && galleryImages.length === 0) ||
                  uploading ||
                  uploadingGallery
                }
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إضافة المحتوى
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">تحرير كتلة المحتوى</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان (اختياري)
                </label>
                <input
                  type="text"
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="أدخل العنوان..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحتوى
                </label>
                
                {editingBlock.type === 'text' && (
                  <div>
                    {/* Rich Text Editor Toolbar */}
                    <div className="border border-gray-300 rounded-t-lg p-2 bg-gray-50 flex flex-wrap items-center space-x-1">
                      {/* Font Size */}
                      <select
                        onChange={(e) => applyTextFormat('fontSize', e.target.value)}
                        className="px-2 py-1 border rounded text-sm mr-2"
                        title="حجم الخط"
                      >
                        <option value="1">صغير جداً</option>
                        <option value="2">صغير</option>
                        <option value="3" selected>عادي</option>
                        <option value="4">كبير</option>
                        <option value="5">كبير جداً</option>
                        <option value="6">ضخم</option>
                      </select>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => applyTextFormat('bold')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="عريض"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('italic')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="مائل"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('underline')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="تحته خط"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => applyTextFormat('justifyLeft')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="محاذاة يسار"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('justifyCenter')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="محاذاة وسط"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('justifyRight')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="محاذاة يمين"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => applyTextFormat('insertUnorderedList')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="قائمة نقطية"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTextFormat('insertOrderedList')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="قائمة مرقمة"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      
                      <button
                        type="button"
                        onClick={() => setShowLinkDialog(true)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="إدراج رابط"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Rich Text Editor */}
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => handleEditTextContentChange(e.currentTarget.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: editingBlock.content }}
                      className="w-full p-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] prose prose-sm max-w-none"
                      style={{ outline: 'none' }}
                    />
                    
                    {/* Link Dialog */}
                    {showLinkDialog && (
                      <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="أدخل الرابط..."
                            className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={insertLink}
                            className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                          >
                            إدراج
                          </button>
                          <button
                            onClick={() => {
                              setShowLinkDialog(false)
                              setLinkUrl('')
                            }}
                            className="text-gray-600 px-3 py-2 rounded text-sm hover:text-gray-800"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {editingBlock.type === 'image' && (
                  <div>
                    <input
                      type="url"
                      value={editingBlock.content}
                      onChange={(e) => setEditingBlock(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="أدخل رابط الصورة..."
                    />
                    {editingBlock.content && (
                      <div className="mt-2">
                        <img 
                          src={editingBlock.content} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {editingBlock.type === 'gallery' && (
                  <textarea
                    value={editingBlock.content}
                    onChange={(e) => setEditingBlock(prev => prev ? { ...prev, content: e.target.value } : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="أدخل روابط الصور كمصفوفة JSON..."
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateBlock}
                disabled={!editingBlock.content.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تحديث المحتوى
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}