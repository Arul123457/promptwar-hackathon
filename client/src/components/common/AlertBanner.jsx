import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Reusable Alert Banner Component
 * @param {Object} props
 * @param {'error'|'warning'|'success'|'info'} [props.type] - Alert severity
 * @param {string} props.message - Alert text message
 * @param {React.ReactNode} [props.action] - Optional action element
 */
export default function AlertBanner({ type = 'info', message, action }) {
  if (!message) return null;

  const styles = {
    error: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', color: '#dc2626', icon: <AlertTriangle size={18} /> },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', color: '#d97706', icon: <AlertTriangle size={18} /> },
    success: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', color: '#059669', icon: <CheckCircle size={18} /> },
    info: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)', color: 'var(--primary-blue)', icon: <Info size={18} /> }
  };

  const style = styles[type] || styles.info;

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '10px',
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      fontSize: '0.88rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {style.icon}
        <span>{message}</span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
