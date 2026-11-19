import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function AdminSection() {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' or 'all-notes'

  // Users state
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  // New User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', interests: '' });

  // Notes state
  const [allNotes, setAllNotes] = useState([]);
  const [notePage, setNotePage] = useState(1);
  const [notePagination, setNotePagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState(null);

  // Fetch Users
  const fetchUsers = async (p = 1) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await apiFetch(`/users?page=${p}&limit=5`);
      setUsers(res.data);
      setUserPagination(res.pagination);
      setUserPage(res.pagination.currentPage);
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserLoading(false);
    }
  };

  // Fetch All Notes
  const fetchAllNotes = async (p = 1) => {
    setNoteLoading(true);
    setNoteError(null);
    try {
      const res = await apiFetch(`/notes/all?page=${p}&limit=5`);
      setAllNotes(res.data);
      setNotePagination(res.pagination);
      setNotePage(res.pagination.currentPage);
    } catch (err) {
      setNoteError(err.message);
    } finally {
      setNoteLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'users') fetchUsers(userPage);
    else fetchAllNotes(notePage);
  }, [activeSubTab, userPage, notePage]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const interestsArray = newUser.interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ ...newUser, interests: interestsArray }),
      });
      setNewUser({ name: '', email: '', password: '', role: 'user', interests: '' });
      setShowAddUser(false);
      fetchUsers(userPage);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      fetchUsers(userPage);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await apiFetch(`/users/${user._id}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers(userPage);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <div>
          <span>👑 Admin Control Panel</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
            (Role-Based Access Control Protected)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('users')}
          >
            👥 User Management
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'all-notes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('all-notes')}
          >
            📝 All Users' Notes
          </button>
        </div>
      </div>

      {activeSubTab === 'users' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Listing users sorted by creation date (Indexed via <code>userSchema.index(&#123; createdAt: -1 &#125;)</code>)
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddUser(!showAddUser)}
            >
              {showAddUser ? 'Cancel' : '+ Add User'}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleCreateUser} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 6, marginBottom: '1rem', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Add New User</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Interests (comma separated)</label>
                <input
                  type="text"
                  value={newUser.interests}
                  onChange={(e) => setNewUser({ ...newUser, interests: e.target.value })}
                  placeholder="chess, reading, AI"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Save User
              </button>
            </form>
          )}

          {userError && <div className="alert alert-danger">{userError}</div>}

          {userLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Interests</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.interests && u.interests.length > 0 ? (
                          u.interests.map((i) => (
                            <span key={i} className="badge-interest">
                              {i}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Toggle Admin/User role"
                            onClick={() => handleToggleRole(u)}
                          >
                            Switch Role
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* User Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Page {userPagination.currentPage} of {userPagination.totalPages} ({userPagination.totalCount} users total)
            </div>
            <div className="pagination-buttons">
              <button
                className="btn btn-secondary btn-sm"
                disabled={!userPagination.hasPrevPage}
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!userPagination.hasNextPage}
                onClick={() => setUserPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Admin capability: Viewing all users' notes across the system with pagination (Indexed via <code>noteSchema.index(&#123; createdAt: -1 &#125;)</code>).
          </p>

          {noteError && <div className="alert alert-danger">{noteError}</div>}

          {noteLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading notes...</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Content</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allNotes.map((n) => (
                    <tr key={n._id}>
                      <td style={{ fontWeight: 600 }}>{n.title}</td>
                      <td>
                        <div>{n.userId?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {n.userId?.email}
                        </div>
                      </td>
                      <td style={{ maxWidth: 350, fontSize: '0.85rem' }}>{n.content}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Page {notePagination.currentPage} of {notePagination.totalPages} ({notePagination.totalCount} notes total)
            </div>
            <div className="pagination-buttons">
              <button
                className="btn btn-secondary btn-sm"
                disabled={!notePagination.hasPrevPage}
                onClick={() => setNotePage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!notePagination.hasNextPage}
                onClick={() => setNotePage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
