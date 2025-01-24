import React from 'react';
import { FileIcon, ImageIcon, VideoIcon, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/utils/file';
import type { File } from '@/types/storage';

interface StorageFileListProps {
  files: File[];
  onPreview: (file: File) => void;
  onEdit: (file: File) => void;
  onDelete: (file: File) => void;
  onMove: (file: File) => void;
}

export const StorageFileList: React.FC<StorageFileListProps> = ({
  files,
  onPreview,
  onEdit,
  onDelete,
  onMove,
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <VideoIcon className="h-6 w-6 text-green-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer"
          onClick={() => onPreview(file)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <span className="font-medium truncate">{file.name}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(file);
                }}>
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onMove(file);
                }}>
                  移动
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                >
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </div>
        </div>
      ))}
    </div>
  );
};
