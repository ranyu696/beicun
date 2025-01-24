// 文件类型
export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  path: string;
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  folderId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 文件夹类型
export interface Folder {
  id: string;
  name: string;
  path: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// 存储统计信息
export interface StorageStats {
  totalFiles: number;
  totalFolders: number;
  usedSpace: number;
  freeSpace: number;
  imageCount: number;
  videoCount: number;
  otherCount: number;
  recentUploads: number;
  topLevelFolders: number;
}

// 文件上传状态
export interface FileUploadStatus {
  fileId: string;
  status: 'uploading' | 'merging' | 'completed' | 'failed';
  totalSize: number;
  uploadedSize: number;
  chunkSize: number;
  chunksCount: number;
  chunks: number[];
  progress: number;
  lastUpdated: number;
  errorMessage?: string;
}

// 文件上传结果
export interface FileUploadResult {
  id: string;
  filename: string;
  size: number;
  url: string;
  error?: string;
}

// 文件列表查询参数
export interface FileQueryParams {
  page?: number;
  pageSize?: number;
  folderId?: string;
  type?: 'image' | 'video' | 'other';
  keyword?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

// 文件夹列表查询参数
export interface FolderQueryParams {
  page?: number;
  pageSize?: number;
  parentId?: string;
  keyword?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

// 创建文件夹请求
export interface CreateFolderRequest {
  name: string;
  parentId?: string;
  description?: string;
}

// 更新文件夹请求
export interface UpdateFolderRequest {
  name?: string;
  description?: string;
}

// 移动文件请求
export interface MoveFileRequest {
  targetFolderId?: string;
}

// 移动文件夹请求
export interface MoveFolderRequest {
  targetParentId?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 上传分片信息
export interface UploadChunkInfo {
  fileId: string;
  chunkNum: number;
  chunkSize: number;
  total: number;
  filename: string;
  mimeType: string;
  folderId: string;
}
