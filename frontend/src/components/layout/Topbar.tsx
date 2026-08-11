import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Bell, HelpCircle, LogOut, Menu } from 'lucide-react';

interface TopbarProps {
  sidebarWidth: string;
  isMobile?: boolean;
  toggleMobileOpen?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  sidebarWidth,
  isMobile = false,
  toggleMobileOpen
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Translate paths to readable page titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/customers')) {
      if (path.includes('/new')) return 'Register Customer';
      if (path.includes('/edit')) return 'Edit Customer';
      return 'Customers';
    }
    if (path.startsWith('/products')) {
      if (path.includes('/new')) return 'Add Product';
      if (path.includes('/edit')) return 'Edit Product';
      return 'Inventory';
    }
    if (path.startsWith('/challans')) {
      if (path.includes('/new')) return 'New Challan';
      if (path.includes('/edit')) return 'Edit Challan';
      return 'Sales Challans';
    }
    return 'Portal';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <header 
      style={{
        height: '70px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: isMobile ? '0 1rem' : '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        right: 0,
        left: sidebarWidth,
        zIndex: 9,
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Title / Breadcrumb + Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isMobile && (
          <button
            onClick={toggleMobileOpen}
            aria-label="Open navigation menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        )}
        <div>
          <span className="hidden-sm-down" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operations Portal
          </span>
          <h2 style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 700, marginBottom: 0, color: 'var(--text-primary)', marginTop: isMobile ? '0' : '-0.15rem' }}>
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right-side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem' }}>
        
        {/* Placeholder system action buttons */}
        <div className="hidden-md-down" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.35rem', borderRadius: '50%' }} title="Help">
            <HelpCircle style={{ width: '1.2rem', height: '1.2rem' }} />
          </button>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.35rem', borderRadius: '50%' }} title="Notifications">
            <Bell style={{ width: '1.2rem', height: '1.2rem' }} />
          </button>
        </div>

        {/* Profile Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          borderLeft: '1px solid var(--border-color)', 
          paddingLeft: isMobile ? '0.75rem' : '1.5rem' 
        }}>
          {/* Initials Avatar */}
          <div style={{
            width: '2.3rem',
            height: '2.3rem',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-active-link)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {getInitials(user.name)}
          </div>

          <div className="hidden-sm-down" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user.name}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
              <span className={`badge badge-${user.role}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>
                {user.role}
              </span>
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{
            padding: isMobile ? '0.5rem' : '0.5rem 0.75rem',
            fontSize: '0.8rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error)',
            fontWeight: 600,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
        >
          <LogOut style={{ width: '1rem', height: '1rem' }} />
          <span className="hidden-sm-down">Logout</span>
        </button>
      </div>
    </header>
  );
};
