import { API_BASE } from './api/client';

export const resolveImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
};

export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || price === -1) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
};
