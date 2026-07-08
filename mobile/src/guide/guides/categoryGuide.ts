import type { GuideDefinition } from '../types';

export const categoryGuide: GuideDefinition = {
  id: 'categoryGuide',
  version: 1,
  title: 'Hướng dẫn danh mục sản phẩm',
  steps: [
    {
      id: 'cat-fab',
      screen: 'CategoryList',
      target: 'categoryFab',
      title: 'Mở thêm danh mục',
      description: 'Chạm vào nút này để mở thêm danh mục sản phẩm bạn muốn kinh doanh.',
      placement: 'left',
      order: 1,
    },
    {
      id: 'cat-search',
      screen: 'CategoryList',
      target: 'searchBar',
      title: 'Tìm kiếm sản phẩm',
      description: 'Nhập tên sản phẩm để tìm kiếm nhanh trong danh mục.',
      placement: 'bottom',
      order: 2,
    },
    {
      id: 'cat-sidebar',
      screen: 'CategoryList',
      target: 'categorySidebar',
      title: 'Danh mục sản phẩm',
      description: 'Chọn danh mục để xem các sản phẩm thuộc danh mục đó.',
      placement: 'right',
      order: 3,
    },
  ],
  condition: {
    role: ['AGENCY'],
  },
};
