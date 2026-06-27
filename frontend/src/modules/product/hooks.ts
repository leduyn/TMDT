'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, PageResponse, ProductDTO } from '@/lib/api';

export const productKeys = {
  all: ['products'] as const,
  page: (filters: Record<string, any>) => ['products', 'page', filters] as const,
  detail: (id: number) => ['products', 'detail', id] as const,
};

export function useProductPage(params: {
  page?: number;
  size?: number;
  search?: string;
  agencyId?: number;
  categoryId?: number;
}) {
  return useQuery<PageResponse<ProductDTO>>({
    queryKey: productKeys.page(params),
    queryFn: () => productApi.getPage(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  const prefetch = (params: {
    page?: number;
    size?: number;
    search?: string;
    agencyId?: number;
    categoryId?: number;
  }) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.page(params),
      queryFn: () => productApi.getPage(params),
      staleTime: 30 * 1000,
    });
  };

  return { prefetch };
}
