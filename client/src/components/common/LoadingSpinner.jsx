import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Reusable Loading Spinner Component
 * @param {Object} props
 * @param {string} [props.message] - Optional message below spinner
 * @param {string} [props.color] - Spinner color
 * @param {number} [props.size] - Icon size in px
 */
export default function LoadingSpinner({ message = 'Loading...', color = 'var(--primary-blue)', size = 28 }) {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    }}>
      <RefreshCw size={size} color={color} style={{ animation: 'spin 1.2s linear infinite' }} />
      {message && (
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-body)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
