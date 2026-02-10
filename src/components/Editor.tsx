import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { useState, useEffect } from 'react'
import { STORAGE_KEY, CATEGORIES } from '../lib/constants'

export default function Editor({ initialSlug }: { initialSlug?: string }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState<string>('Journal')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState('')
  const [slugAvailable, setSlugAvailable] = useState(true)
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const isEditing = !!initialSlug

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'เริ่มเขียนบันทึกของคุณที่นี่...',
      }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      saveToStorage({ content: editor.getHTML() })
    }
  })

  // Load draft or existing post
  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        setStatus('กำลังดึงข้อมูลบทความ...')
        try {
          const res = await fetch(`/api/posts/${initialSlug}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title);
            setSlug(data.slug);
            setExcerpt(data.excerpt || '');
            if (CATEGORIES.includes(data.category as any)) {
              setCategory(data.category);
              setIsCustomCategory(false);
            } else {
              setCategory('Other');
              setIsCustomCategory(true);
              setCustomCategory(data.category);
            }
            setImageUrl(data.imageUrl || '');
            setAuthor(data.author || '');
            if (editor) {
              editor.commands.setContent(data.content || '');
            }
            setStatus('ดึงข้อมูลสำเร็จ ✨');
          }
        } catch (e) {
          setStatus('ไม่สามารถดึงข้อมูลได้');
        }
      };
      fetchPost();
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const draft = JSON.parse(saved)
        if (draft.title) setTitle(draft.title)
        if (draft.slug) setSlug(draft.slug)
        if (draft.excerpt) setExcerpt(draft.excerpt)
        if (draft.category) setCategory(draft.category)
        if (draft.imageUrl) setImageUrl(draft.imageUrl)
        if (draft.author) setAuthor(draft.author)
        if (draft.content && editor) {
          editor.commands.setContent(draft.content)
        }
        setStatus('กู้คืนฉบับร่างเรียบร้อย ✨')
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [editor])

  const saveToStorage = (updates: any) => {
    const next = {
      title, slug, excerpt, category, imageUrl, author,
      content: editor?.getHTML() || '',
      ...updates
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  // Auto-save field changes
  useEffect(() => {
    saveToStorage({})
  }, [title, slug, excerpt, category, imageUrl, author])

  const openUploadWidget = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setImageUrl(result.info.secure_url);
        }
      }
    );
    widget.open();
  }

  const openEditorImageUpload = () => {
    if (!editor) return;
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          editor.chain().focus().setImage({ src: result.info.secure_url }).run();
        }
      }
    );
    widget.open();
  }

  // Check slug availability
  useEffect(() => {
    if (!slug || (isEditing && slug === initialSlug)) {
      setSlugAvailable(true);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-slug?slug=${slug}`);
        const data = await res.json();
        setSlugAvailable(!data.exists);
        if (data.exists) {
          setStatus('❌ URL นี้ถูกใช้ไปแล้วนะจ๊ะ ลองเปลี่ยนใหม่ดู');
        } else {
          setStatus('');
        }
      } catch (e) {
        console.error('Slug check failed', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const savePost = async () => {
    if (!editor) return
    if (!slugAvailable) {
      setStatus('❌ กรุณาเปลี่ยน slug-url ก่อนจ้า เพราะมันซ้ำ!');
      return;
    }
    setStatus('กำลังบันทึก...')

    try {
      const content = editor.getHTML()
      const url = isEditing ? `/api/posts/${initialSlug}` : '/api/posts';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          category: isCustomCategory ? customCategory : category,
          author,
          image_url: imageUrl,
        }),
      })

      const result = await response.json();

      if (response.ok) {
        if (!isEditing) localStorage.removeItem(STORAGE_KEY)
        setStatus('บันทึกเรียบร้อย! กำลังพาไปดูหน้าโพสต์...')
        setTimeout(() => {
          window.location.href = `/blog/${slug}`
        }, 1000)
      } else {
        setStatus(`❌ บันทึกไม่สำเร็จ: ${result.error || 'เกิดข้อผิดพลาดบางอย่าง'}`)
      }
    } catch (error) {
      console.error('Save post error:', error);
      setStatus('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  }

  if (!editor) return null

  const inputClasses = "w-full bg-white/5 border border-white/10 text-white p-3.5 rounded-xl outline-none transition-all duration-300 focus:bg-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-white/30";

  return (
    <div className="glass p-8 md:p-12 rounded-[2rem] border border-white/5 space-y-8 animate-fade-in shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-muted ml-1">หัวข้อบทความ</label>
          <input 
            type="text" 
            placeholder="พิมพ์หัวข้อที่นี่..." 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!isEditing) {
                setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
              }
            }}
            className={inputClasses}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-muted ml-1">Slug-URL</label>
          <input 
            type="text" 
            placeholder="url-friendly-slug" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inputClasses} ${!slugAvailable ? 'border-primary ring-4 ring-primary/10' : ''}`}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-muted ml-1">หมวดหมู่</label>
          <div className="flex flex-col gap-4">
            <select 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setIsCustomCategory(e.target.value === 'Other');
              }}
              className={`${inputClasses} appearance-none cursor-pointer`}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-bg text-white">{cat}</option>
              ))}
              <option value="Other" className="bg-bg text-white">✨ อื่นๆ (ระบุเอง)</option>
            </select>
            {isCustomCategory && (
              <input 
                type="text" 
                placeholder="ระบุหมวดหมู่ใหม่..." 
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className={`${inputClasses} bg-primary/5 border-primary/30 animate-slide-down`}
              />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-muted ml-1">ชื่อผู้เขียน</label>
          <input 
            type="text" 
            placeholder="ชื่อที่จะแสดง..." 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-text-muted ml-1">รูปภาพหน้าปก</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="แปะลิงก์รูปภาพ หรือกดเลือกรูปจากเครื่อง..." 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClasses}
            />
            <button onClick={openUploadWidget} className="whitespace-nowrap bg-white/10 text-white px-6 rounded-xl border border-white/10 font-bold hover:bg-white/20 transition-all cursor-pointer">
              เลือกไฟล์
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-muted ml-1">คำโปรย (Excerpt)</label>
        <textarea 
          placeholder="สรุปเนื้อหาสั้นๆ ให้น่าดึงดูด..." 
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`${inputClasses} min-h-[100px] resize-none`}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-muted ml-1">เนื้อหาบันทึก</label>
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
          <div className="p-3 bg-black/40 flex flex-wrap gap-2 border-b border-white/10">
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"></path><path d="M6 20V4"></path><path d="M18 20V4"></path></svg>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
            </ToolbarBtn>
            
            <div className="w-px h-6 bg-white/10 mx-1 self-center"></div>
            
            <ToolbarBtn 
              onClick={() => editor.chain().focus().setColor('#f63049').run()} 
              active={editor.isActive('textStyle', { color: '#f63049' })}
              style={{ color: '#f63049' }}>
              <span className="font-black text-lg">A</span>
            </ToolbarBtn>
            <ToolbarBtn 
              onClick={() => editor.chain().focus().setColor('#4facfe').run()} 
              active={editor.isActive('textStyle', { color: '#4facfe' })}
              style={{ color: '#4facfe' }}>
              <span className="font-black text-lg">A</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().unsetColor().run()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M18.629 14.5a3.676 3.676 0 0 0 .5-1.5 4 4 0 1 0-7.317-1.98"/><path d="M11.5 11.5a4 4 0 0 0-4 4c0 1.222.556 2.302 1.414 3"/></svg>
            </ToolbarBtn>

            <div className="w-px h-6 bg-white/10 mx-1 self-center"></div>

            <ToolbarBtn 
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#f63049' }).run()} 
              active={editor.isActive('highlight', { color: '#f63049' })}
              style={{ bgcolor: '#f63049' }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2.5 2.24 0 .46.62.8 1 .8a2.49 2.49 0 0 0 2.5-2.5c0-.56.42-1.02.98-1.46"/></svg>
            </ToolbarBtn>
            <ToolbarBtn 
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#4facfe' }).run()} 
              active={editor.isActive('highlight', { color: '#4facfe' })}
              style={{ bgcolor: '#4facfe', textcolor: 'white' }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2.5 2.24 0 .46.62.8 1 .8a2.49 2.49 0 0 0 2.5-2.5c0-.56.42-1.02.98-1.46"/></svg>
            </ToolbarBtn>

            <button onClick={openEditorImageUpload} className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold hover:bg-primary hover:text-white transition-all text-sm cursor-pointer whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>เพิ่มรูป</span>
            </button>
          </div>

          <div className="tiptap-editor-admin p-6 min-h-[400px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center gap-6">
        <button onClick={savePost} className="w-full md:w-auto px-12 py-4 bg-primary text-white rounded-xl font-extrabold text-lg shadow-[0_8px_20px_rgba(246,48,73,0.3)] hover:-translate-y-1 hover:bg-secondary hover:shadow-[0_12px_25px_rgba(246,48,73,0.5)] transition-all cursor-pointer">
          {isEditing ? 'บันทึกการแก้ไข ✨' : 'Publish บันทึก 🏮'}
        </button>
        <div className="status-message flex items-center gap-3 text-text-muted font-medium">
          {status && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
          <span>{status}</span>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ children, onClick, active, style = {} }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`
        w-9 h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer shrink-0
        ${active 
          ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(246,48,73,0.4)]' 
          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'}
      `}
      style={{ 
        backgroundColor: style.bgcolor || undefined,
        color: style.textcolor || style.color || undefined
      }}
    >
      {children}
    </button>
  )
}
