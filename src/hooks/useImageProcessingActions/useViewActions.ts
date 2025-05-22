
import { useCallback } from 'react';

interface UseViewActionsProps {
  setShowBeforeAfter: React.Dispatch<React.SetStateAction<number | null>>;
}

/**
 * Hook for view-related actions
 */
export function useViewActions({
  setShowBeforeAfter
}: UseViewActionsProps) {
  
  const toggleBeforeAfterView = useCallback((index: number | null) => {
    setShowBeforeAfter(prevIndex => prevIndex === index ? null : index);
  }, [setShowBeforeAfter]);
  
  return {
    toggleBeforeAfterView
  };
}
