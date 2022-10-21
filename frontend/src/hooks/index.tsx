import { useState } from 'react';
export function usePromiseLoading<T extends Array<any>>(p: (...params: T) => Promise<any>) {
  const [loading, setLoading] = useState(false);
  return {
    loading,
    run: (...params: T): Promise<any> => {
      setLoading(true);
      return p(...params).finally(() => {
        setLoading(false);
      });
    },
  };
}
