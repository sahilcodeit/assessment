import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import Stats from '../components/Stats';
import './Items.css';

const ITEM_HEIGHT = 56;
const LIST_HEIGHT = 400;

function Items() {
  const { items, pagination, loading, fetchItems } = useData();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const abortControllerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch items when page or search changes
  const loadItems = useCallback((page = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    fetchItems(abortControllerRef.current.signal, {
      page,
      limit: 2,
      q: debouncedSearch,
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });
  }, [fetchItems, debouncedSearch]);

  useEffect(() => {
    loadItems(1);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadItems]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadItems(newPage);
    }
  };

  // Virtualized row renderer
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style} className="item-row">
        <Link to={`/items/${item.id}`} className="item-link">
          <span className="item-name">{item.name}</span>
          <span className="item-category">{item.category}</span>
          <span className="item-price">${item.price}</span>
        </Link>
      </div>
    );
  };

  // Skeleton loader
  const SkeletonRow = ({ style }) => (
    <div style={style} className="item-row skeleton">
      <div className="skeleton-name" />
      <div className="skeleton-category" />
      <div className="skeleton-price" />
    </div>
  );

  return (
    <div className="items-container">
      <Stats />

      <input
        type="text"
        className="search-box"
        placeholder="Search items by name or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {!loading && pagination.total > 0 && (
        <div className="results-info">
          Showing {items.length} of {pagination.total} items
          {debouncedSearch && ` for "${debouncedSearch}"`}
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <List
            height={LIST_HEIGHT}
            itemCount={5}
            itemSize={ITEM_HEIGHT}
            width="100%"
          >
            {SkeletonRow}
          </List>
        ) : items.length > 0 ? (
          <List
            height={Math.min(LIST_HEIGHT, items.length * ITEM_HEIGHT)}
            itemCount={items.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try adjusting your search query</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={loading || pagination.page === 1}
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={loading || pagination.page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={loading || pagination.page === pagination.totalPages}
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={loading || pagination.page === pagination.totalPages}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}

export default Items;
