import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import ConfirmModal from './ConfirmModal';

const Header = ({ title }) => {
  const { user, logout, approvals } = useAppState();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pendingApprovals = approvals.filter(item => item.status === 'Pending');
  const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), []);
  const role = user?.role || 'officer';
  const ROLE_CONFIG = {
    admin: { label: 'Admin', color: '#fbbf24', bg: 'rgba(251,191,36,0.13)' },
    officer: { label: 'Coordinator', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
    manager: { label: 'Manager', color: '#86efac', bg: 'rgba(34,197,94,0.12)' },
    vendor: { label: 'Partner', color: '#fbbf24', bg: 'rgba(251,191,36,0.13)' },
  };
  const rCfg = ROLE_CONFIG[role] || ROLE_CONFIG.officer;
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
    <header className="app-header-shell fixed top-0 z-10 flex items-center justify-between px-6" style={{ height: 'var(--header-height)', background: 'rgba(8,13,23,0.78)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(148,163,184,0.14)' }}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="hidden md:flex items-center gap-2 min-w-0">
          <span className="text-slate-500 text-sm font-bold">TransitOps</span><span className="text-slate-600">/</span><h2 className="text-white font-bold text-[15px] truncate">{title}</h2>
        </div>
        <div className="relative ml-0 md:ml-4 flex flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ fontSize: 18 }}>search</span>
          <input className="w-full h-10 pl-10 pr-3 rounded-2xl text-[13px]" placeholder="Search routes, depots, operators..." type="text" />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-3 h-10 rounded-2xl text-slate-300 text-[13px] font-bold" style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
          <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 17 }}>calendar_today</span>{today}
        </div>

        <div className="relative">
          <button onClick={() => { setNotifOpen(value => !value); setDropdownOpen(false); }} className="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white transition-all" style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 21 }}>notifications</span>
            {pendingApprovals.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-950" />}
          </button>
          {notifOpen && <><div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} /><div className="absolute right-0 mt-3 w-84 max-w-[calc(100vw-24px)] rounded-2xl z-50 overflow-hidden animate-scale-in" style={{ background: '#111827', border: '1px solid rgba(148,163,184,0.18)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}><h4 className="font-bold text-[14px] text-white">Operations Queue</h4>{pendingApprovals.length > 0 && <span className="badge badge-pending">{pendingApprovals.length} pending</span>}</div>
            <div className="max-h-72 overflow-y-auto">{pendingApprovals.length === 0 ? <div className="flex flex-col items-center py-8 text-slate-500"><span className="material-symbols-outlined mb-2" style={{ fontSize: 34 }}>notifications_none</span><p className="text-[13px]">No alerts in queue</p></div> : pendingApprovals.slice(0, 5).map(item => <div key={item.id} className="px-4 py-3 cursor-pointer transition-colors" onClick={() => { navigate('/approvals'); setNotifOpen(false); }} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}><p className="text-[13px] font-bold text-white truncate">{item.type}</p><p className="text-[12px] text-slate-400 truncate mt-0.5">{item.title}</p><p className="text-[11px] text-amber-300 mt-1 font-bold">â‚¹{item.amount?.toLocaleString()}</p></div>)}</div>
          </div></>}
        </div>

        <button className="hidden xl:flex items-center gap-2 px-3 h-10 rounded-2xl text-slate-300 hover:text-white transition-all text-[13px] font-bold" style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>Filters</button>
        <button className="hidden xl:flex items-center gap-2 px-3 h-10 rounded-2xl transition-all text-[13px] font-black" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#111827', border: '1px solid rgba(251,191,36,0.34)', boxShadow: '0 12px 28px rgba(245,158,11,0.20)' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>Export</button>
        <button className="xl:hidden w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white transition-all" style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}><span className="material-symbols-outlined" style={{ fontSize: 21 }}>tune</span></button>

        <div className="relative">
          <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl transition-all" style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }} onClick={() => { setDropdownOpen(value => !value); setNotifOpen(false); }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black" style={{ background: rCfg.bg, color: rCfg.color }}>{userInitials}</div>
            <div className="text-left hidden sm:block"><p className="text-[13px] font-bold text-white leading-tight">{user?.name || 'User'}</p><p className="text-[11px] text-slate-400 leading-tight">{rCfg.label}</p></div>
            <span className="material-symbols-outlined text-slate-500 hidden sm:block" style={{ fontSize: 16 }}>{dropdownOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          {dropdownOpen && <><div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} /><div className="absolute right-0 mt-3 w-60 rounded-2xl z-50 overflow-hidden animate-scale-in" style={{ background: '#111827', border: '1px solid rgba(148,163,184,0.18)', boxShadow: 'var(--shadow)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}><p className="text-[13px] font-bold text-white truncate">{user?.name}</p><p className="text-[12px] text-slate-400 truncate mt-0.5">{user?.email}</p></div>
            <div className="py-1.5"><button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-300 hover:text-white flex items-center gap-3"><span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>person</span>My Profile</button><button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-300 hover:text-white flex items-center gap-3"><span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>settings</span>Preferences</button></div>
            <div className="py-1.5" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}><button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[13px] text-red-300 hover:text-red-200 flex items-center gap-3 font-bold"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>Sign Out</button></div>
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


