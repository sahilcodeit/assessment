import React, { useEffect, useState } from 'react';
import './Stats.css';

const API_BASE = 'http://localhost:4001/api';

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/stats`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="stats-container">
        <div className="stat-card skeleton">
          <div className="skeleton-label" />
          <div className="skeleton-value" />
        </div>
        <div className="stat-card skeleton">
          <div className="skeleton-label" />
          <div className="skeleton-value" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="stats-container">
      <div className="stat-card">
        <span className="stat-label">Total Items</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Average Price</span>
        <span className="stat-value">${stats.averagePrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default Stats;
