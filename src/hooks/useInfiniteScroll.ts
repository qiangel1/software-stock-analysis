/**
 * useInfiniteScroll Hook
 * 
 * Custom hook for infinite scroll pagination.
 */

import { useEffect, useCallback, useRef, useState } from 'react';

interface UseInfiniteScrollOptions<T> {
  /** Initial data */
  initialData?: T[];
  /** Fetch function */
  fetchFn: (page: number) => Promise<T[]>;
  /** Items per page */
  pageSize?: number;
  /** Threshold for loading more (px from bottom) */
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  /** Data items */
  items: T[];
  /** Loading state */
  isLoading: boolean;
  /** Loading more state */
  isLoadingMore: boolean;
  /** Has more items */
  hasMore: boolean;
  /** Error message */
  error: string | null;
  /** Reset and refetch */
  reset: () => void;
  /** Target element ref for intersection observer */
  targetRef: React.RefObject<HTMLDivElement>;
}

/**
 * Infinite scroll hook
 */
export function useInfiniteScroll<T>({
  initialData = [],
  fetchFn,
  pageSize = 20,
  threshold = 200,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  
  // Fetch data
  const fetchData = useCallback(async (pageNum: number, isReset: boolean = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      const newItems = await fetchFn(pageNum);
      
      if (isReset) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }
      
      setHasMore(newItems.length >= pageSize);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [fetchFn, pageSize]);
  
  // Initial fetch
  useEffect(() => {
    fetchData(1, true);
  }, []);
  
  // Set up intersection observer
  useEffect(() => {
    if (!hasMore) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
          setIsLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchData(nextPage);
        }
      },
      { threshold: threshold / window.innerHeight }
    );
    
    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, page, fetchData, threshold]);
  
  // Reset function
  const reset = useCallback(() => {
    setPage(1);
    setIsLoading(true);
    setHasMore(true);
    setItems([]);
    fetchData(1, true);
  }, [fetchData]);
  
  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    reset,
    targetRef: targetRef as React.RefObject<HTMLDivElement>,
  };
}
