import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Settings
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapsed }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  // Filter navigation items by role
  const allLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'sales', 'warehouse', 'accounts']
    },
    {
      to: '/customers',
      label: 'Customers CRM',
      icon: Users,
      roles: ['admin', 'sales', 'accounts']
    },
    {
      to: '/products',
      label: 'Products & Stock',
      icon: Package,
      roles: ['admin', 'warehouse']
    },
    {
      to: '/challans',
      label: 'Sales Challans',
      icon: FileText,
      roles: ['admin', 'sales', 'accounts']
    }
  ];

  const visibleLinks = allLinks.filter(link => link.roles.includes(user.role));

  return (
    <aside style={{
      width: collapsed ? '72px' : '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 10,
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Brand Header */}
      <div style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 1.25rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: '1rem'
            }}>
              E
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                CRM ERP
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enterprise Hub
              </span>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: '1rem'
          }}>
            E
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{
        padding: '1.25rem 0.75rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? '0' : '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-active-link)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                textDecoration: 'none'
              })}
              className={({ isActive }) => isActive ? 'nav-active' : ''}
            >
              <Icon style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: '0.85rem' }}>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse / Expand Toggle Button */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={toggleCollapsed}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            width: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-base)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {collapsed ? (
            <ChevronRight style={{ width: '1.2rem', height: '1.2rem' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronLeft style={{ width: '1.2rem', height: '1.2rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
