import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    setCollapsed(isCollapsed);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('sidebar_collapsed', String(!prev));
      return !prev;
    });
  };

  const toggleMobileOpen = () => {
    setMobileOpen(prev => !prev);
  };

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, isMobile]);

  const sidebarWidth = isMobile ? '0px' : (collapsed ? '72px' : '260px');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-base)' }}>
      {/* Backdrop for mobile drawer */}
      {isMobile && mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            transition: 'opacity 0.25s ease'
          }}
        />
      )}

      {/* Fixed Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        toggleCollapsed={toggleCollapsed} 
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

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
        <Topbar 
          sidebarWidth={sidebarWidth} 
          isMobile={isMobile}
          toggleMobileOpen={toggleMobileOpen}
        />

        {/* Content Area */}
        <main 
          style={{
            flex: 1,
            padding: isMobile ? '1.5rem 1rem' : '2.25rem 2rem',
            marginTop: '70px', // Offset Topbar height
            width: '100%',
            maxWidth: '1440px',
            marginRight: 'auto',
            marginLeft: 'auto'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
