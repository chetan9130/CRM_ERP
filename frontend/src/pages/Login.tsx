import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Info } from 'lucide-react';

const ROLE_HINTS: Record<string, { email: string; password: string; label: string }> = {
  admin:     { email: 'admin@mail.com',     password: 'admin123',     label: 'Administrator' },
  sales:     { email: 'sales@mail.com',     password: 'sales123',     label: 'Sales Agent' },
  warehouse: { email: 'warehouse@mail.com', password: 'warehouse123', label: 'Warehouse Manager' },
  accounts:  { email: 'accounts@mail.com',  password: 'accounts123',  label: 'Accounts Officer' },
};

export const Login: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hintRole, setHintRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Invalid credentials or server unreachable.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hint = hintRole ? ROLE_HINTS[hintRole] : null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(8, 120, 249, 0.05) 0%, transparent 60%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2.25rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            height: '3rem',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            E
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
            Sign in to access your operations dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="login-email" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
              style={{ height: '42px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="login-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                style={{ height: '42px', fontSize: '0.9rem', width: '100%', paddingRight: '2.75rem', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword
                  ? <EyeOff style={{ width: '1rem', height: '1rem' }} />
                  : <Eye style={{ width: '1rem', height: '1rem' }} />}
              </button>
            </div>
          </div>

          {/* Demo Role Hint (reference only — does NOT auto-fill) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="hint-role" style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <Info style={{ width: '0.85rem', height: '0.85rem' }} />
              Demo Credentials Reference
            </label>
            <select
              id="hint-role"
              value={hintRole}
              onChange={(e) => setHintRole(e.target.value)}
              disabled={isSubmitting}
              style={{ height: '40px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
            >
              <option value="">-- Select role to see demo credentials --</option>
              <option value="admin">Administrator</option>
              <option value="sales">Sales Agent</option>
              <option value="warehouse">Warehouse Manager</option>
              <option value="accounts">Accounts Officer</option>
            </select>

            {hint && (
              <div style={{
                marginTop: '0.25rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'rgba(8, 120, 249, 0.05)',
                border: '1px solid rgba(8, 120, 249, 0.15)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                  {hint.label}
                </strong>
                <span>Email: <code style={{ userSelect: 'all' }}>{hint.email}</code></span><br />
                <span>Password: <code style={{ userSelect: 'all' }}>{hint.password}</code></span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.25rem', height: '42px', fontWeight: 700 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
