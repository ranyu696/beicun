import React from 'react';
import { FolderIcon, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Folder } from '@/types/storage';

interface StorageFolderListProps {
  folders: Folder[];
  onFolderClick: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onMove: (folder: Folder) => void;
}

export const StorageFolderList: React.FC<StorageFolderListProps> = ({
  folders,
  onFolderClick,
  onEdit,
  onDelete,
  onMove,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer"
          onClick={() => onFolderClick(folder)}
        >
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">{folder.name}</span>
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
                onEdit(folder);
              }}>
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onMove(folder);
              }}>
                移动
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder);
                }}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
};
