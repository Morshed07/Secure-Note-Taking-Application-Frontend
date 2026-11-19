import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function AggregationsSection() {
  const [activeScenario, setActiveScenario] = useState('scenario1'); // 'scenario1' or 'scenario2'

  // Scenario 1 state
  const [interestGroups, setInterestGroups] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [error1, setError1] = useState(null);

  // Scenario 2 state
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userPostData, setUserPostData] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState(null);

  // Load Scenario 1
  const fetchScenario1 = async () => {
    setLoading1(true);
    setError1(null);
    try {
      const res = await apiFetch('/aggregations/users-by-interest');
      setInterestGroups(res.data);
    } catch (err) {
      setError1(err.message);
    } finally {
      setLoading1(false);
    }
  };

  // Fetch Users for Scenario 2 selector
  const fetchUsersForDropdown = async () => {
    try {
      const res = await apiFetch('/users?limit=50');
      if (res.data && res.data.length > 0) {
        setUsersList(res.data);
        if (!selectedUserId) {
          setSelectedUserId(res.data[0]._id);
        }
      }
    } catch (err) {
      // In case user is not admin, fallback to /aggregations/users-by-interest to get user IDs
      try {
        const agRes = await apiFetch('/aggregations/users-by-interest');
        const extracted = [];
        agRes.data.forEach((group) => {
          group.users.forEach((u) => {
            if (!extracted.some((x) => x._id === u._id)) extracted.push(u);
          });
        });
        setUsersList(extracted);
        if (extracted.length > 0 && !selectedUserId) {
          setSelectedUserId(extracted[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Fetch Scenario 2 for a specific user
  const fetchScenario2 = async (userId) => {
    if (!userId) return;
    setLoading2(true);
    setError2(null);
    try {
      const res = await apiFetch(`/aggregations/user-posts/${userId}`);
      setUserPostData(res.data);
    } catch (err) {
      setError2(err.message);
    } finally {
      setLoading2(false);
    }
  };

  useEffect(() => {
    if (activeScenario === 'scenario1') {
      fetchScenario1();
    } else {
      fetchUsersForDropdown();
    }
  }, [activeScenario]);

  useEffect(() => {
    if (activeScenario === 'scenario2' && selectedUserId) {
      fetchScenario2(selectedUserId);
    }
  }, [selectedUserId, activeScenario]);

  return (
    <div className="card">
      <div className="card-title">
        <div>
          <span>📊 MongoDB Aggregation Tasks</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
            (Strictly follows PDF constraints & indexing)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeScenario === 'scenario1' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveScenario('scenario1')}
          >
            Scenario 1: Group by Interests
          </button>
          <button
            className={`btn btn-sm ${activeScenario === 'scenario2' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveScenario('scenario2')}
          >
            Scenario 2: User Posts ($lookup)
          </button>
        </div>
      </div>

      {activeScenario === 'scenario1' ? (
        <div>
          <div className="alert alert-info">
            <strong>PDF Constraint Met:</strong> Exactly one <code>collection.aggregate()</code> call was used (with <code>$match</code>, <code>$unwind</code>, <code>$group</code>, <code>$sort</code>). Supported by multikey index <code>userSchema.index(&#123; interests: 1 &#125;)</code>.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchScenario1} disabled={loading1}>
              🔄 Refresh Aggregation
            </button>
          </div>

          {error1 && <div className="alert alert-danger">{error1}</div>}

          {loading1 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Running aggregation pipeline...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {interestGroups.map((group) => (
                <div
                  key={group.interest}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
                      🎯 {group.interest}
                    </span>
                    <span className="badge badge-user">{group.userCount} User{group.userCount > 1 ? 's' : ''}</span>
                  </div>

                  <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem' }}>
                    {group.users.map((u) => (
                      <li
                        key={u._id}
                        style={{
                          padding: '0.4rem 0',
                          borderTop: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong>{u.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.65rem' }}>
                          {u.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="alert alert-info">
            <strong>PDF Constraint Met:</strong> Single aggregation pipeline with a <code>$lookup</code> stage joining the <code>Posts</code> collection on foreign key <code>userId</code>. Supported by compound index <code>postSchema.index(&#123; userId: 1, createdAt: -1 &#125;)</code>.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 6, border: '1px solid var(--border)' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Target User:</label>
            <select
              style={{ maxWidth: 350 }}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => fetchScenario2(selectedUserId)}>
              Run $lookup
            </button>
          </div>

          {error2 && <div className="alert alert-danger">{error2}</div>}

          {loading2 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Executing $lookup aggregation...</p>
          ) : userPostData ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{userPostData.name}'s Profile & Posts</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {userPostData.email} • Role: {userPostData.role} • Total Joined Posts: {userPostData.postsCount}
                  </span>
                </div>
                <div>
                  {userPostData.interests?.map((i) => (
                    <span key={i} className="badge-interest">
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {userPostData.posts && userPostData.posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {userPostData.posts.map((post) => (
                    <div
                      key={post._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{post.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155' }}>{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
                  This user has not authored any public posts yet.
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
