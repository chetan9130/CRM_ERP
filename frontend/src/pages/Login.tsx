import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select a role to sign in.');
      return;
    }

    let targetEmail = '';
    let targetPassword = '';

    if (selectedRole === 'admin') {
      targetEmail = 'admin@example.com';
      targetPassword = 'admin123';
    } else if (selectedRole === 'sales') {
      targetEmail = 'sales@example.com';
      targetPassword = 'sales123';
    } else if (selectedRole === 'warehouse') {
      targetEmail = 'warehouse@example.com';
      targetPassword = 'warehouse123';
    } else if (selectedRole === 'accounts') {
      targetEmail = 'accounts@example.com';
      targetPassword = 'accounts123';
    }

    setIsSubmitting(true);
    try {
      await login(targetEmail, targetPassword);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Invalid credentials or server unreachable.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
        maxWidth: '400px',
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Quick Role Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select Demo Account Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
              disabled={isSubmitting}
              style={{ height: '42px', fontSize: '0.9rem' }}
            >
              <option value="">-- Choose Role --</option>
              <option value="admin">Administrator (admin@example.com)</option>
              <option value="sales">Sales Agent (sales@example.com)</option>
              <option value="warehouse">Warehouse Manager (warehouse@example.com)</option>
              <option value="accounts">Accounts Officer (accounts@example.com)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: '42px', fontWeight: 700 }}
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
