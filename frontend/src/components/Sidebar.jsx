import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import ConfirmModal from './ConfirmModal';
import { ROLES, hasRouteAccess } from '../config/permissions';

const ALL_NAV = [
  { section: 'Command', items: [
    { name: 'Dashboard', path: '/dashboard', icon: 'monitoring' },
  ]},
  { section: 'Operations', items: [
    { name: 'Vehicle Registry', path: '/vehicles', icon: 'directions_bus' },
    { name: 'Driver Management', path: '/drivers', icon: 'badge' },
    { name: 'Trip Management', path: '/trips', icon: 'route' },
    { name: 'Maintenance', path: '/maintenance', icon: 'engineering' },
    { name: 'Fuel & Expenses', path: '/expenses', icon: 'payments' },
  ]},
  { section: 'Intelligence', items: [
    { name: 'Reports & Analytics', path: '/analytics', icon: 'insights' },
  ]},
];

const ROLE_CONFIG = {
  [ROLES.ADMIN]: { label: 'Admin', color: '#6366f1', bg: 'rgba(99,102,241,0.13)', icon: 'admin_panel_settings' },
  [ROLES.FLEET_MANAGER]: { label: 'Fleet Manager', color: '#6366f1', bg: 'rgba(99,102,241,0.13)', icon: 'supervisor_account' },
  [ROLES.DRIVER]: { label: 'Driver', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'badge' },
  [ROLES.SAFETY_OFFICER]: { label: 'Safety Officer', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'health_and_safety' },
  [ROLES.FINANCIAL_ANALYST]: { label: 'Financial Analyst', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'query_stats' },
};

const Sidebar = ({ collapsed: controlledCollapsed, onToggleCollapsed }) => {
  const { user, logout } = useAppState();
  const navigate = useNavigate();
  const [localCollapsed, setLocalCollapsed] = useState(() => localStorage.getItem('vb_sidebar_collapsed') === 'true');
  const collapsed = typeof controlledCollapsed === 'boolean' ? controlledCollapsed : localCollapsed;
  const role = user?.role || ROLES.FLEET_MANAGER;
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.FLEET_MANAGER];

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem('vb_sidebar_collapsed', String(collapsed));
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [collapsed]);

  const toggle = () => {
    if (onToggleCollapsed) onToggleCollapsed();
    else setLocalCollapsed(value => !value);
  };

  const userInitials = (user?.name || 'TO').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const getBadge = () => null;

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="sidebar-container fixed left-0 top-0 z-20 h-screen" style={{ width: 'var(--sidebar-width)' }}>
      <div className="flex h-full flex-col" style={{ background: 'var(--bg-surface-solid)', borderRight: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <div 
          className={`flex items-center ${collapsed ? 'justify-center cursor-pointer hover:bg-slate-800/50' : 'justify-between px-4'} py-4 flex-shrink-0 transition-colors`} 
          style={{ borderBottom: '1px solid var(--border-subtle)', minHeight: 'var(--header-height)' }}
          onClick={collapsed ? toggle : undefined}
          title={collapsed ? 'Expand sidebar' : undefined}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))', boxShadow: 'var(--brand-shadow)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1", color: 'var(--brand-primary-text-on)' }}>directions_bus</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>TransitOps</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, lineHeight: '1.2', whiteSpace: 'nowrap', marginTop: '2px' }}>Smart Transport Platform</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }} title="Collapse sidebar" onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_double_arrow_left</span>
            </button>
          )}
        </div>


        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
          {ALL_NAV.map(section => {
            const visibleItems = section.items.filter(item => hasRouteAccess(role, item.path));
            if (!visibleItems.length) return null;
            return <div key={section.section} className="mb-4">
              {!collapsed && <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 12px 8px' }}>{section.section}</p>}
              <ul className="space-y-1">
                {visibleItems.map(item => {
                  const badge = getBadge(item);
                  return <li key={`${item.path}-${item.name}`}><NavLink to={item.path} title={collapsed ? item.name : undefined} className={({ isActive }) => `relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-150 group ${isActive ? '' : ''}`} style={({ isActive }) => ({ background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(129,140,248,0.06))' : 'transparent', border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' })}>
                    {({ isActive }) => <><span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 21, color: isActive ? 'var(--brand-primary)' : 'inherit', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>{!collapsed && <span className="text-[13px] font-bold flex-1 truncate">{item.name}</span>}{!collapsed && badge > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[19px] text-center">{badge}</span>}{collapsed && badge > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}</>}
                  </NavLink></li>;
                })}
              </ul>
            </div>;
          })}
        </nav>

        <div className="px-3 pb-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 transition-all" style={{ background: 'var(--bg-toolbar)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }} title={collapsed ? 'Sign Out' : undefined} onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 20 }}>logout</span>{!collapsed && <span className="text-[13px] font-bold">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
    <ConfirmModal
      isOpen={logoutOpen}
      onConfirm={confirmLogout}
      onCancel={() => setLogoutOpen(false)}
      title="Sign out of TransitOps?"
      message="You'll be returned to the login screen. Any unsaved changes will be lost."
      confirmLabel="Sign Out"
      icon="logout"
      danger={true}
    />
  </>
  );
};

export default Sidebar;


