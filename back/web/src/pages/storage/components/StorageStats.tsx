import React from 'react';
import { FileIcon, FolderIcon, ImageIcon, VideoIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/utils/file';
import type { StorageStats as StorageStatsType } from '@/types/storage';

interface StorageStatsProps {
  stats: StorageStatsType;
}

export const StorageStats: React.FC<StorageStatsProps> = ({ stats }) => {
  const usedPercent = (stats.usedSpace / (stats.usedSpace + stats.freeSpace)) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>已用空间</span>
          <span>{formatFileSize(stats.usedSpace)} / {formatFileSize(stats.usedSpace + stats.freeSpace)}</span>
        </div>
        <Progress value={usedPercent} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2 p-4 rounded-lg bg-primary/10">
          <FileIcon className="h-5 w-5" />
          <div>
            <div className="text-sm font-medium">总文件</div>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-4 rounded-lg bg-blue-500/10">
          <ImageIcon className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium">图片</div>
            <div className="text-2xl font-bold">{stats.imageCount}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-4 rounded-lg bg-green-500/10">
          <VideoIcon className="h-5 w-5 text-green-500" />
          <div>
            <div className="text-sm font-medium">视频</div>
            <div className="text-2xl font-bold">{stats.videoCount}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-4 rounded-lg bg-orange-500/10">
          <FolderIcon className="h-5 w-5 text-orange-500" />
          <div>
            <div className="text-sm font-medium">文件夹</div>
            <div className="text-2xl font-bold">{stats.totalFolders}</div>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        最近7天上传：{stats.recentUploads} 个文件
      </div>
    </div>
  );
};
