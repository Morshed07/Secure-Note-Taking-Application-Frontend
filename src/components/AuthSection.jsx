import React, { useState } from 'react';
import { apiFetch, setAuthToken } from '../api';

export default function AuthSection({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    interests: 'chess, reading',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const interestsArray = formData.interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          interests: interestsArray,
        }),
      });
      setAuthToken(data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '2rem auto' }}>
      <div className="card">
        <h2 className="card-title" style={{ textAlign: 'center', display: 'block' }}>
          {isRegister ? 'Create Account' : 'Sign In to Notes'}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="quick-login-box">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>
            ⚡ 1-Click Fast Login (Seeded Credentials):
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleLoginSubmit('admin@example.com', 'adminpassword123')}
            >
              👑 Admin (Full Access)
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleLoginSubmit('alice@example.com', 'userpassword123')}
            >
              👤 Alice (User)
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleLoginSubmit('bob@example.com', 'userpassword123')}
            >
              👤 Bob (User)
            </button>
          </div>
        </div>

        {!isRegister ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginSubmit(formData.email, formData.password);
            }}
          >
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password (min 6 chars)</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User (Standard)</option>
                <option value="admin">Admin (Privileged)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interests (comma separated)</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="chess, reading, coding"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(false);
                }}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                Sign In
              </a>
            </span>
          ) : (
            <span>
              Need an account?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(true);
                }}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                Create one
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
