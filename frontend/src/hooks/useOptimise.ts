import { useState } from 'react';
import { optimise, type OptimiseRequest, type OptimiseResponse } from '../api/fitopt';

export function useOptimise() {
  const [data, setData] = useState<OptimiseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (payload: OptimiseRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await optimise(payload);
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to optimise plan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, run };
}
