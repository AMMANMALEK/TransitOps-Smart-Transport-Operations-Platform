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
    admin: { label: 'Admin', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
    officer: { label: 'Coordinator', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    manager: { label: 'Manager', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    vendor: { label: 'Partner', color: '#6366f1', bg: 'rgba(99,102,241,0.13)' },
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
    <header className="app-header-shell fixed top-0 z-10 flex items-center justify-between px-6" style={{ height: 'var(--header-height)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(148,163,184,0.25)' }}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="hidden md:flex items-center gap-2 min-w-0">
          <span className="text-slate-500 text-sm font-bold">TransitOps</span><span className="text-slate-400">/</span><h2 className="text-slate-900 font-bold text-[15px] truncate">{title}</h2>
        </div>
        <div className="relative ml-0 md:ml-4 flex flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }}>search</span>
          <input className="w-full h-10 pl-10 pr-3 rounded-2xl text-[13px] bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-slate-500" placeholder="Search routes, depots, operators..." type="text" />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-2 px-3 h-10 rounded-2xl text-slate-600 text-[13px] font-bold" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}>
          <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 17 }}>calendar_today</span>{today}
        </div>

        <div className="relative">
          <button onClick={() => { setNotifOpen(value => !value); setDropdownOpen(false); }} className="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-slate-900 transition-all" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 21 }}>notifications</span>
            {pendingApprovals.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white" />}
          </button>
          {notifOpen && <><div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} /><div className="absolute right-0 mt-3 w-84 max-w-[calc(100vw-24px)] rounded-2xl z-50 overflow-hidden animate-scale-in" style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.18)' }}><h4 className="font-bold text-[14px] text-slate-900">Operations Queue</h4>{pendingApprovals.length > 0 && <span className="badge badge-pending">{pendingApprovals.length} pending</span>}</div>
            <div className="max-h-72 overflow-y-auto">{pendingApprovals.length === 0 ? <div className="flex flex-col items-center py-8 text-slate-500"><span className="material-symbols-outlined mb-2" style={{ fontSize: 34 }}>notifications_none</span><p className="text-[13px]">No alerts in queue</p></div> : pendingApprovals.slice(0, 5).map(item => <div key={item.id} className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => { navigate('/approvals'); setNotifOpen(false); }} style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}><p className="text-[13px] font-bold text-slate-900 truncate">{item.type}</p><p className="text-[12px] text-slate-500 truncate mt-0.5">{item.title}</p><p className="text-[11px] text-indigo-600 mt-1 font-bold">₹{item.amount?.toLocaleString()}</p></div>)}</div>
          </div></>}
        </div>

        <button className="hidden xl:flex items-center gap-2 px-3 h-10 rounded-2xl text-slate-600 hover:text-slate-900 transition-all text-[13px] font-bold" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>Filters</button>
        <button className="hidden xl:flex items-center gap-2 px-3 h-10 rounded-2xl transition-all text-[13px] font-black hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#ffffff', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 8px 24px rgba(99,102,241,0.24)' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>Export</button>
        <button className="xl:hidden w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-slate-900 transition-all" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}><span className="material-symbols-outlined" style={{ fontSize: 21 }}>tune</span></button>

        <div className="relative">
          <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl transition-all hover:bg-slate-100" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }} onClick={() => { setDropdownOpen(value => !value); setNotifOpen(false); }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black" style={{ background: rCfg.bg, color: rCfg.color }}>{userInitials}</div>
            <div className="text-left hidden sm:block"><p className="text-[13px] font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p><p className="text-[11px] text-slate-500 leading-tight">{rCfg.label}</p></div>
            <span className="material-symbols-outlined text-slate-400 hidden sm:block" style={{ fontSize: 16 }}>{dropdownOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          {dropdownOpen && <><div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} /><div className="absolute right-0 mt-3 w-60 rounded-2xl z-50 overflow-hidden animate-scale-in" style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', boxShadow: 'var(--shadow)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.18)' }}><p className="text-[13px] font-bold text-slate-900 truncate">{user?.name}</p><p className="text-[12px] text-slate-500 truncate mt-0.5">{user?.email}</p></div>
            <div className="py-1.5"><button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors"><span className="material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>person</span>My Profile</button><button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors"><span className="material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>settings</span>Preferences</button></div>
            <div className="py-1.5" style={{ borderTop: '1px solid rgba(148,163,184,0.18)' }}><button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-3 font-bold transition-colors"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>Sign Out</button></div>
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


