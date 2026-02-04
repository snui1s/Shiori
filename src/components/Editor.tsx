import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useState } from 'react'

export default function Editor() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('Journal')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({
        placeholder: 'เริ่มเขียนบันทึกของคุณที่นี่...',
      }),
    ],
    content: '',
    immediatelyRender: false,
  })

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

  const savePost = async () => {
    if (!editor) return
    setStatus('กำลังบันทึก...')

    const content = editor.getHTML()
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        category,
        image_url: imageUrl,
      }),
    })

    if (response.ok) {
      setStatus('บันทึกเรียบร้อย! กำลังพาไปดูหน้าโพสต์...')
      setTimeout(() => {
        window.location.href = `/blog/${slug}`
      }, 1000)
    } else {
      setStatus('เกิดข้อผิดพลาดในการบันทึก')
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
            setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
          }}
          className="admin-input"
        />
        <input 
          type="text" 
          placeholder="slug-url" 
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="admin-input"
        />
        <input 
          type="text" 
          placeholder="หมวดหมู่ (เช่น Review, Log)" 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="admin-input"
        />
        <div className="input-group">
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
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>List</button>
        <button onClick={openEditorImageUpload} className="btn-toolbar-upload">
          📷 เพิ่มรูปประกอบ
        </button>
      </div>

      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>

      <div className="footer-actions">
        <button onClick={savePost} className="btn-save">Publish บทความ</button>
        <span className="status-msg">{status}</span>
      </div>
    </div>
  )
}
