import { clsx, type ClassValue } from "clsx"
import { FileIcon, FolderIcon } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function getPageTitle(segment: string): string {
  const titles: Record<string, string> = {
    admin: '后台管理',
    products: '产品管理',
    reviews: '测评管理',
    comments: '评论管理',
    users: '用户管理',
    categories: '分类管理',
    analytics: '数据统计',
    settings: '系统设置',
    new: '新建',
    edit: '编辑',
  }
  return titles[segment] || segment
}
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function getFileIcon(type: string) {
  if (type === 'folder') return FolderIcon
  return FileIcon
}
// 软硬度转换
export const softnessMap = {
  ULTRA_SOFT: '超软',
  SOFT: '软',
  MEDIUM: '适中',
  HARD: '硬',
  ULTRA_HARD: '超硬'
} as const

// 刺激度转换
export const stimulationMap = {
  LOW: '温和',
  MEDIUM: '适中',
  HIGH: '强烈',
  ULTRA_HIGH: '极强'
} as const

// 紧致度转换
export const tightnessMap = {
  LOOSE: '松软',
  MEDIUM: '适中',
  TIGHT: '紧致',
  ULTRA_TIGHT: '极紧'
} as const

// 气味转换
export const smellMap = {
  NONE: '无味',
  LIGHT: '淡淡',
  MEDIUM: '适中',
  STRONG: '浓郁'
} as const

// 出油量转换
export const oilinessMap = {
  LOW: '少量',
  MEDIUM: '适中',
  HIGH: '较多',
  ULTRA_HIGH: '大量'
} as const

type MapKey = keyof typeof softnessMap | keyof typeof stimulationMap | 
  keyof typeof tightnessMap | keyof typeof smellMap | keyof typeof oilinessMap

export const getParameterText = (value: MapKey | null | undefined, type: 'softness' | 'stimulation' | 'tightness' | 'smell' | 'oiliness'): string => {
  if (!value) return '未知'
  
  const maps = {
    softness: softnessMap,
    stimulation: stimulationMap,
    tightness: tightnessMap,
    smell: smellMap,
    oiliness: oilinessMap
  }
  
  return maps[type][value as keyof typeof maps[typeof type]] || '未知'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date)
}