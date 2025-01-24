import { axiosInstance } from './axios';
import type {
  File,
  Folder,
  StorageStats,
  FolderQueryParams,
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
  FileUploadResult,
  FileUploadStatus,
} from '@/types/storage';

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应类型
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
}

const StorageService = {
  file: {
    // 检查文件是否存在
    checkFileExists: (params: { filename: string; fileSize: number; folderId: string; md5: string }) =>
      axiosInstance.post<ApiResponse<{
        exists: boolean;
        fileId: string;
        chunkSize: number;
        chunkCount: number;
        status: string;
        url?: string;
        md5: string;
      }>>('/files/upload/check', {
        name: params.filename,
        size: params.fileSize,
        folderId: params.folderId,
        md5: params.md5,
      }),

    // 初始化上传
    initUpload: (params: { fileId: string; filename: string; fileSize: number; folderId: string; md5: string }) =>
      axiosInstance.post<ApiResponse<{ success: boolean }>>('/files/upload/init', {
        id: params.fileId,
        name: params.filename,
        size: params.fileSize,
        folderId: params.folderId,
        md5: params.md5,
        status: 'uploading',
        chunks: new Array(Math.ceil(params.fileSize / (5 * 1024 * 1024))).fill(0), // 默认5MB分片大小
      }),

    // 上传图片
    uploadImages: (data: FormData) =>
      axiosInstance.post<ApiResponse<FileUploadResult[]>>('/files/upload/images', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),

    // 上传视频分片
    uploadVideoChunk: (params: { 
      fileId: string; 
      chunk_num: number; 
      total: number; 
      file: FormData;
      signal?: AbortSignal;
    }) =>
      axiosInstance.post<ApiResponse<null>>(`/files/upload/chunk`, params.file, {
        params: {
          file_id: params.fileId,
          chunk_num: params.chunk_num,
          total: params.total,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: params.signal,
      }),

    // 获取上传进度
    getUploadProgress: (fileId: string) =>
      axiosInstance.get<ApiResponse<FileUploadStatus>>(`/files/upload/progress?fileId=${fileId}`),

    // 获取文件列表
    list: (params: { folderId?: string; page: number; pageSize: number }) =>
      axiosInstance.get<PaginatedResponse<File>>('/files', { params }),

    // 删除文件
    delete: (id: string) =>
      axiosInstance.delete<ApiResponse<null>>(`/files/${id}`),

    // 移动文件
    move: (id: string, data: { targetFolderId?: string }) =>
      axiosInstance.post<ApiResponse<null>>(`/files/${id}/move`, data),
  },

  folder: {
    // 创建文件夹
    create: (data: CreateFolderRequest) =>
      axiosInstance.post<ApiResponse<Folder>>('/folders', data),

    // 获取文件夹列表
    list: (params: FolderQueryParams) =>
      axiosInstance.get<PaginatedResponse<Folder>>('/folders', { params }),

    // 获取文件夹详情
    get: (id: string) =>
      axiosInstance.get<ApiResponse<Folder>>(`/folders/${id}`),

    // 更新文件夹
    update: (id: string, data: UpdateFolderRequest) =>
      axiosInstance.patch<ApiResponse<Folder>>(`/folders/${id}`, data),

    // 删除文件夹
    delete: (id: string) =>
      axiosInstance.delete<ApiResponse<null>>(`/folders/${id}`),

    // 移动文件夹
    move: (id: string, data: MoveFolderRequest) =>
      axiosInstance.post<ApiResponse<null>>(`/folders/${id}/move`, data),
  },

  storage: {
    // 获取存储统计信息
    getStats: () =>
      axiosInstance.get<ApiResponse<StorageStats>>('/storage/stats'),
  },
};

export default StorageService;
