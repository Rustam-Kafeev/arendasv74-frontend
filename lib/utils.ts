export const isImageUrl = (text: string): boolean => {
  if (!text) return false;
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(text)) return true;
  if (text.includes('cloudinary.com') || text.includes('res.cloudinary.com')) return true;
  if (text.startsWith('http') && /image|photo|picture|img|upload/i.test(text)) return true;
  return false;
};

export const getImageUrl = (url: string): string => {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `http://127.0.0.1:8000${url}`;
  return `http://127.0.0.1:8000/${url}`;
};

export const formatPrice = (value: number): string => {
  return value.toLocaleString('ru-RU');
};

export const parseNumber = (val: string): number => {
  return Number(val.replace(/\D/g, '')) || 0;
};