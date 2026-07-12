import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const ROLE_HOME = {
  fleet_manager: '/dashboard',
  driver: '/trips',
  safety_officer: '/drivers',
  financial_analyst: '/expenses',
};

const homeFor = role => ROLE_HOME[role] || '/dashboard';

const FIELD_STYLE = {
  email: { icon: 'mail', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'name@company.com' },
  password: { icon: 'lock', label: 'Password', type: 'password', autoComplete: 'current-password', placeholder: 'Enter your password' },
};

function TransitLogo() {
  return (
    <div className="auth-logo" aria-label="TransitOps">
      <div className="auth-logo-mark">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
      </div>
      <div>
        <p>TransitOps</p>
        <span>Smart Transport Operations Platform</span>
      </div>
    </div>
  );
}

function AuthField({ id, value, onChange, showPassword, onTogglePassword }) {
  const cfg = FIELD_STYLE[id];
  const isPassword = id === 'password';

  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-label">{cfg.label}</span>
      <span className="auth-input-wrap">
        <span className="material-symbols-outlined auth-input-icon">{cfg.icon}</span>
        <input
          id={id}
          name={id}
          type={isPassword && showPassword ? 'text' : cfg.type}
          value={value}
          onChange={onChange}
          placeholder={cfg.placeholder}
          autoComplete={cfg.autoComplete}
          required
        />
        {isPassword && (
          <button
            className="auth-ghost-icon"
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </span>
    </label>
  );
}

function LogisticsIllustration() {
  const routeDots = [
    { left: '11%', top: '62%' },
    { left: '29%', top: '51%' },
    { left: '48%', top: '58%' },
    { left: '67%', top: '43%' },
    { left: '82%', top: '53%' },
  ];

  return (
    <div className="logistics-scene" aria-hidden="true">
      <div className="map-grid" />
      <div className="route route-one" />
      <div className="route route-two" />
      {routeDots.map(dot => <span key={`${dot.left}-${dot.top}`} className="route-dot" style={dot} />)}

      <div className="warehouse warehouse-main">
        <span className="roof" />
        <span className="door" />
        <span className="bay bay-one" />
        <span className="bay bay-two" />
      </div>
      <div className="warehouse warehouse-small">
        <span className="roof" />
        <span className="door" />
      </div>

      <div className="truck truck-primary">
        <span className="trailer" />
        <span className="cab" />
        <span className="wheel wheel-one" />
        <span className="wheel wheel-two" />
      </div>
      <div className="truck truck-secondary">
        <span className="trailer" />
        <span className="cab" />
        <span className="wheel wheel-one" />
        <span className="wheel wheel-two" />
      </div>

      <div className="control-card control-card-a">
        <span className="material-symbols-outlined">local_shipping</span>
        <div><strong>284</strong><small>Fleet active</small></div>
      </div>
      <div className="control-card control-card-b">
        <span className="material-symbols-outlined">route</span>
        <div><strong>98.7%</strong><small>On-time lanes</small></div>
      </div>
      <div className="map-pin pin-a"><span className="material-symbols-outlined">location_on</span></div>
      <div className="map-pin pin-b"><span className="material-symbols-outlined">warehouse</span></div>
    </div>
  );
}

export default function Login() {
  const { login, user } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTestCreds, setShowTestCreds] = useState(false);

  const TEST_CREDENTIALS = [
    { role: 'Admin', email: 'admin@transitops.com', password: 'Admin@123' },
    { role: 'Fleet Manager', email: 'fleet@transitops.com', password: 'Fleet@123' },
    { role: 'Driver', email: 'driver@transitops.com', password: 'Driver@123' },
    { role: 'Safety Officer', email: 'safety@transitops.com', password: 'Safety@123' },
    { role: 'Financial Analyst', email: 'finance@transitops.com', password: 'Finance@123' },
  ];

  useEffect(() => {
    if (user) navigate(homeFor(user.role));
  }, [navigate, user]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate async delay for UX
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const loggedUser = login(email.trim(), password);
    setLoading(false);
    
    if (!loggedUser) {
      setError('The email or password is incorrect. Please verify your credentials.');
      return;
    }
    
    navigate(homeFor(loggedUser.role));
  };

  return (
    <main className="auth-page">
      <section className="auth-visual-panel">
        <div className="auth-overlay" />
        <div className="auth-brand-layer">
          <TransitLogo />
          <div className="auth-visual-copy">
            <span className="auth-pill"><span /> Live network command</span>
            <h1>Coordinate every lane, depot, and fleet decision in one trusted platform.</h1>
            <p>TransitOps gives enterprise teams a secure operating layer for transport planning, partner capacity, route intelligence, and settlement workflows.</p>
          </div>
          <LogisticsIllustration />
          <div className="auth-proof-row">
            <div><strong>99.9%</strong><span>Platform uptime</span></div>
            <div><strong>24/7</strong><span>Ops visibility</span></div>
            <div><strong>SOC 2</strong><span>Ready controls</span></div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card-shell">
          <div className="auth-mobile-logo"><TransitLogo /></div>
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-head">
              <h2>Welcome Back</h2>
              <p>Sign in to monitor your transport operations workspace.</p>
            </div>

            <AuthField id="email" value={email} onChange={event => { setEmail(event.target.value); setError(''); }} />
            <AuthField
              id="password"
              value={password}
              onChange={event => { setPassword(event.target.value); setError(''); }}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(value => !value)}
            />

            <div className="auth-options">
              <label className="auth-check">
                <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />
                <span>Remember Me</span>
              </label>
              <a href="#forgot-password">Forgot Password?</a>
            </div>

            {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

            {/* Test Credentials Helper - Development Only */}
            {showTestCreds && (
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                marginBottom: '16px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#4f46e5', fontSize: '11px', fontWeight: '850' }}>TEST CREDENTIALS</strong>
                  <button type="button" onClick={() => setShowTestCreds(false)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
                {TEST_CREDENTIALS.map(cred => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => { setEmail(cred.email); setPassword(cred.password); setError(''); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(99,102,241,0.15)',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#1e293b',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    <span style={{ color: '#6366f1', fontWeight: '800' }}>{cred.role}</span>: {cred.email}
                  </button>
                ))}
              </div>
            )}
            
            {!showTestCreds && (
              <button
                type="button"
                onClick={() => setShowTestCreds(true)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  marginBottom: '16px',
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px dashed rgba(99,102,241,0.3)',
                  borderRadius: '10px',
                  color: '#6366f1',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
                Show Test Credentials
              </button>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <span className="material-symbols-outlined">login</span>}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="auth-small-footer">Protected by enterprise-grade encryption. Authorized users only.</p>
          </form>
          <footer className="auth-footer">© 2026 TransitOps. Smart Transport Operations Platform.</footer>
        </div>
      </section>

      <style>{`
        html, body { min-height: 100%; }
        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(520px, 1.08fr) minmax(420px, .92fr);
          background: #f1f5f9;
          color: #0f172a;
          font-family: Inter, system-ui, sans-serif;
        }
        .auth-visual-panel {
          position: relative;
          min-height: 100vh;
          background:
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,252,.92)),
            radial-gradient(circle at 24% 18%, rgba(245, 158, 11, .14), transparent 28%),
            radial-gradient(circle at 76% 62%, rgba(56, 189, 248, .10), transparent 32%),
            linear-gradient(140deg, #f8fafc 0%, #ffffff 48%, #f1f5f9 100%);
        }
        .auth-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(148, 163, 184, .06) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, .06) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(90deg, #000 0%, rgba(0,0,0,.9) 48%, transparent 100%);
        }
        .auth-brand-layer {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
        }
        .auth-logo { display: flex; align-items: center; gap: 12px; }
        .auth-logo-mark {
          width: 44px; height: 44px; border-radius: 16px;
          display: grid; place-items: center;
          color: #0f172a;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          box-shadow: 0 14px 32px rgba(245, 158, 11, .28);
        }
        .auth-logo-mark span { font-size: 24px; font-variation-settings: 'FILL' 1; }
        .auth-logo p { margin: 0; font-size: 17px; font-weight: 900; color: #0f172a; letter-spacing: 0; }
        .auth-logo span { display: block; margin-top: 2px; color: #64748b; font-size: 11px; font-weight: 650; }
        .auth-visual-copy { max-width: 600px; }
        .auth-pill {
          display: inline-flex; align-items: center; gap: 8px;
          min-height: 30px; padding: 0 12px; border-radius: 999px;
          background: rgba(245, 158, 11, .12);
          border: 1px solid rgba(251, 191, 36, .26);
          color: #fcd34d; font-size: 11px; font-weight: 800;
          margin-bottom: 16px;
        }
        .auth-pill span { width: 6px; height: 6px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.12); }
        .auth-visual-copy h1 {
          margin: 0;
          max-width: 600px;
          color: #0f172a;
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: 0;
        }
        .auth-visual-copy p { margin: 16px 0 0; max-width: 520px; color: #475569; font-size: 14px; line-height: 1.6; }
        .logistics-scene {
          position: relative;
          align-self: flex-start;
          margin: auto 0;
          width: min(760px, 100%);
          min-height: 330px;
          zoom: 0.85;
          border-radius: 28px;
          background: linear-gradient(160deg, rgba(255,255,255,.94), rgba(241,245,249,.85));
          border: 1px solid rgba(148,163,184,.32);
          box-shadow: 0 24px 60px rgba(0,0,0,.08);
          overflow: hidden;
        }
        .map-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(148,163,184,.18) 1px, transparent 1px); background-size: 20px 20px; opacity: .52; }
        .route { position: absolute; height: 110px; border: 3px solid rgba(251,191,36,.68); border-left: 0; border-bottom: 0; border-radius: 0 80px 0 0; transform: rotate(-7deg); }
        .route-one { left: 8%; top: 46%; width: 74%; }
        .route-two { left: 18%; top: 30%; width: 62%; border-color: rgba(56,189,248,.44); transform: rotate(8deg); }
        .route-dot { position: absolute; width: 12px; height: 12px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 0 7px rgba(251,191,36,.13); }
        .warehouse { position: absolute; width: 118px; height: 84px; border-radius: 12px; background: rgba(248,250,252,.9); border: 1px solid rgba(148,163,184,.32); }
        .warehouse .roof { position: absolute; left: 13px; right: 13px; top: -18px; height: 34px; background: linear-gradient(135deg, rgba(251,191,36,.88), rgba(245,158,11,.72)); clip-path: polygon(0 100%, 50% 0, 100% 100%); }
        .warehouse .door { position: absolute; left: 18px; bottom: 0; width: 28px; height: 42px; border-radius: 8px 8px 0 0; background: rgba(226,232,240,.95); border: 1px solid rgba(148,163,184,.35); }
        .warehouse .bay { position: absolute; bottom: 18px; width: 20px; height: 14px; border-radius: 4px; background: rgba(125,211,252,.24); }
        .warehouse .bay-one { right: 42px; } .warehouse .bay-two { right: 14px; }
        .warehouse-main { left: 10%; top: 23%; } .warehouse-small { right: 12%; top: 20%; transform: scale(.82); opacity: .86; }
        .truck { position: absolute; height: 54px; }
        .truck .trailer { position: absolute; left: 0; top: 8px; width: 98px; height: 38px; border-radius: 10px; background: linear-gradient(180deg, rgba(248,250,252,.96), rgba(203,213,225,.88)); }
        .truck .cab { position: absolute; left: 92px; top: 16px; width: 44px; height: 30px; border-radius: 8px 12px 8px 4px; background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .truck .wheel { position: absolute; bottom: 0; width: 14px; height: 14px; border-radius: 50%; background: #020617; border: 3px solid #64748b; }
        .truck .wheel-one { left: 22px; } .truck .wheel-two { left: 104px; }
        .truck-primary { left: 42%; top: 59%; width: 140px; }
        .truck-secondary { left: 22%; top: 72%; width: 140px; transform: scale(.78); opacity: .82; }
        .control-card { position: absolute; display: flex; align-items: center; gap: 10px; padding: 11px 13px; border-radius: 16px; background: rgba(255,255,255,.94); border: 1px solid rgba(148,163,184,.28); backdrop-filter: blur(14px); box-shadow: 0 12px 30px rgba(0,0,0,.08); }
        .control-card span { color: #fbbf24; font-size: 21px; }
        .control-card strong { display: block; color: #0f172a; font-size: 16px; line-height: 1; }
        .control-card small { color: #64748b; font-size: 11px; font-weight: 700; }
        .control-card-a { left: 7%; bottom: 10%; } .control-card-b { right: 7%; bottom: 12%; }
        .map-pin { position: absolute; width: 38px; height: 38px; border-radius: 14px; display: grid; place-items: center; background: rgba(56,189,248,.12); border: 1px solid rgba(56,189,248,.38); color: #0ea5e9; }
        .map-pin span { font-size: 21px; font-variation-settings: 'FILL' 1; }
        .pin-a { left: 57%; top: 25%; } .pin-b { right: 23%; top: 48%; color: #d97706; background: rgba(245,158,11,.15); border-color: rgba(245,158,11,.38); }
        .auth-proof-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 580px; }
        .auth-proof-row div { padding: 14px 14px; border-radius: 16px; background: rgba(255,255,255,.82); border: 1px solid rgba(148,163,184,.32); backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,.04); }
        .auth-proof-row strong { display: block; color: #0f172a; font-size: 16px; font-weight: 950; }
        .auth-proof-row span { display: block; margin-top: 2px; color: #64748b; font-size: 11px; font-weight: 700; }
        .auth-form-panel {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 40px;
          background:
            radial-gradient(circle at 30% 0%, rgba(245,158,11,.08), transparent 30%),
            linear-gradient(160deg, #f8fafc, #ffffff 58%, #f1f5f9);
        }
        .auth-card-shell { width: min(100%, 480px); margin: auto; }
        .auth-mobile-logo { display: none; margin-bottom: 24px; }
        .auth-card {
          padding: 32px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid rgba(226,232,240,.6);
          box-shadow: 0 16px 40px rgba(0,0,0,.06);
        }
        .auth-card-head { margin-bottom: 24px; }
        .auth-card h2 { margin: 0; color: #0f172a; font-size: 28px; line-height: 1.1; font-weight: 950; letter-spacing: 0; }
        .auth-card-head p { margin: 6px 0 0; color: #64748b; font-size: 13px; line-height: 1.5; }
        .auth-field { display: block; margin-bottom: 16px; }
        .auth-label { display: block; color: #475569; font-size: 12px; font-weight: 850; margin-bottom: 6px; }
        .auth-input-wrap { position: relative; display: block; }
        .auth-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 18px; pointer-events: none; }
        .auth-input-wrap input {
          width: 100%; height: 44px; border-radius: 12px;
          padding: 0 46px 0 44px;
          color: #0f172a !important;
          background: #f8fafc !important;
          border: 1px solid rgba(148,163,184,.35) !important;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .auth-input-wrap input:focus { border-color: rgba(251,191,36,.82) !important; box-shadow: 0 0 0 4px rgba(245,158,11,.14) !important; background: #ffffff !important; }
        .auth-input-wrap input::placeholder { color: #94a3b8 !important; }
        .auth-ghost-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; min-height: 32px; border: 0; border-radius: 10px; background: transparent; color: #64748b; display: grid; place-items: center; }
        .auth-ghost-icon:hover { background: rgba(148,163,184,.14); color: #0f172a; }
        .auth-ghost-icon span { font-size: 18px; }
        .auth-options { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 2px 0 18px; }
        .auth-check { display: inline-flex; align-items: center; gap: 9px; color: #475569; font-size: 13px; font-weight: 700; cursor: pointer; user-select: none; }
        .auth-check input { width: 16px; height: 16px; accent-color: #f59e0b; }
        .auth-options a { color: #d97706; text-decoration: none; font-size: 13px; font-weight: 850; }
        .auth-options a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .auth-error { display: flex; align-items: center; gap: 9px; padding: 11px 12px; border-radius: 14px; margin-bottom: 16px; color: #fca5a5; background: rgba(239,68,68,.11); border: 1px solid rgba(239,68,68,.22); font-size: 13px; font-weight: 700; }
        .auth-error span { font-size: 18px; }
        .auth-submit { width: 100%; height: 44px; border: 0; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #0f172a; font-size: 14px; font-weight: 950; display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(245,158,11,.28); }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(245,158,11,.36); }
        .auth-submit:disabled { cursor: not-allowed; opacity: .72; }
        .auth-submit span { font-size: 19px; }
        .auth-spinner { width: 18px; height: 18px; border-radius: 999px; border: 2px solid rgba(15,23,42,.15); border-top-color: #0f172a; animation: authSpin .7s linear infinite; }
        .auth-small-footer { margin: 18px 0 0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5; }
        .auth-footer { margin-top: 18px; text-align: center; color: #64748b; font-size: 12px; font-weight: 700; }
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-visual-panel { display: none; }
          .auth-form-panel { padding: 28px 20px; }
          .auth-mobile-logo { display: block; }
          .auth-mobile-logo .auth-logo { justify-content: center; }
        }
        @media (max-width: 520px) {
          .auth-card { padding: 24px; border-radius: 20px; }
          .auth-card h2 { font-size: 28px; }
          .auth-options { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
