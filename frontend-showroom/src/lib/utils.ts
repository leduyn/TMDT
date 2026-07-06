export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === -1) return 'Liên hệ'
  return price.toLocaleString('vi-VN') + '₫'
}

export function getGeometryForCategory(categoryName: string): {
  shape: 'torusKnot' | 'box' | 'dodecahedron' | 'icosahedron' | 'torus' | 'sphere'
  color: string
} {
  const lower = (categoryName || '').toLowerCase()
  if (lower.includes('điện thoại') || lower.includes('phone')) return { shape: 'torusKnot', color: '#00f2fe' }
  if (lower.includes('laptop') || lower.includes('pc') || lower.includes('máy tính')) return { shape: 'box', color: '#4facfe' }
  if (lower.includes('phụ kiện') || lower.includes('accessory')) return { shape: 'dodecahedron', color: '#ff6b6b' }
  if (lower.includes('âm thanh') || lower.includes('audio') || lower.includes('loa')) return { shape: 'icosahedron', color: '#00ff87' }
  if (lower.includes('đồng hồ') || lower.includes('watch')) return { shape: 'torus', color: '#ffd93d' }
  return { shape: 'sphere', color: '#ffffff' }
}
