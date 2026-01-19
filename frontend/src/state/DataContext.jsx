import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

const API_BASE = 'http://localhost:4001/api';

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 2,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = useCallback(async (signal, { page = 1, limit = 2, q = '' } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (q) params.set('q', q);

      const res = await fetch(`${API_BASE}/items?${params}`, { signal });
      const json = await res.json();

      setItems(json.items);
      setPagination(json.pagination);
      setSearchQuery(q);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{
      items,
      pagination,
      loading,
      searchQuery,
      fetchItems,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
