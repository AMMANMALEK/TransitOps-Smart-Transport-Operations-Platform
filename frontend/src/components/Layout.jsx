import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('vb_sidebar_collapsed') === 'true'
  );

  const toggle = () => {
    setCollapsed(value => {
      const next = !value;
      localStorage.setItem('vb_sidebar_collapsed', String(next));
      document.body.classList.toggle('sidebar-collapsed', next);
      return next;
    });
  };

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [collapsed]);

  return (
    <div className="transit-page flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggle} />
      <div className="flex-1 ml-sidebar_width flex flex-col min-h-screen" style={{ paddingTop: 'var(--header-height)' }}>
        <Header title={title} onToggleSidebar={toggle} />
        <main className="transit-shell-main flex-1 w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

