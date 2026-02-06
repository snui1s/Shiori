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

  // Use CATEGORIES from constants, but cast to mutable array for local usage if needed, or just iterate.
  // We can just use CATEGORIES directly.

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
    // const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
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
  }

  if (!editor) return null

  return (
    <div className="editor-container glass">
      <div className="form-grid">
        <input 
          type="text" 
          placeholder="หัวข้อบทความ" 
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (!isEditing) {
              setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
            }
          }}
          className="admin-input"
        />
        <input 
          type="text" 
          placeholder="slug-url" 
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={`admin-input ${!slugAvailable ? 'input-error' : ''}`}
        />
        <div className="category-group">
          <select 
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setIsCustomCategory(e.target.value === 'Other');
            }}
            className="admin-input admin-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Other">✨ อื่นๆ (ระบุเอง)</option>
          </select>
          {isCustomCategory && (
            <input 
              type="text" 
              placeholder="ระบุหมวดหมู่ใหม่..." 
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="admin-input custom-category-input animate-in"
            />
          )}
        </div>
        <input 
          type="text" 
          placeholder="ชื่อผู้โพสต์" 
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="admin-input"
        />
        <div className="input-group full-width">
          <input 
            type="text" 
            placeholder="Link รูปหน้าปก" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="admin-input"
          />
          <button onClick={openUploadWidget} className="btn-upload">เลือกรูปจากเครื่อง</button>
        </div>
      </div>
      
      <textarea 
        placeholder="คำโปรยสั้นๆ" 
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="admin-textarea"
      />

      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>I</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
        <button title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>• List</button>
        <button title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>1. List</button>
        
        <div className="toolbar-separator"></div>
        
        <button 
          onClick={() => editor.chain().focus().setColor('#f63049').run()} 
          className={editor.isActive('textStyle', { color: '#f63049' }) ? 'is-active' : ''}
          style={{ color: '#f63049' }}
        >A</button>
        <button 
          onClick={() => editor.chain().focus().setColor('#4facfe').run()} 
          className={editor.isActive('textStyle', { color: '#4facfe' }) ? 'is-active' : ''}
          style={{ color: '#4facfe' }}
        >A</button>
        <button 
          onClick={() => editor.chain().focus().unsetColor().run()}
        >⌫</button>

        <div className="toolbar-separator"></div>

        <button 
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#f63049' }).run()} 
          className={editor.isActive('highlight', { color: '#f63049' }) ? 'is-active' : ''}
          style={{ background: '#f63049', color: 'white' }}
        >H</button>
        <button 
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()} 
          className={editor.isActive('highlight', { color: '#fbbf24' }) ? 'is-active' : ''}
          style={{ background: '#fbbf24', color: 'black' }}
        >H</button>

        <button onClick={openEditorImageUpload} className="btn-toolbar-upload">
          📷 เพิ่มรูปประกอบ
        </button>
      </div>

      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>

      <div className="footer-actions">
        <button onClick={savePost} className="btn-save">
          {isEditing ? 'บันทึกการแก้ไข' : 'Publish บทความ'}
        </button>
        <span className="status-msg">{status}</span>
      </div>
    </div>
  )
}
