import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Outlet />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        minHeight: '60vh',
        width: '100%'
      }}>
        <div className="card" style={{
          maxWidth: '450px',
          textAlign: 'center',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            marginBottom: '1.5rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '2.25rem', height: '2.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            Your account role (<strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</strong>) does not have sufficient permissions to view this section.
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
