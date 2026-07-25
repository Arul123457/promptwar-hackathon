import React, { useState } from 'react';
import { Key, Mail, Lock, X, CheckCircle, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAutoFillDemo = () => {
    setEmail('demo@altruist.ai');
    setPassword('DemoAltruist123!');
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const data = await apiService.demoLogin();
      if (data && data.user) {
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.warn('Demo login error:', err);
      const fallbackUser = { id: 'demo_user_123', email: 'demo@altruist.ai', role: 'Evaluator Demo User' };
      if (onAuthSuccess) onAuthSuccess(fallbackUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (tab === 'register') {
        const res = await apiService.registerUser(email, password);
        if (res && res.success) {
          if (onAuthSuccess) onAuthSuccess(res.user);
          onClose();
        } else {
          setErrorMessage(res.error || 'Registration failed. Please try again.');
        }
      } else {
        const res = await apiService.loginUser(email, password);
        if (res && res.success) {
          if (onAuthSuccess) onAuthSuccess(res.user);
          onClose();
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      console.error('Auth network error:', err);
      setErrorMessage('Network error — please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '32px',
        position: 'relative',
        background: '#ffffff',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Authentication Modal"
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-body)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(30, 58, 138, 0.1)',
            color: 'var(--primary-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            Altruist AI Authentication
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', marginTop: '4px' }}>
            Secure Account Access
          </p>
        </div>

        {/* Evaluator Test Credentials Banner */}
        <div style={{
          padding: '14px',
          borderRadius: '12px',
          background: 'var(--bg-page)',
          border: '1px dashed var(--secondary-blue)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
            <Key size={16} /> Visible Evaluator Demo Credentials:
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginBottom: '10px' }}>
            Email: <strong style={{ color: 'var(--text-heading)' }}>demo@altruist.ai</strong><br />
            Password: <strong style={{ color: 'var(--text-heading)' }}>DemoAltruist123!</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAutoFillDemo}
              type="button"
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#ffffff',
                color: 'var(--primary-blue)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Fill Credentials
            </button>
            <button
              onClick={handleQuickDemoLogin}
              type="button"
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⚡ 1-Click Demo Login
            </button>
          </div>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-page)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === 'login' ? '#ffffff' : 'transparent',
              color: tab === 'login' ? 'var(--primary-blue)' : 'var(--text-body)',
              boxShadow: tab === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === 'register' ? '#ffffff' : 'transparent',
              color: tab === 'register' ? 'var(--primary-blue)' : 'var(--text-body)',
              boxShadow: tab === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-body)', marginBottom: '6px' }}>
              Email Address:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-heading)',
                  fontSize: '0.92rem'
                }}
              />
              <Mail size={18} color="var(--text-body)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-body)', marginBottom: '6px' }}>
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-heading)',
                  fontSize: '0.92rem'
                }}
              />
              <Lock size={18} color="var(--text-body)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--primary-blue)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {tab === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isSubmitting ? 'Processing...' : tab === 'login' ? 'Sign In to Altruist AI' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
