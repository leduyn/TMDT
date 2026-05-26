export const getBackendUrl = () => {
  return '';
};

export const resolveImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${getBackendUrl()}${url}`;
  if (url.startsWith('uploads/')) return `${getBackendUrl()}/${url}`;
  return url;
};

