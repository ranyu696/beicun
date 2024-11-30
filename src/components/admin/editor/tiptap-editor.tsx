"use client"

// 导入必要的依赖
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  ImagePlus,
  Link as LinkIcon,
} from "lucide-react"
import { useToast } from '@/hooks/use-toast'

// 编辑器组件的属性接口定义
interface EditorProps {
  content: string // 编辑器内容
  onChange: (content: string) => void // 内容变化时的回调函数
  placeholder?: string // 占位符文本
  disabled?: boolean // 是否禁用编辑器
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "开始写作...",
  disabled = false,
}: EditorProps) {
  const { toast } = useToast()
  
  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none'
      }
    },
    enableInputRules: false,
    enablePasteRules: false,
    immediatelyRender: false
  })

  if (!editor) return null

  // 添加图片的处理函数
  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async () => {
      if (!input.files?.length) return
      
      try {
        const file = input.files[0]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'editor')

        // 上传图片到服务器
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('图片上传失败')
        }

        const data = await response.json()
        editor.chain().focus().setImage({ src: data.url }).run()
      } catch (error) {
        toast({
          title: '上传失败',
          description: error instanceof Error ? error.message : '图片上传失败',
          variant: "destructive",
        })
      }
    }
    
    input.click()
  }

  // 添加链接的处理函数
  const setLink = () => {
    const url = window.prompt('输入链接URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border rounded-md">
      {/* 工具栏 */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* 加粗按钮 */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        {/* 斜体按钮 */}
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        {/* 删除线按钮 */}
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        {/* 无序列表按钮 */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        {/* 有序列表按钮 */}
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        {/* 引用按钮 */}
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        {/* 添加图片按钮 */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={addImage}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        {/* 添加链接按钮 */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        {/* 撤销按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        {/* 重做按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {/* 编辑器内容区域 */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm dark:prose-invert max-w-none p-4" 
      />
    </div>
  )
} 