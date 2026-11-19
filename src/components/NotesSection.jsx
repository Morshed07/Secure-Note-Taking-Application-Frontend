import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function NotesSection({ user }) {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchNotes = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/notes?page=${pageNum}&limit=6`);
      setNotes(res.data);
      setPagination(res.pagination);
      setPage(res.pagination.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(page);
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/notes/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch('/notes', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setFormData({ title: '', content: '' });
      setEditingId(null);
      setShowForm(false);
      fetchNotes(page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note._id);
    setFormData({ title: note.title, content: note.content });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await apiFetch(`/notes/${id}`, { method: 'DELETE' });
      fetchNotes(page);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <div>
          <span>My Notes</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
            (Indexed via <code>schema.index(&#123; userId: 1, createdAt: -1 &#125;)</code>)
          </span>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false);
            } else {
              setEditingId(null);
              setFormData({ title: '', content: '' });
              setShowForm(true);
            }
          }}
        >
          {showForm && !editingId ? 'Cancel' : '+ New Note'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 6, marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>{editingId ? 'Edit Note' : 'Create New Note'}</h4>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Note title..."
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              rows={3}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Note content..."
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? 'Save Changes' : 'Create Note'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
          No notes found. Create your first note above!
        </p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <div>
                <div className="note-header">
                  <div className="note-title">{note.title}</div>
                  <div className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="note-content">{note.content}</div>
              </div>
              <div className="note-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(note)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(note._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className="pagination">
        <div className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} notes total)
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
