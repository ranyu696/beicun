import { createAvatar } from '@dicebear/core';
import { funEmoji } from '@dicebear/collection';

/**
 * 生成随机头像SVG字符串
 * @param seed 用于生成头像的种子字符串，通常使用用户ID或用户名
 * @returns SVG字符串
 */
export function generateAvatarUrl(seed: string): string {
  const avatar = createAvatar(funEmoji, {
    seed,
    size: 128,
    radius: 50,
    backgroundColor: ['b6e3f4', 'c0aede', 'ffdfbf'],
  });

  return avatar.toString();
}

/**
 * 获取用户头像URL
 * @param avatar 用户设置的头像URL或SVG字符串
 * @param seed 用于生成默认头像的种子字符串
 * @returns 头像URL或SVG字符串
 */
export function getAvatarUrl(avatar: string | undefined | null, seed: string): string {
  if (avatar) {
    return avatar;
  }
  return generateAvatarUrl(seed);
}