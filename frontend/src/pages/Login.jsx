import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const FIELD_STYLE = {
  email: { icon: 'mail', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'name@company.com' },
  password: { icon: 'lock', label: 'Password', type: 'password', autoComplete: 'current-password', placeholder: 'Enter your password' },
};

function TransitLogo() {
  return (
    <div className="auth-logo" aria-label="TransitOps">
      <div className="auth-logo-mark">
        <span className="material-symbols-outlined">conversion_path</span>
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

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [navigate, user]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 420));
    const loggedUser = login(email.trim(), password);
    setLoading(false);
    if (!loggedUser) {
      setError('The email or password is incorrect. Please verify your credentials.');
      return;
    }
    navigate('/dashboard');
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
              <span className="auth-secure-badge"><span className="material-symbols-outlined">encrypted</span> Secure access</span>
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
        html, body { min-height: 100%; overflow: hidden; }
        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(520px, 1.08fr) minmax(420px, .92fr);
          background: #080d17;
          color: #f8fafc;
          font-family: Inter, system-ui, sans-serif;
        }
        .auth-visual-panel {
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          background:
            linear-gradient(135deg, rgba(8, 13, 23, .76), rgba(8, 13, 23, .92)),
            radial-gradient(circle at 24% 18%, rgba(245, 158, 11, .22), transparent 28%),
            radial-gradient(circle at 76% 62%, rgba(56, 189, 248, .14), transparent 32%),
            linear-gradient(140deg, #0b1220 0%, #111827 48%, #060910 100%);
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
          height: 100%;
          min-height: 100vh;
          padding: 40px;
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          gap: 28px;
        }
        .auth-logo { display: flex; align-items: center; gap: 14px; }
        .auth-logo-mark {
          width: 46px; height: 46px; border-radius: 16px;
          display: grid; place-items: center;
          color: #111827;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          box-shadow: 0 18px 42px rgba(245, 158, 11, .28);
        }
        .auth-logo-mark span { font-size: 25px; font-variation-settings: 'FILL' 1; }
        .auth-logo p { margin: 0; font-size: 18px; font-weight: 900; color: #fff; letter-spacing: 0; }
        .auth-logo span { display: block; margin-top: 2px; color: #94a3b8; font-size: 12px; font-weight: 650; }
        .auth-visual-copy { max-width: 640px; align-self: end; }
        .auth-pill {
          display: inline-flex; align-items: center; gap: 8px;
          min-height: 34px; padding: 0 13px; border-radius: 999px;
          background: rgba(245, 158, 11, .12);
          border: 1px solid rgba(251, 191, 36, .26);
          color: #fcd34d; font-size: 12px; font-weight: 800;
          margin-bottom: 18px;
        }
        .auth-pill span { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 5px rgba(34,197,94,.12); }
        .auth-visual-copy h1 {
          margin: 0;
          max-width: 660px;
          color: #fff;
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: 0;
        }
        .auth-visual-copy p { margin: 20px 0 0; max-width: 560px; color: #cbd5e1; font-size: 15px; line-height: 1.75; }
        .logistics-scene {
          position: relative;
          align-self: center;
          width: min(760px, 100%);
          min-height: 330px;
          border-radius: 28px;
          background: linear-gradient(160deg, rgba(15,23,42,.72), rgba(17,24,39,.40));
          border: 1px solid rgba(148,163,184,.18);
          box-shadow: 0 34px 90px rgba(0,0,0,.36);
          overflow: hidden;
        }
        .map-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(148,163,184,.18) 1px, transparent 1px); background-size: 20px 20px; opacity: .52; }
        .route { position: absolute; height: 110px; border: 3px solid rgba(251,191,36,.68); border-left: 0; border-bottom: 0; border-radius: 0 80px 0 0; transform: rotate(-7deg); }
        .route-one { left: 8%; top: 46%; width: 74%; }
        .route-two { left: 18%; top: 30%; width: 62%; border-color: rgba(56,189,248,.44); transform: rotate(8deg); }
        .route-dot { position: absolute; width: 12px; height: 12px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 0 7px rgba(251,191,36,.13); }
        .warehouse { position: absolute; width: 118px; height: 84px; border-radius: 12px; background: rgba(226,232,240,.10); border: 1px solid rgba(226,232,240,.22); }
        .warehouse .roof { position: absolute; left: 13px; right: 13px; top: -18px; height: 34px; background: linear-gradient(135deg, rgba(251,191,36,.88), rgba(245,158,11,.72)); clip-path: polygon(0 100%, 50% 0, 100% 100%); }
        .warehouse .door { position: absolute; left: 18px; bottom: 0; width: 28px; height: 42px; border-radius: 8px 8px 0 0; background: rgba(15,23,42,.85); border: 1px solid rgba(148,163,184,.22); }
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
        .control-card { position: absolute; display: flex; align-items: center; gap: 10px; padding: 11px 13px; border-radius: 16px; background: rgba(8,13,23,.74); border: 1px solid rgba(148,163,184,.20); backdrop-filter: blur(14px); box-shadow: 0 18px 40px rgba(0,0,0,.24); }
        .control-card span { color: #fbbf24; font-size: 21px; }
        .control-card strong { display: block; color: #fff; font-size: 16px; line-height: 1; }
        .control-card small { color: #94a3b8; font-size: 11px; font-weight: 700; }
        .control-card-a { left: 7%; bottom: 10%; } .control-card-b { right: 7%; bottom: 12%; }
        .map-pin { position: absolute; width: 38px; height: 38px; border-radius: 14px; display: grid; place-items: center; background: rgba(56,189,248,.12); border: 1px solid rgba(56,189,248,.28); color: #7dd3fc; }
        .map-pin span { font-size: 21px; font-variation-settings: 'FILL' 1; }
        .pin-a { left: 57%; top: 25%; } .pin-b { right: 23%; top: 48%; color: #fbbf24; background: rgba(245,158,11,.12); border-color: rgba(245,158,11,.28); }
        .auth-proof-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 620px; }
        .auth-proof-row div { padding: 15px 16px; border-radius: 18px; background: rgba(15,23,42,.62); border: 1px solid rgba(148,163,184,.16); backdrop-filter: blur(12px); }
        .auth-proof-row strong { display: block; color: #fff; font-size: 18px; font-weight: 950; }
        .auth-proof-row span { display: block; margin-top: 3px; color: #94a3b8; font-size: 12px; font-weight: 700; }
        .auth-form-panel {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 40px;
          background:
            radial-gradient(circle at 30% 0%, rgba(245,158,11,.12), transparent 30%),
            linear-gradient(160deg, #0b1220, #111827 58%, #070b13);
        }
        .auth-card-shell { width: min(100%, 480px); }
        .auth-mobile-logo { display: none; margin-bottom: 24px; }
        .auth-card {
          padding: 34px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(17,24,39,.78), rgba(15,23,42,.66));
          border: 1px solid rgba(226,232,240,.14);
          box-shadow: 0 34px 90px rgba(0,0,0,.38);
          backdrop-filter: blur(22px);
        }
        .auth-card-head { margin-bottom: 26px; }
        .auth-secure-badge { display: inline-flex; align-items: center; gap: 7px; min-height: 30px; padding: 0 11px; border-radius: 999px; background: rgba(34,197,94,.10); border: 1px solid rgba(34,197,94,.20); color: #86efac; font-size: 12px; font-weight: 850; margin-bottom: 14px; }
        .auth-secure-badge span { font-size: 15px; }
        .auth-card h2 { margin: 0; color: #fff; font-size: 32px; line-height: 1.1; font-weight: 950; letter-spacing: 0; }
        .auth-card-head p { margin: 8px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.55; }
        .auth-field { display: block; margin-bottom: 16px; }
        .auth-label { display: block; color: #cbd5e1; font-size: 12px; font-weight: 850; margin-bottom: 8px; }
        .auth-input-wrap { position: relative; display: block; }
        .auth-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 18px; pointer-events: none; }
        .auth-input-wrap input {
          width: 100%; height: 48px; border-radius: 15px;
          padding: 0 46px 0 44px;
          color: #f8fafc !important;
          background: rgba(8,13,23,.68) !important;
          border: 1px solid rgba(148,163,184,.22) !important;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .auth-input-wrap input:focus { border-color: rgba(251,191,36,.72) !important; box-shadow: 0 0 0 4px rgba(245,158,11,.14) !important; background: rgba(8,13,23,.86) !important; }
        .auth-input-wrap input::placeholder { color: #64748b !important; }
        .auth-ghost-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; min-height: 32px; border: 0; border-radius: 10px; background: transparent; color: #94a3b8; display: grid; place-items: center; }
        .auth-ghost-icon:hover { background: rgba(148,163,184,.10); color: #f8fafc; }
        .auth-ghost-icon span { font-size: 18px; }
        .auth-options { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 2px 0 18px; }
        .auth-check { display: inline-flex; align-items: center; gap: 9px; color: #cbd5e1; font-size: 13px; font-weight: 700; cursor: pointer; user-select: none; }
        .auth-check input { width: 16px; height: 16px; accent-color: #f59e0b; }
        .auth-options a { color: #fbbf24; text-decoration: none; font-size: 13px; font-weight: 850; }
        .auth-options a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .auth-error { display: flex; align-items: center; gap: 9px; padding: 11px 12px; border-radius: 14px; margin-bottom: 16px; color: #fca5a5; background: rgba(239,68,68,.11); border: 1px solid rgba(239,68,68,.22); font-size: 13px; font-weight: 700; }
        .auth-error span { font-size: 18px; }
        .auth-submit { width: 100%; height: 48px; border: 0; border-radius: 15px; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #111827; font-size: 15px; font-weight: 950; display: inline-flex; align-items: center; justify-content: center; gap: 9px; box-shadow: 0 18px 42px rgba(245,158,11,.22); }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 22px 52px rgba(245,158,11,.30); }
        .auth-submit:disabled { cursor: not-allowed; opacity: .72; }
        .auth-submit span { font-size: 19px; }
        .auth-spinner { width: 18px; height: 18px; border-radius: 999px; border: 2px solid rgba(17,24,39,.24); border-top-color: #111827; animation: authSpin .7s linear infinite; }
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
          html, body { overflow: auto; }
          .auth-card { padding: 24px; border-radius: 20px; }
          .auth-card h2 { font-size: 28px; }
          .auth-options { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
