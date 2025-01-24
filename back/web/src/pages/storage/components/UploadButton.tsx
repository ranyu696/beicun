import React, { useCallback, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UploadIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import StorageService from '@/services/storage'
import SparkMD5 from 'spark-md5'

interface UploadButtonProps {
  folderId?: string
  folderName?: string
}

const UploadButton: React.FC<UploadButtonProps> = ({ folderId, folderName }) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 检查文件是否存在
  const checkFileExists = useCallback(async (params: {
    filename: string;
    fileSize: number;
    folderId: string;
    md5: string;
  }) => {
    return StorageService.file.checkFileExists(params);
  }, []);

  // 计算文件MD5
  const calculateMD5 = useCallback(async (file: File): Promise<string> => {
    try {
      // 使用更小的块大小来读取文件
      const chunkSize = 2 * 1024 * 1024; // 2MB chunks
      const chunks = Math.ceil(file.size / chunkSize);
      const spark = new SparkMD5.ArrayBuffer();
      
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = await file.slice(start, end).arrayBuffer();
        spark.append(chunk);
      }

      return spark.end();
    } catch (error) {
      console.error('计算MD5失败:', error);
      // 如果无法计算MD5，返回一个基于文件名和大小的临时标识符
      return `${file.name}-${file.size}-${Date.now()}`;
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const files = Array.from(event.target.files);
    const imageFiles: File[] = [];
    let videoFile: File | null = null;

    // 检查每个文件
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          variant: 'destructive',
          title: '不支持的文件类型',
          description: `文件 ${file.name} 不是图片或视频`,
        });
        continue;
      }

      try {
        // 检查文件是否已存在
        const fileStatus = await checkFileExists({
          filename: file.name,
          fileSize: file.size,
          folderId: folderId || '',
          md5: `${file.name}-${file.size}-${Date.now()}`,
        });

        if (fileStatus.data.data.exists) {
          toast({
            variant: 'destructive',
            title: '文件已存在',
            description: `文件 ${file.name} 已存在`,
          });
          continue;
        }

        if (isImage) {
          // 检查图片大小
          if (file.size > 10 * 1024 * 1024) { // 10MB
            toast({
              variant: 'destructive',
              title: '图片太大',
              description: `图片 ${file.name} 大于10MB`,
            });
            continue;
          }
          imageFiles.push(file);
        } else if (isVideo) {
          // 如果已经有视频文件了，跳过
          if (videoFile) {
            toast({
              variant: 'destructive',
              title: '只能选择一个视频',
              description: '已跳过其他视频文件',
            });
            continue;
          }

          // 检查视频大小
          if (file.size > 4 * 1024 * 1024 * 1024) { // 4GB
            toast({
              variant: 'destructive',
              title: '视频太大',
              description: `视频 ${file.name} 大于4GB`,
            });
            continue;
          }
          videoFile = file;
        }
      } catch (error) {
        console.error('File check failed:', error);
        toast({
          variant: 'destructive',
          title: '文件检查失败',
          description: `文件 ${file.name} 检查失败: ${error instanceof Error ? error.message : '请重试'}`,
        });
        continue;
      }
    }

    // 如果有有效文件，则更新状态并打开模态框
    if (imageFiles.length > 0 || videoFile) {
      setImageFiles(prev => [...prev, ...imageFiles]);
      if (videoFile) {
        setVideoFile(videoFile);
      }
      setModalOpen(true);
    }

    // 清除 input 的值，这样用户可以再次选择相同的文件
    event.target.value = '';
  }, [checkFileExists, folderId, toast]);

  // 处理图片上传
  const handleImageUpload = useCallback(async (imageFiles: File[], folderId: string) => {
    try {
      // 检查每个文件的MD5
      const fileChecks = await Promise.all(
        imageFiles.map(async (file) => {
          const md5 = await calculateMD5(file);
          return { file, md5 };
        })
      );

      // 上传图片
      for (const { file, md5 } of fileChecks) {
        // 检查文件是否存在
        const checkResponse = await checkFileExists({
          filename: file.name,
          fileSize: file.size,
          folderId,
          md5,
        });

        if (checkResponse.data.code !== 0) {
          throw new Error(checkResponse.data.message || '检查文件失败');
        }

        // 如果文件已存在，跳过上传
        if (checkResponse.data.data.exists) {
          console.log(`文件 ${file.name} 已存在，跳过上传`);
          continue;
        }

        const formData = new FormData();
        formData.append('files', file); // 改为 'files'
        formData.append('folder_id', folderId || ''); // 改为 'folder_id'

        const response = await StorageService.file.uploadImages(formData);
        if (response.data.code !== 0) {
          throw new Error(response.data.message || '上传失败');
        }
      }

      // 刷新文件列表
      await queryClient.invalidateQueries({
        queryKey: ['files', { folderId }],
        exact: true,
      });
      await queryClient.invalidateQueries({
        queryKey: ['storage-stats'],
        exact: true,
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error instanceof Error ? error.message : '图片上传失败',
      });
      throw error;
    }
  }, [calculateMD5, checkFileExists, queryClient, toast]);

  // 取消上传
  const cancelUpload = useCallback(() => {
    setIsUploading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // 添加取消按钮的点击处理
  const handleCancelClick = useCallback(() => {
    if (isUploading) {
      cancelUpload();
      toast({
        title: '已取消',
        description: '文件上传已取消',
      });
    }
  }, [isUploading, cancelUpload, toast]);

  // 处理模态框关闭
  const handleModalClose = useCallback(() => {
    if (isUploading) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    setModalOpen(false);
    setImageFiles([]);
    setVideoFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  }, [isUploading]);

  // 上传视频
  const handleVideoUpload = useCallback(async (videoFile: File, folderId: string) => {
    const inProgress = new Set<number>();
    const failed = new Set<number>();
    const uploadedChunks = new Set<number>();
    let isUploading = !abortControllerRef.current?.signal.aborted;
    let totalChunks = 0;

    // 更新进度的函数
    const updateProgress = () => {
      const progress = (uploadedChunks.size / totalChunks) * 100;
      setUploadProgress(Math.min(progress, 99)); // 最大显示99%，留1%给合并过程
    };

    try {
      // 计算文件MD5
      const md5 = await calculateMD5(videoFile);
      console.log('视频文件MD5:', md5);

      // 检查文件
      const checkResponse = await checkFileExists({
        filename: videoFile.name,
        fileSize: videoFile.size,
        folderId,
        md5,
      });

      console.log('检查文件响应:', checkResponse);

      if (checkResponse.data.code !== 0) {
        throw new Error(checkResponse.data.message || '检查文件失败');
      }

      const { fileId, chunkSize, chunkCount } = checkResponse.data.data;
      totalChunks = chunkCount;

      // 如果文件已存在，直接返回成功
      if (checkResponse.data.data.exists) {
        toast({
          title: '文件已存在',
          description: '秒传成功',
        });
        setUploadProgress(100);
        return () => {};
      }

      // 初始化上传
      console.log('初始化上传...');
      const initResponse = await StorageService.file.initUpload({
        fileId,
        filename: videoFile.name,
        fileSize: videoFile.size,
        folderId,
        md5,
      });

      if (initResponse.data.code !== 0) {
        throw new Error(initResponse.data.message || '初始化上传失败');
      }

      // 创建分片任务
      const chunks: { index: number; start: number; end: number }[] = [];
      for (let i = 0; i < chunkCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, videoFile.size);
        chunks.push({ index: i, start, end });
      }

      console.log(`开始上传视频，共 ${chunks.length} 个分片`);

      // 并发上传分片
      const concurrency = 3;

      for (let i = 0; i < chunks.length && isUploading; i += concurrency) {
        const batch = chunks.slice(i, Math.min(i + concurrency, chunks.length));
        console.log(`处理批次 ${i / concurrency + 1}，包含分片:`, batch.map(b => b.index));

        try {
          await Promise.all(
            batch.map(async (item) => {
              if (!isUploading) return;

              inProgress.add(item.index);
              console.log(`开始上传分片 ${item.index}`);

              const chunk = videoFile.slice(item.start, item.end);
              const formData = new FormData();
              formData.append('file', chunk, `chunk-${item.index}`);
              
              try {
                await StorageService.file.uploadVideoChunk({
                  fileId,
                  chunk_num: item.index,
                  total: chunkCount,
                  file: formData,
                  signal: abortControllerRef.current?.signal,
                });
                console.log(`分片 ${item.index} 上传成功`);
                uploadedChunks.add(item.index);
                updateProgress();
              } catch (error) {
                console.error(`分片 ${item.index} 上传失败:`, error);
                failed.add(item.index);
                throw error;
              } finally {
                inProgress.delete(item.index);
              }
            })
          );
        } catch (error) {
          if (!isUploading) {
            console.log('上传已取消，停止继续上传');
            break;
          }
          console.error(`批次 ${i / concurrency + 1} 上传失败:`, error);
          throw error;
        }
      }

      if (!isUploading) {
        console.log('上传已取消');
        return () => {};
      }

      // 等待文件合并完成
      console.log('所有分片上传完成，等待文件合并...');
      let retries = 0;
      const maxRetries = 30; // 增加到30次，每次1秒

      while (retries < maxRetries && isUploading) {
        console.log(`检查状态，第 ${retries + 1} 次尝试`);
        const progressResponse = await StorageService.file.getUploadProgress(fileId);

        if (progressResponse.data.code === 0) {
          const status = progressResponse.data.data;
          console.log('当前状态:', status);

          if (status.status === 'completed') {
            console.log('文件合并完成');
            setUploadProgress(100);
            toast({
              title: '上传成功',
              description: '视频文件已上传并处理完成',
            });
            setIsUploading(false);
            await queryClient.invalidateQueries({
              queryKey: ['files', { folderId }],
              exact: true,
            });
            await queryClient.invalidateQueries({
              queryKey: ['storage-stats'],
              exact: true,
            });
            return () => {};
          } else if (status.status === 'failed') {
            throw new Error(status.errorMessage || '文件处理失败');
          }

          // 如果还在上传中或合并中，继续等待
          if (status.status === 'uploading' || status.status === 'merging') {
            if (status.status === 'uploading') {
              const failedChunks = status.chunks
                .map((chunk, index) => ({ chunk, index }))
                .filter(({ chunk }) => chunk === 0);

              if (failedChunks.length > 0) {
                console.log(`发现 ${failedChunks.length} 个失败的分片，准备重新上传`);
                for (const { index } of failedChunks) {
                  if (!isUploading) break;
                  console.log(`重新上传分片 ${index}`);
                  const start = index * chunkSize;
                  const end = Math.min(start + chunkSize, videoFile.size);
                  const chunk = videoFile.slice(start, end);
                  
                  const formData = new FormData();
                  formData.append('file', new Blob([chunk], { type: videoFile.type }), `${index}.mp4`);
                  
                  try {
                    await StorageService.file.uploadVideoChunk({
                      fileId,
                      chunk_num: index,
                      total: chunkCount,
                      file: formData,
                      signal: abortControllerRef.current?.signal,
                    });
                    console.log(`分片 ${index} 重新上传成功`);
                    uploadedChunks.add(index);
                    updateProgress();
                  } catch (error) {
                    if (!isUploading) {
                      console.log('上传已取消，停止重试');
                      break;
                    }
                    console.error(`分片 ${index} 重新上传失败:`, error);
                    throw error;
                  }
                }
              }
            }

            // 更新进度（使用服务器返回的状态）
            if (status.chunks) {
              const serverProgress = status.chunks.filter(chunk => chunk === 1).length / chunkCount * 100;
              // 取本地记录和服务器状态中的较大值
              setUploadProgress(Math.max(Math.min(serverProgress, 99), (uploadedChunks.size / totalChunks) * 100));
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
            continue;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
      }

      if (retries >= maxRetries) {
        throw new Error('等待文件处理超时');
      }
    } catch (err) {
      console.error('上传失败:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        toast({
          title: '上传已取消',
          description: '已取消视频上传',
        });
      } else {
        toast({
          title: '上传失败',
          description: err instanceof Error ? err.message : '视频上传失败',
          variant: 'destructive',
        });
      }
      throw err;
    }

    // 返回取消函数
    return () => {
      isUploading = false;
      inProgress.clear();
      failed.clear();
      uploadedChunks.clear();
    };
  }, [calculateMD5, checkFileExists, queryClient, setUploadProgress, toast]);

  // 开始上传
  const handleUpload = useCallback(async () => {
    if (!folderId) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: '请先选择要上传到的文件夹',
      });
      return;
    }

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    const cancelFunctions: (() => void)[] = [];

    try {
      setIsUploading(true);

      if (imageFiles.length > 0) {
        await handleImageUpload(imageFiles, folderId);
      }

      if (videoFile) {
        const cancelUpload = await handleVideoUpload(videoFile, folderId);
        cancelFunctions.push(cancelUpload);
      }

      if (!abortControllerRef.current?.signal.aborted) {
        setModalOpen(false);
        setImageFiles([]);
        setVideoFile(null);
        toast({
          title: '上传成功',
          description: '所有文件已上传完成',
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (!abortControllerRef.current?.signal.aborted) {
        toast({
          variant: 'destructive',
          title: '上传失败',
          description: error instanceof Error ? error.message : '上传失败',
        });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsUploading(false);
        setUploadProgress(0);
      }
      // 清理取消函数
      cancelFunctions.forEach(cancel => cancel());
      abortControllerRef.current = null;
    }
  }, [folderId, handleImageUpload, handleVideoUpload, imageFiles, setImageFiles, setIsUploading, setModalOpen, setUploadProgress, toast, videoFile]);

  return (
    <>
      <Input
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        id="file-upload"
        onChange={handleFileSelect}
      />
      <Label htmlFor="file-upload">
        <Button
          variant="outline"
          className="cursor-pointer"
          asChild
        >
          <span>
            <UploadIcon className="h-4 w-4 mr-2" />
            上传文件
          </span>
        </Button>
      </Label>

      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>上传文件</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1">
                <div>
                  上传位置：{folderName || '根目录'}
                </div>
                <div className="text-sm text-muted-foreground">
                  支持上传图片和视频文件，图片大小不超过10MB，视频不超过5GB
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {imageFiles.length > 0 && (
              <div className="space-y-2">
                <Label>图片文件</Label>
                <div className="grid grid-cols-2 gap-2">
                  {imageFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8"
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videoFile && (
              <div className="space-y-2">
                <Label>视频文件</Label>
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="truncate">{videoFile.name}</div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={() => setVideoFile(null)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Label>上传进度</Label>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={!isUploading}
              >
                取消
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || (!imageFiles.length && !videoFile)}
              >
                {isUploading ? '上传中...' : '开始上传'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadButton;
