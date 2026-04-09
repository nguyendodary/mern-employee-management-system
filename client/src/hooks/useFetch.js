import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, { params: options.params });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options.params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (method, url, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api[method](url, data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
