import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StorageStats } from './components/StorageStats';
import { StorageFolderList } from './components/StorageFolderList';
import { StorageFileList } from './components/StorageFileList';
import { StorageBreadcrumb } from './components/StorageBreadcrumb';
import { StorageFolderDialog } from './components/StorageFolderDialog';
import { StorageMoveDialog } from './components/StorageMoveDialog';
import { StoragePreviewDialog } from './components/StoragePreviewDialog';
import StorageService from '@/services/storage'
import type { File, Folder } from '@/types/storage';
import { useToast } from '@/hooks/use-toast';
import UploadButton from './components/UploadButton';

const StoragePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentFolder, setCurrentFolder] = React.useState<Folder | null>(null);
  const [folderPath, setFolderPath] = React.useState<Folder[]>([]);
  const [selectedItems, setSelectedItems] = React.useState<Array<File | Folder>>([]);

  // 对话框状态
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
  const [editFolderOpen, setEditFolderOpen] = React.useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = React.useState<Folder | null>(null);

  // 获取文件夹列表
  const { data: folderResponse, isLoading: isFoldersLoading } = useQuery({
    queryKey: ['folders', currentFolder?.id],
    queryFn: async () => {
      const response = await StorageService.folder.list({
        parentId: currentFolder?.id,
        page: 1,
        pageSize: 50,
      });
      return response.data;
    },
  });

  // 获取文件列表
  const { data: fileResponse, isLoading: isFilesLoading } = useQuery({
    queryKey: ['files', currentFolder?.id],
    queryFn: async () => {
      const response = await StorageService.file.list({ 
        folderId: currentFolder?.id,
        page: 1,
        pageSize: 50,
      });
      return response.data;
    },
  });

  // 获取存储统计信息
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ['storage-stats'],
    queryFn: async () => {
      const response = await StorageService.storage.getStats(); 
      return response.data;
    },
  });

  // 创建文件夹
  const createFolderMutation = useMutation({
    mutationFn: async (values: { name: string; description?: string }) => {
      return StorageService.folder.create({ 
        ...values,
        parentId: currentFolder?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      setCreateFolderOpen(false);
      toast({
        title: '创建成功',
        description: '文件夹已创建',
      });
    },
  });

  // 更新文件夹
  const updateFolderMutation = useMutation({
    mutationFn: async (values: { id: string; name: string; description?: string }) => {
      const { id, ...data } = values;
      return StorageService.folder.update(id, data); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setEditFolderOpen(false);
      toast({
        title: '更新成功',
        description: '文件夹已更新',
      });
    },
  });

  // 移动文件夹
  const moveFolderMutation = useMutation({
    mutationFn: async ({ id, targetParentId }: { id: string; targetParentId?: string }) => {
      return StorageService.folder.move(id, { targetParentId }); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setMoveDialogOpen(false);
      toast({
        title: '移动成功',
        description: '文件夹已移动',
      });
    },
  });

  // 移动文件
  const moveFileMutation = useMutation({
    mutationFn: async ({ id, targetFolderId }: { id: string; targetFolderId?: string }) => {
      return StorageService.file.move(id, { targetFolderId }); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setMoveDialogOpen(false);
      toast({
        title: '移动成功',
        description: '文件已移动',
      });
    },
  });

  // 删除文件
  const deleteFileMutation = useMutation({
    mutationFn: async (file: File) => {
      return StorageService.file.delete(file.id); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      toast({
        title: '删除成功',
        description: '文件已成功删除',
      });
    },
  });

  // 删除文件夹
  const deleteFolderMutation = useMutation({
    mutationFn: async (folder: Folder) => {
      return StorageService.folder.delete(folder.id); 
    }, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      toast({
        title: '删除成功',
        description: '文件夹已成功删除',
      });
    },
  });

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolder(folder);
    setFolderPath((prev) => [...prev, folder]);
  };

  const handleNavigate = (folder: Folder | null) => {
    if (folder === null) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      const index = folderPath.findIndex((f) => f.id === folder.id);
      setCurrentFolder(folder);
      setFolderPath((prev) => prev.slice(0, index + 1));
    }
  };

  const handleMoveItem = (targetFolder: Folder | null) => {
    if (!selectedItems.length) return;

    const item = selectedItems[0];
    if ('type' in item) {
      moveFileMutation.mutate({
        id: item.id,
        targetFolderId: targetFolder?.id,
      });
    } else {
      moveFolderMutation.mutate({
        id: item.id,
        targetParentId: targetFolder?.id,
      });
    }
  };

  const handleFilePreview = (file: File) => {
    setSelectedFile(file);
    setPreviewDialogOpen(true);
  };

  const isLoading = isFoldersLoading || isFilesLoading || isStatsLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">存储管理</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCreateFolderOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新建文件夹
          </Button>
          <UploadButton 
            folderId={currentFolder?.id} 
            folderName={currentFolder?.name}
          />
        </div>
      </div>

      {statsResponse && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">存储概览</h2>
          </CardHeader>
          <CardContent>
            <StorageStats stats={statsResponse.data} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <StorageBreadcrumb
            path={folderPath}
            onNavigate={handleNavigate}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {folderResponse && folderResponse.total > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">文件夹</h3>
                  <StorageFolderList
                    folders={folderResponse?.data ?? []}
                    onFolderClick={handleFolderClick}
                    onEdit={(folder) => {
                      setSelectedFolder(folder);
                      setEditFolderOpen(true);
                    }}
                    onDelete={(folder) => deleteFolderMutation.mutate(folder)}
                    onMove={(folder) => {
                      setSelectedItems([folder]);
                      setMoveDialogOpen(true);
                    }}
                  />
                </div>
              )}

              {fileResponse && fileResponse.total > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">文件</h3>
                  <StorageFileList
                    files={fileResponse?.data ?? []}
                    onPreview={handleFilePreview}
                    onEdit={() => {}}
                    onDelete={(file) => deleteFileMutation.mutate(file)}
                    onMove={(file) => {
                      setSelectedItems([file]);
                      setMoveDialogOpen(true);
                    }}
                  />
                </div>
              )}

              {(!folderResponse?.total && !fileResponse?.total) && (
                <div className="text-center py-12 text-muted-foreground">
                  当前目录为空
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <StorageFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSubmit={createFolderMutation.mutate}
      />

      <StorageFolderDialog
        open={editFolderOpen}
        onOpenChange={setEditFolderOpen}
        folder={selectedFolder ?? undefined}
        onSubmit={(values) =>
          selectedFolder &&
          updateFolderMutation.mutate({ id: selectedFolder.id, ...values })
        }
      />

      <StorageMoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        currentFolder={currentFolder}
        onMove={handleMoveItem}
      />

      <StoragePreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        file={selectedFile}
      />
    </div>
  );
};

export default StoragePage;
