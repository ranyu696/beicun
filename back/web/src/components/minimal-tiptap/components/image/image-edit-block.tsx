import * as React from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import FilePickerDialog from '@/components/common/FilePickerDialog'

interface ImageEditBlockProps {
  editor: Editor
  close: () => void
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({ editor, close }) => {
  const [link, setLink] = React.useState('')
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (link) {
        editor.commands.setImages([{ src: link }])
        close()
      }
    },
    [editor, link, close]
  )

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="image-link">附加图片链接</Label>
          <div className="flex">
            <Input
              id="image-link"
              type="url"
              required
              placeholder="https://example.com"
              value={link}
              className="grow"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
            />
            <Button type="submit" className="ml-2">
              提交
            </Button>
          </div>
        </div>
        <Button 
          type="button" 
          className="w-full" 
          onClick={() => setIsPickerOpen(true)}
        >
          选择图片
        </Button>
      </form>

      <FilePickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        accept="image"
        title="选择图片"
        onSelect={(url) => {
          setLink(url)
          setIsPickerOpen(false)
        }}
      />
    </>
  )
}

export default ImageEditBlock
