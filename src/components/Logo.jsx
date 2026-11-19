import React from 'react';

export default function Logo({ size = 'medium' }) {
  const isLarge = size === 'large';

  return (
    <div className={`logo-brand ${isLarge ? 'logo-large' : ''}`}>
      <div className="logo-icon-box">
        <svg
          width={isLarge ? '26' : '20'}
          height={isLarge ? '26' : '20'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      </div>
      <div className="logo-titles">
        <span className="logo-text">
          Digi<span className="logo-accent">Note</span>
        </span>
        <span className="logo-tagline">Secure Note Platform</span>
      </div>
    </div>
  );
}
