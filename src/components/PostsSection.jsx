import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function PostsSection({ user }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New post form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/posts?page=${p}&limit=5`);
      setPosts(res.data);
      setPagination(res.pagination);
      setPage(res.pagination.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      setTitle('');
      setContent('');
      setShowCreate(false);
      fetchPosts(1);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <div>
          <span>📢 Public Posts Feed</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
            (Indexed via <code>postSchema.index(&#123; createdAt: -1 &#125;)</code>)
          </span>
        </div>
        {user && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? 'Cancel' : '+ New Post'}
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreatePost} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 6, marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Publish Public Post</h4>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post here..."
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Publish Post
          </button>
        </form>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
          No posts available. Be the first to publish one!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '1.25rem',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{post.title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                By <strong>{post.userId?.name || 'Unknown'}</strong> ({post.userId?.email})
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className="pagination">
        <div className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} posts total)
        </div>
        <div className="pagination-buttons">
          <button
            className="btn btn-secondary btn-sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
