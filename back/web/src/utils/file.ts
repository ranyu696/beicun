import {
  Image,
  Video,
  Music,
  FileText,
  FileSpreadsheet,
  FileType,
  FileJson,
  Archive,
  File,
  LucideIcon
} from 'lucide-react';

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取文件类型图标
export const getFileTypeIcon = (type: string): LucideIcon => {
  if (type.startsWith('image/')) {
    return Image;
  }
  if (type.startsWith('video/')) {
    return Video;
  }
  if (type.startsWith('audio/')) {
    return Music;
  }
  if (type.includes('word') || type.includes('document')) {
    return FileText;
  }
  if (type.includes('excel') || type.includes('spreadsheet')) {
    return FileSpreadsheet;
  }
  if (type.includes('pdf')) {
    return FileType;
  }
  if (type.includes('text') || type.includes('json')) {
    return FileJson;
  }
  if (type.includes('zip') || type.includes('compressed') || type.includes('archive')) {
    return Archive;
  }
  return File;
};

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// 检查文件类型是否允许
export const isAllowedFileType = (file: File, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(file.name).toLowerCase();
  return allowedTypes.includes(`.${extension}`);
};

// 检查文件大小是否允许
export const isAllowedFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

