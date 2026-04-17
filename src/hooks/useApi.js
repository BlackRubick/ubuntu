import { useState, useCallback } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function useApi(endpoint, method = 'get', options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = useAuthStore?.getState?.()?.user;
  // Permite endpoint dinámico: request(body, endpointOverride)
  const request = useCallback(async (body, endpointOverride) => {
    setLoading(true);
    setError(null);
    try {
      const url = endpointOverride || endpoint;
      const res = await api[method](url, body, options);
      setData(res.data);
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Error';
      setError(msg);
      // No lanzar excepción si es 403 y usuario laboratorio
      if (status === 403 && user?.role === 'LABORATORIO') {
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, options, user]);

  return { data, loading, error, request };
}
