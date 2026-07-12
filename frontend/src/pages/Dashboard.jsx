import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

// ─── Data ───────────────────────────────────────────────────────────────────
const kpis = [
  { label: 'Active Vehicles', value: '284', sub: '196 available', icon: 'directions_bus', tone: 'blue' },
  { label: 'Active Trips', value: '148', sub: '27 pending', icon: 'route', tone: 'green' },
  { label: 'Fleet Utilization', value: '82%', sub: '+6.3% vs yesterday', icon: 'monitoring', tone: 'amber' },
  { label: 'In Maintenance', value: '32', sub: '3 due today', icon: 'build_circle', tone: 'red' },
];

const trips = [
  { id: 'TRP-2048', route: 'Airport Express', vehicle: 'BUS-1142', driver: 'Anika Rao', eta: '12 min', status: 'On Time' },
  { id: 'TRP-2047', route: 'West Freight Link', vehicle: 'TRK-0871', driver: 'Dev Mehta', eta: '28 min', status: 'Delayed' },
  { id: 'TRP-2046', route: 'Central Loop', vehicle: 'BUS-1039', driver: 'Farah Khan', eta: 'Arrived', status: 'Complete' },
  { id: 'TRP-2045', route: 'North Depot Feeder', vehicle: 'VAN-0432', driver: 'Rohan Iyer', eta: '19 min', status: 'On Time' },
];

const alerts = [
  { icon: 'warning', title: 'Route congestion detected', detail: 'West Freight Link avg. speed down 18%.', tone: 'amber' },
  { icon: 'tire_repair', title: 'Maintenance threshold reached', detail: 'BUS-1188 due for brake inspection.', tone: 'red' },
  { icon: 'check_circle', title: 'Depot dispatch normalized', detail: 'Central Depot queue back under SLA.', tone: 'green' },
];

