
import { useCallback } from 'react';
import { clearImageCache } from '@/utils/imageCacheUtils';
import { toast } from '@/hooks/use-toast';
import { clearAnalyticsData } from '@/utils/analyticsUtils';

/**
 * Hook for system-related actions
 */
export function useSystemActions() {
  
  const handleClearImageCache = useCallback(() => {
    clearImageCache();
    toast({
      title: "Cache Cleared",
      description: "Image processing cache has been cleared"
    });
  }, []);
  
  const handleClearAnalyticsData = useCallback(() => {
    clearAnalyticsData();
    toast({
      title: "Analytics Cleared",
      description: "Analytics data has been reset"
    });
  }, []);
  
  return {
    clearImageCache: handleClearImageCache,
    clearAnalyticsData: handleClearAnalyticsData
  };
}
