import { useQuery, UseQueryResult } from '@tanstack/react-query';
import api from '../../services/api';
import type { SearchFilters, SearchResponse } from '../../types';

export const useAdsSearch = (
  filters: SearchFilters,
  enabled: boolean = true
): UseQueryResult<SearchResponse, Error> => {
  return useQuery({
    queryKey: ['ads', 'search', filters],
    queryFn: () => api.searchAds(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdById = (id: string) => {
  return useQuery({
    queryKey: ['ads', id],
    queryFn: () => api.getAdById(id),
    enabled: !!id,
  });
};
