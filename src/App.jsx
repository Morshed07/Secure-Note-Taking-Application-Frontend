import React, { useState, useEffect } from 'react';
import { apiFetch, getAuthToken, setAuthToken } from './api';
import AuthSection from './components/AuthSection';
import NotesSection from './components/NotesSection';
import AdminSection from './components/AdminSection';
import AggregationsSection from './components/AggregationsSection';
import PostsSection from './components/PostsSection';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'posts', 'aggregations', 'admin'

  // Verify token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setActiveTab('notes');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        Initializing Secure Application...
      </div>
    );
  }

  return (
    <div>
      <header>
        <div className="container header-content">
          <div className="logo-area">
            <h1>🔒 Secure Note-Taking Application</h1>
            <span>Mongoose Indexes • MongoDB Aggregations • JWT & RBAC</span>
          </div>

          <div className="user-status">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.email} •{' '}
                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please sign in to manage notes
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {!user ? (
          <AuthSection onAuthSuccess={(loggedInUser) => setUser(loggedInUser)} />
        ) : (
          <div>
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                📝 My Notes
              </button>
              <button
                className={`tab-btn ${activeTab === 'aggregations' ? 'active' : ''}`}
                onClick={() => setActiveTab('aggregations')}
              >
                📊 Aggregations (Scenarios 1 & 2)
              </button>
              <button
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                📢 Public Posts
              </button>
              {user.role === 'admin' && (
                <button
                  className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  👑 Admin Panel
                </button>
              )}
            </div>

            {activeTab === 'notes' && <NotesSection user={user} />}
            {activeTab === 'aggregations' && <AggregationsSection />}
            {activeTab === 'posts' && <PostsSection user={user} />}
            {activeTab === 'admin' && user.role === 'admin' && <AdminSection />}
          </div>
        )}
      </main>
    </div>
  );
}
