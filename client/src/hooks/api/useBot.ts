import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { toast } from '../../components/ui/toast';
import api from '../../services/api';
import type { BotStatus, BotStats, BotRun } from '../../types';

/**
 * Hook to get bot status
 */
export const useBotStatus = (): UseQueryResult<BotStatus, Error> => {
  return useQuery({
    queryKey: ['bot', 'status'],
    queryFn: async () => {
      const response = await api.getBotStatus();
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds to get real-time status
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to get bot statistics
 */
export const useBotStats = (): UseQueryResult<BotStats, Error> => {
  return useQuery({
    queryKey: ['bot', 'stats'],
    queryFn: async () => {
      const response = await api.getBotStats();
      return response.data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to start the bot cron scheduler
 */
export const useStartBotCron = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.startBotCron();
    },
    onSuccess: () => {
      toast.success('Bot scheduler started successfully!');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bot', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['bot', 'stats'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to start scheduler';
      toast.error(message);
    },
  });
};

/**
 * Hook to stop the bot cron scheduler
 */
export const useStopBotCron = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.stopBotCron();
    },
    onSuccess: () => {
      toast.success('Bot scheduler stopped successfully!');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bot', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['bot', 'stats'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to stop scheduler';
      toast.error(message);
    },
  });
};

/**
 * Hook to trigger a manual scraping task
 */
export const useTriggerBotScrape = (): UseMutationResult<BotRun, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.triggerBotScrape();
      return response.data;
    },
    onSuccess: () => {
      toast.success('Scraping task started successfully!');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bot', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['bot', 'stats'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to trigger scrape';
      toast.error(message);
    },
  });
};

/**
 * Hook to stop the bot
 */
export const useStopBot = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.stopBot();
    },
    onSuccess: () => {
      toast.success('Bot stopped successfully!');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bot', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['bot', 'stats'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to stop bot';
      toast.error(message);
    },
  });
};