const tones = {
  amber: { color: '#fbbf24', bg: 'rgba(245,158,11,0.13)' },
  blue:  { color: '#7dd3fc', bg: 'rgba(56,189,248,0.13)' },
  green: { color: '#86efac', bg: 'rgba(34,197,94,0.13)' },
  red:   { color: '#fca5a5', bg: 'rgba(239,68,68,0.13)' },
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ item }) {
  const tone = tones[item.tone];
  return (
    <article className="db-kpi transit-panel">
      <div className="db-kpi-icon" style={{ background: tone.bg, color: tone.color }}>
        <span className="material-symbols-outlined">{item.icon}</span>
      </div>
      <div className="db-kpi-body">
        <p className="db-kpi-label">{item.label}</p>
        <strong className="db-kpi-value" style={{ color: '#fff' }}>{item.value}</strong>
        <span className="db-kpi-sub">{item.sub}</span>
      </div>
    </article>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = { 'On Time': 'badge badge-active', Complete: 'badge badge-approved', Delayed: 'badge badge-overdue' };
  return <span className={map[status] || 'badge badge-draft'}>{status}</span>;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Dashboard">
      <div className="db-root">

        {/* Hero */}
        <section className="db-hero transit-panel">
          <div>
            <p className="transit-eyebrow mb-2">Smart Transport Operations</p>
            <h1 className="db-hero-title">Good Morning, Fleet Manager 👋</h1>
            <p className="db-hero-sub">Live operational picture — fleet, trips, utilization &amp; alerts.</p>
          </div>
          <div className="db-hero-actions">
            <button className="transit-btn transit-btn-primary" onClick={() => navigate('/analytics')}>
              <span className="material-symbols-outlined">insights</span>View Analytics
            </button>
          </div>
        </section>

        {/* KPI Row */}
        <section className="db-kpi-row">
          {kpis.map(item => <KpiCard key={item.label} item={item} />)}
        </section>

        {/* Main content — 2 columns */}
        <section className="db-grid">

          {/* Recent Trips */}
          <div className="transit-panel db-card">
            <div className="db-card-head">
              <div>
                <h3>Recent Trips</h3>
                <p>Latest high-priority movements</p>
              </div>
              <button className="transit-btn" onClick={() => navigate('/trips')}>View All</button>
            </div>
            <div className="db-trip-list">
              {trips.map(trip => (
                <div key={trip.id} className="db-trip-row">
                  <div className="db-trip-icon">
                    <span className="material-symbols-outlined">route</span>
                  </div>
                  <div className="db-trip-main">
                    <strong>{trip.route}</strong>
                    <span>{trip.vehicle} · {trip.driver}</span>
                  </div>
                  <div className="db-trip-meta">
                    <span>{trip.eta}</span>
                    <StatusBadge status={trip.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="transit-panel db-card">
            <div className="db-card-head">
              <div>
                <h3>Alerts</h3>
                <p>Actionable operational events</p>
              </div>
            </div>
            <div className="db-alert-list">
              {alerts.map(alert => (
                <div key={alert.title} className={`db-alert ${alert.tone}`}>
                  <span className="material-symbols-outlined">{alert.icon}</span>
                  <div>
                    <strong>{alert.title}</strong>
                    <p>{alert.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      <style>{`
        .db-root { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

        /* Hero */
        .db-hero {
          display: flex; justify-content: space-between; align-items: center;
          gap: 20px; padding: 24px 28px;
          background: linear-gradient(135deg, rgba(17,24,39,.94), rgba(15,23,42,.80)),
                      radial-gradient(circle at 80% 20%, rgba(245,158,11,.16), transparent 30%);
        }
        .db-hero-title { margin: 6px 0 0; color: #fff; font-size: clamp(22px, 3vw, 32px); font-weight: 950; line-height: 1.1; }
        .db-hero-sub   { margin: 6px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.55; }
        .db-hero-actions { flex-shrink: 0; }

        /* KPI */
        .db-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .db-kpi { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .db-kpi-icon { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; flex-shrink: 0; }
        .db-kpi-icon span { font-size: 24px; font-variation-settings: 'FILL' 1; }
        .db-kpi-body { min-width: 0; }
        .db-kpi-label { margin: 0; color: #94a3b8; font-size: 12px; font-weight: 800; }
        .db-kpi-value { display: block; color: #fff; font-size: 28px; font-weight: 950; line-height: 1.1; margin: 2px 0; }
        .db-kpi-sub   { color: #64748b; font-size: 11px; font-weight: 700; }

        /* Grid */
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .db-card { padding: 22px; }
        .db-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
        .db-card-head h3 { margin: 0; color: #fff; font-size: 15px; font-weight: 900; }
        .db-card-head p  { margin: 3px 0 0; color: #94a3b8; font-size: 12px; font-weight: 700; }

        /* Trips */
        .db-trip-list { display: flex; flex-direction: column; gap: 10px; }
        .db-trip-row { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; background: rgba(15,23,42,.56); border: 1px solid rgba(148,163,184,.11); }
        .db-trip-icon { width: 40px; height: 40px; border-radius: 13px; display: grid; place-items: center; background: rgba(245,158,11,.11); color: #fbbf24; }
        .db-trip-icon span { font-size: 20px; }
        .db-trip-main strong { display: block; color: #fff; font-size: 13px; font-weight: 800; }
        .db-trip-main span  { color: #94a3b8; font-size: 11px; font-weight: 700; }
        .db-trip-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .db-trip-meta span { color: #94a3b8; font-size: 11px; font-weight: 700; }

        /* Alerts */
        .db-alert-list { display: flex; flex-direction: column; gap: 10px; }
        .db-alert { display: grid; grid-template-columns: 38px 1fr; gap: 12px; padding: 13px; border-radius: 14px; border: 1px solid rgba(148,163,184,.12); background: rgba(15,23,42,.56); align-items: start; }
        .db-alert > span { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; font-variation-settings: 'FILL' 1; }
        .db-alert.amber > span { color: #fbbf24; background: rgba(245,158,11,.12); }
        .db-alert.red   > span { color: #fca5a5; background: rgba(239,68,68,.12); }
        .db-alert.green > span { color: #86efac; background: rgba(34,197,94,.12); }
        .db-alert strong { display: block; color: #fff; font-size: 13px; font-weight: 800; }
        .db-alert p { margin: 3px 0 0; color: #94a3b8; font-size: 12px; line-height: 1.45; }

        /* Responsive */
        @media (max-width: 900px) {
          .db-kpi-row { grid-template-columns: repeat(2, 1fr); }
          .db-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .db-hero { flex-direction: column; align-items: flex-start; }
          .db-kpi-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;
