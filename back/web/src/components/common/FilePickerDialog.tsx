import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {  FileIcon, VideoIcon, FolderIcon, SearchIcon } from 'lucide-react'
import storage from '@/services/storage'
import { useQuery } from '@tanstack/react-query'
import type {  Folder } from '@/types/storage'
import { cn } from '@/lib/utils'
import { getStorageUrl } from '@/lib/storage'

interface FilePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
  maxSize?: number // 单位：MB
  accept?: 'image' | 'video' | 'all'
  title?: string
}

export default function FilePickerDialog({
  open,
  onOpenChange,
  onSelect,
  accept = 'all',
  title = '选择文件',
}: FilePickerDialogProps) {
  const [currentFolder, setCurrentFolder] = useState<string>('')
  const [search, setSearch] = useState('')

  // 获取文件夹列表
  const { data: folders } = useQuery({
    queryKey: ['folders', currentFolder],
    queryFn: async () => {
      const response = await storage.folder.list({
        parentId: currentFolder,
        page: 1,
        pageSize: 100,
      })
      return response.data.data
    },
  })

  // 获取文件列表
  const { data: files } = useQuery({
    queryKey: ['files', currentFolder, accept],
    queryFn: async () => {
      const response = await storage.file.list({
        folderId: currentFolder,
        page: 1,
        pageSize: 100,
      })
      return response.data.data
    },
  })

  // 处理文件夹点击
  const handleFolderClick = useCallback((folder: Folder) => {
    setCurrentFolder(folder.id)
  }, [])

  // 处理返回上级
  const handleBack = useCallback(async () => {
    if (!currentFolder) return
    const response = await storage.folder.get(currentFolder)
    setCurrentFolder(response.data.data.parentId || '')
  }, [currentFolder])

  // 过滤文件和文件夹
  const filteredFolders = folders?.filter(folder => 
    folder.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const filteredFiles = files?.filter(file => 
    file.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            请选择要上传的文件
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={!currentFolder}
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            返回上级
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文件..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {/* 文件夹列表 */}
          {filteredFolders.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">文件夹</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredFolders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center justify-center space-y-2"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <FolderIcon className="h-8 w-8" />
                    <span className="text-sm truncate w-full text-center">
                      {folder.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 文件列表 */}
          {filteredFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">文件</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Button
                    key={file.id}
                    variant="outline"
                    className={cn(
                      "h-auto aspect-square relative group overflow-hidden p-0",
                      "hover:border-primary"
                    )}
                    onClick={() => {
                      onSelect(file.url)
                      onOpenChange(false)
                    }}
                  >
                    {file.type === 'image' ? (
                      <img
                        src={getStorageUrl(file.url)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : file.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <VideoIcon className="h-8 w-8" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <FileIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                      <p className="text-xs text-white truncate">
                        {file.name}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <FileIcon className="h-8 w-8 mb-2" />
              <p>没有找到文件</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
