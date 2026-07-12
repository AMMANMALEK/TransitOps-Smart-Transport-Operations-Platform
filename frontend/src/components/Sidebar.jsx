import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import ConfirmModal from './ConfirmModal';

const ALL_NAV = [
  { section: 'Command', items: [
    { name: 'Dashboard', path: '/dashboard', icon: 'monitoring', roles: ['fleet_manager', 'driver', 'safety_officer', 'financial_analyst'] },
  ]},
  { section: 'Operations', items: [
    { name: 'Vehicle Registry', path: '/vehicles', icon: 'directions_bus', roles: ['fleet_manager', 'safety_officer'] },
    { name: 'Driver Management', path: '/drivers', icon: 'badge', roles: ['fleet_manager', 'safety_officer'] },
    { name: 'Trip Management', path: '/trips', icon: 'route', roles: ['fleet_manager', 'driver', 'safety_officer'] },
    { name: 'Maintenance', path: '/maintenance', icon: 'engineering', roles: ['fleet_manager'] },
    { name: 'Fuel & Expenses', path: '/expenses', icon: 'payments', roles: ['fleet_manager', 'financial_analyst'] },
  ]},
  { section: 'Intelligence', items: [
    { name: 'Reports & Analytics', path: '/analytics', icon: 'insights', roles: ['fleet_manager', 'safety_officer', 'financial_analyst'] },
  ]},
];

const ROLE_CONFIG = {
  fleet_manager: { label: 'Fleet Manager', color: '#fbbf24', bg: 'rgba(251,191,36,0.13)', icon: 'supervisor_account' },
  driver: { label: 'Driver', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', icon: 'badge' },
  safety_officer: { label: 'Safety Officer', color: '#86efac', bg: 'rgba(34,197,94,0.12)', icon: 'health_and_safety' },
  financial_analyst: { label: 'Financial Analyst', color: '#d8b4fe', bg: 'rgba(168,85,247,0.12)', icon: 'query_stats' },
};

const Sidebar = ({ collapsed: controlledCollapsed, onToggleCollapsed }) => {
  const { user, logout } = useAppState();
  const navigate = useNavigate();
  const [localCollapsed, setLocalCollapsed] = useState(() => localStorage.getItem('vb_sidebar_collapsed') === 'true');
  const collapsed = typeof controlledCollapsed === 'boolean' ? controlledCollapsed : localCollapsed;
  const role = user?.role || 'officer';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.fleet_manager;

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
      <div className="flex h-full flex-col" style={{ background: '#ffffff', borderRight: '1px solid rgba(148,163,184,0.25)', boxShadow: '4px 0 24px rgba(0,0,0,0.03)' }}>
        <div 
          className={`flex items-center ${collapsed ? 'justify-center cursor-pointer hover:bg-slate-100/80' : 'justify-between px-4'} py-4 flex-shrink-0 transition-colors`} 
          style={{ borderBottom: '1px solid rgba(148,163,184,0.18)', minHeight: 72 }}
          onClick={collapsed ? toggle : undefined}
          title={collapsed ? 'Expand sidebar' : undefined}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 14px 32px rgba(245,158,11,0.28)' }}>
              <span className="material-symbols-outlined text-[#0f172a]" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="text-slate-900 font-black text-[17px] tracking-tight whitespace-nowrap">TransitOps</span>
                <p className="text-slate-500 text-[11px] font-[650] leading-tight whitespace-nowrap mt-[2px]">Smart Transport Platform</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }} title="Collapse sidebar">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_double_arrow_left</span>
            </button>
          )}
        </div>


        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
          {ALL_NAV.map(section => {
            const visibleItems = section.items.filter(item => item.roles.includes(role));
            if (!visibleItems.length) return null;
            return <div key={section.section} className="mb-4">
              {!collapsed && <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-2">{section.section}</p>}
              <ul className="space-y-1">
                {visibleItems.map(item => {
                  const badge = getBadge(item);
                  return <li key={`${item.path}-${item.name}`}><NavLink to={item.path} title={collapsed ? item.name : undefined} className={({ isActive }) => `relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-150 group ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`} style={({ isActive }) => ({ background: isActive ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))' : 'transparent', border: isActive ? '1px solid rgba(251,191,36,0.35)' : '1px solid transparent' })}>
                    {({ isActive }) => <><span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 21, color: isActive ? '#d97706' : 'inherit', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>{!collapsed && <span className="text-[13px] font-bold flex-1 truncate">{item.name}</span>}{!collapsed && badge > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[19px] text-center">{badge}</span>}{collapsed && badge > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}</>}
                  </NavLink></li>;
                })}
              </ul>
            </div>;
          })}
        </nav>

        <div className="px-3 pb-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(148,163,184,0.18)', paddingTop: 12 }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-500 hover:text-red-600 transition-all" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }} title={collapsed ? 'Sign Out' : undefined}>
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


