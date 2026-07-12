import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import ConfirmModal from './ConfirmModal';

const Header = ({ title }) => {
  const { user, logout, approvals = [] } = useAppState();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pendingApprovals = approvals.filter(item => item.status === 'Pending');
  const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), []);
  const role = user?.role || 'fleet_manager';
  const ROLE_CONFIG = {
    fleet_manager: { label: 'Fleet Manager', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
    driver: { label: 'Driver', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    safety_officer: { label: 'Safety Officer', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    financial_analyst: { label: 'Financial Analyst', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)' },
  };
  const rCfg = ROLE_CONFIG[role] || ROLE_CONFIG.fleet_manager;
  const userInitials = (user?.name || 'TO').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
    <header className="app-header-shell fixed top-0 z-10 flex items-center justify-between px-6" style={{ height: 'var(--header-height)', background: 'var(--bg-toolbar)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="hidden md:flex items-center gap-2 min-w-0">
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>TransitOps</span><span style={{ color: 'var(--text-muted)' }}>/</span><h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }} className="truncate">{title}</h2>
        </div>
        <div className="relative ml-0 md:ml-4 flex flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: 'var(--text-muted)' }}>search</span>
          <input className="w-full h-10 pl-10 pr-3 text-[13px] transition-all" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} placeholder="Search routes, depots, operators..." type="text" onFocus={e => { e.target.style.background = 'var(--bg-surface-solid)'; e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }} onBlur={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-3 h-10 text-[13px] font-bold" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--brand-primary)' }}>calendar_today</span>{today}
        </div>

        <div className="relative">
          <button onClick={() => { setNotifOpen(value => !value); setDropdownOpen(false); }} className="relative w-10 h-10 flex items-center justify-center transition-all" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <span className="material-symbols-outlined" style={{ fontSize: 21 }}>notifications</span>
            {pendingApprovals.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2" style={{ background: 'var(--brand-primary)', ringColor: 'var(--bg-toolbar)' }} />}
          </button>
          {notifOpen && <><div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} /><div className="absolute right-0 mt-3 w-84 max-w-[calc(100vw-24px)] z-50 overflow-hidden animate-scale-in" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}><h4 className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>Operations Queue</h4>{pendingApprovals.length > 0 && <span className="badge badge-pending">{pendingApprovals.length} pending</span>}</div>
            <div className="max-h-72 overflow-y-auto">{pendingApprovals.length === 0 ? <div className="flex flex-col items-center py-8" style={{ color: 'var(--text-muted)' }}><span className="material-symbols-outlined mb-2" style={{ fontSize: 34 }}>notifications_none</span><p className="text-[13px]">No alerts in queue</p></div> : pendingApprovals.slice(0, 5).map(item => <div key={item.id} className="px-4 py-3 cursor-pointer transition-colors" onClick={() => { navigate('/approvals'); setNotifOpen(false); }} style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-toolbar)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}><p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.type}</p><p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.title}</p><p className="text-[11px] mt-1 font-bold" style={{ color: 'var(--brand-primary)' }}>₹{item.amount?.toLocaleString()}</p></div>)}</div>
          </div></>}
        </div>

        <button className="hidden xl:flex items-center gap-2 px-3 h-10 text-[13px] font-bold transition-all" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-focus)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>Filters</button>
        <button className="hidden xl:flex items-center gap-2 px-3 h-10 text-[13px] font-bold transition-all hover:shadow-lg" style={{ borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))', color: 'var(--brand-primary-text-on)', border: '1px solid var(--border-focus)', boxShadow: 'var(--brand-shadow)' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>Export</button>
        <button className="xl:hidden w-10 h-10 flex items-center justify-center transition-all" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}><span className="material-symbols-outlined" style={{ fontSize: 21 }}>tune</span></button>

        <div className="relative">
          <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 transition-all" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }} onClick={() => { setDropdownOpen(value => !value); setNotifOpen(false); }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-toolbar)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-input)'}>
            <div className="w-9 h-9 flex items-center justify-center text-[13px] font-black" style={{ borderRadius: 'var(--radius-md)', background: rCfg.bg, color: rCfg.color }}>{userInitials}</div>
            <div className="text-left hidden sm:block"><p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p><p className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>{rCfg.label}</p></div>
            <span className="material-symbols-outlined hidden sm:block" style={{ fontSize: 16, color: 'var(--text-muted)' }}>{dropdownOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          {dropdownOpen && <><div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} /><div className="absolute right-0 mt-3 w-60 z-50 overflow-hidden animate-scale-in" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-solid)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}><p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p><p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p></div>
            <div className="py-1.5"><button className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-3 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-toolbar)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-muted)' }}>person</span>My Profile</button><button className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-3 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-toolbar)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-muted)' }}>settings</span>Preferences</button></div>
            <div className="py-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}><button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-3 font-bold transition-colors" style={{ color: '#ef4444' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>Sign Out</button></div>
          </div></>}
        </div>
      </div>
    </header>
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

export default Header;


