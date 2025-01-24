import {
  LayoutDashboard,
  Package,
  Star,
  Users,
  Settings,
  Briefcase,
  FolderTree,
  MessageSquare,
  Box,
  Layers,
  Cable,
  Paintbrush,
  Folder,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

export const navigation: NavItem[] = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '产品管理',
    href: '/product',
    icon: Package,
    children: [
      {
        title: '产品列表',
        href: '/product',
        icon: Package,
      },
      {
        title: '产品评分',
        href: '/product/rating',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: '测评管理',
    href: '/review',
    icon: Layers,
    children: [
      {
        title: '测评列表',
        href: '/review',
        icon: Layers,
      },
      {
        title: '测评评论',
        href: '/review/comment',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: '品牌管理',
    href: '/brand',
    icon: Star,
  },
  {
    title: '类型管理',
    href: '/types',
    icon: FolderTree,
    children: [
      {
        title: '器具类型',
        href: '/types/utility',
        icon: Box,
      },
      {
        title: '产品类型',
        href: '/types/product',
        icon: Layers,
      },
      {
        title: '通道类型',
        href: '/types/channel',
        icon: Cable,
      },
      {
        title: '材料类型',
        href: '/types/material',
        icon: Paintbrush,
      },
    ],
  },
  {
    title: '用户管理',
    href: '/user',
    icon: Users,
    children: [
      {
        title: '用户列表',
        href: '/user/list',
        icon: Users,
      },
    ],
  },
  {
    title: '文件管理',
    href: '/file',
    icon: Folder,
  },
  {
    title: '企业管理',
    href: '/company',
    icon: Briefcase,
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
]
