import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

export function useCachedQuery<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Ref to track if we have mounted (to avoid setting state on unmounted components)
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        // Only show full loading spinner if we don't have data yet
        if (!data) setLoading(true);
      }

      // 1. STRATEGY: Stale-While-Revalidate
      // First, try to load from cache IMMEDIATELY to show something to the user
      if (!isRefresh) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached && isMounted.current) {
            const parsed = JSON.parse(cached);
            setData(parsed);
            // If we found cache, we can stop the big loading spinner
            // The network request will happen in the background
            setLoading(false);
          }
        } catch (e) {
          console.warn("Cache read error", e);
        }
      }

      // 2. Then, try to fetch fresh data from the network
      try {
        const result = await fetcher();

        if (isMounted.current) {
          await AsyncStorage.setItem(key, JSON.stringify(result));
          setData(result);
          setIsOffline(false);
          setLoading(false); // Ensure loading is off
        }
      } catch (error) {
        console.log(`[${key}] Network request failed, using cache.`);
        if (isMounted.current) {
          setIsOffline(true);
          setLoading(false);
        }
        // We don't need to load cache here because we already did it in step 1!
      } finally {
        if (isMounted.current) setRefreshing(false);
      }
    },
    [key],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    isOffline,
    refresh: () => loadData(true),
    refreshing,
  };
}
