import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export function useMarketPrices() {
  return useQuery<TickerItem[]>({
    queryKey: ['marketPrices'],
    queryFn: () => api.getMarketPrices(),
    refetchInterval: 30000,
    staleTime: 25000,
  });
}

export function useMarketChart(coinId: string | null) {
  return useQuery({
    queryKey: ['marketChart', coinId],
    queryFn: () => api.getMarketChart(coinId!),
    enabled: !!coinId,
    staleTime: 30000,
  });
}
