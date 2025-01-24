import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, FolderIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import StorageService from '@/services/storage'
import type { Folder } from '@/types/storage';

interface StorageMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolder: Folder | null;
  onMove: (targetFolder: Folder | null) => void;
}

export const StorageMoveDialog: React.FC<StorageMoveDialogProps> = ({
  open,
  onOpenChange,
  currentFolder,
  onMove,
}) => {
  const [selectedFolder, setSelectedFolder] = React.useState<Folder | null>(null);
  const [path, setPath] = React.useState<Folder[]>([]);

  const { data: folderResponse, isLoading } = useQuery({
    queryKey: ['folders', selectedFolder?.id, 'move'],
    queryFn: async () => {
      const response = await StorageService.folder.list({ 
        parentId: selectedFolder?.id,
        page: 1,
        pageSize: 100,
      });
      return response.data;
    },
    enabled: open,
  });

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setPath((prev) => [...prev, folder]);
  };

  const handleNavigate = (folder: Folder | null) => {
    if (folder === null) {
      setSelectedFolder(null);
      setPath([]);
    } else {
      const index = path.findIndex((f) => f.id === folder.id);
      setSelectedFolder(folder);
      setPath((prev) => prev.slice(0, index + 1));
    }
  };

  React.useEffect(() => {
    if (open) {
      setSelectedFolder(null);
      setPath([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>移动到</DialogTitle>
          <DialogDescription>
            选择要移动到的文件夹
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 text-sm mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => handleNavigate(null)}
          >
            根目录
          </Button>
          {path.map((folder) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => handleNavigate(folder)}
              >
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
        </div>

        <ScrollArea className="h-[300px] border rounded-lg p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {folderResponse?.data.map((folder: Folder) => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  className="w-full justify-start"
                  disabled={folder.id === currentFolder?.id}
                  onClick={() => handleFolderClick(folder)}
                >
                  <FolderIcon className="h-4 w-4 mr-2" />
                  {folder.name}
                </Button>
              ))}
              {!folderResponse?.data.length && (
                <div className="text-center py-4 text-muted-foreground">
                  当前目录为空
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              onMove(selectedFolder);
              onOpenChange(false);
            }}
          >
            移动到此处
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
