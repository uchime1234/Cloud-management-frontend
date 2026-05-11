// hooks/useCostAnalytics.ts
import { useState, useEffect } from 'react';
import { cloudApi } from '../utils/api';
import { CostAnalyticsData } from '../types';

interface UseCostAnalyticsProps {
  accountId: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useCostAnalytics = ({
  accountId,
  autoRefresh = true,
  refreshInterval = 4 * 60 * 60 * 1000, // 4 hours
}: UseCostAnalyticsProps) => {
  const [data, setData] = useState<CostAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cloudApi.getCostAnalytics(accountId);
      
      // Transform backend response to match frontend format
      const transformedData: CostAnalyticsData = {
        total_spend: response.data.total_spend,
        monthly_change: response.data.monthly_change,
        forecast: response.data.forecast,
        daily_spend: response.data.daily_spend,
        service_breakdown: response.data.service_breakdown || {},
        current_month: response.data.current_month,
        last_updated: response.data.last_updated,
      };
      
      setData(transformedData);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch cost analytics');
      console.error('Error fetching cost analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncNow = async () => {
    try {
      await cloudApi.syncAccountCosts(accountId);
      await fetchAnalytics(); // Refresh data after sync
    } catch (err: any) {
      setError('Failed to sync costs: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAnalytics();

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(fetchAnalytics, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [accountId, autoRefresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchAnalytics,
    syncNow,
  };
};