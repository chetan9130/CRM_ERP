import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    setCollapsed(isCollapsed);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebar_collapsed', String(!prev));
      return !prev;
    });
  };

  const sidebarWidth = collapsed ? '72px' : '260px';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-base)' }}>
      {/* Fixed Sidebar */}
      <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

      {/* Main Container */}
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0, // Prevent flex shrink overflow
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Fixed Topbar */}
        <Topbar sidebarWidth={sidebarWidth} />

        {/* Content Area */}
        <main style={{
          flex: 1,
          padding: '2.25rem 2rem',
          marginTop: '70px', // Offset Topbar height
          width: '100%',
          maxWidth: '1440px',
          marginRight: 'auto',
          marginLeft: 'auto'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
