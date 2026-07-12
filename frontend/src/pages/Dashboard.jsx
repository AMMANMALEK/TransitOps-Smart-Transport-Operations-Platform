import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const sparkPaths = {
  up: 'M2 24 C10 18 13 20 20 14 S32 9 42 5',
  flat: 'M2 18 C11 14 16 18 24 15 S34 16 42 12',
  down: 'M2 8 C10 10 14 15 21 15 S33 22 42 24',
};

const kpis = [
  { label: 'Active Vehicles', value: '284', change: '+12.4%', icon: 'directions_bus', tone: 'blue', trend: 'up' },
  { label: 'Available Vehicles', value: '196', change: '+8.1%', icon: 'garage', tone: 'green', trend: 'up' },
  { label: 'Vehicles In Maintenance', value: '32', change: '-3.2%', icon: 'build_circle', tone: 'amber', trend: 'down' },
  { label: 'Active Trips', value: '148', change: '+18.6%', icon: 'route', tone: 'green', trend: 'up' },
  { label: 'Pending Trips', value: '27', change: '+4.8%', icon: 'pending_actions', tone: 'amber', trend: 'flat' },
  { label: 'Fleet Utilization', value: '82%', change: '+6.3%', icon: 'monitoring', tone: 'blue', trend: 'up' },
];

const trips = [
  { id: 'TRP-2048', route: 'Airport Express', vehicle: 'BUS-1142', driver: 'Anika Rao', eta: '12 min', status: 'On Time' },
  { id: 'TRP-2047', route: 'West Freight Link', vehicle: 'TRK-0871', driver: 'Dev Mehta', eta: '28 min', status: 'Delayed' },
  { id: 'TRP-2046', route: 'Central Loop', vehicle: 'BUS-1039', driver: 'Farah Khan', eta: 'Arrived', status: 'Complete' },
  { id: 'TRP-2045', route: 'North Depot Feeder', vehicle: 'VAN-0432', driver: 'Rohan Iyer', eta: '19 min', status: 'On Time' },
];

const alerts = [
  { icon: 'warning', title: 'Route congestion detected', detail: 'West Freight Link average speed down 18%.', tone: 'amber' },
  { icon: 'tire_repair', title: 'Maintenance threshold reached', detail: 'BUS-1188 due for brake inspection today.', tone: 'red' },
  { icon: 'check_circle', title: 'Depot dispatch normalized', detail: 'Central Depot queue is back under SLA.', tone: 'green' },
];

const maintenance = [
  { vehicle: 'BUS-1188', task: 'Brake inspection', window: '09:30 - 11:00', priority: 'High' },
  { vehicle: 'TRK-0871', task: 'Tire rotation', window: '12:00 - 13:30', priority: 'Medium' },
  { vehicle: 'VAN-0432', task: 'Battery health check', window: '15:00 - 16:00', priority: 'Low' },
];

const typeDistribution = [
  { label: 'Buses', value: 46, color: '#fbbf24' },
  { label: 'Trucks', value: 28, color: '#38bdf8' },
  { label: 'Vans', value: 18, color: '#22c55e' },
  { label: 'Service', value: 8, color: '#f87171' },
];

const utilizationPoints = [62, 66, 71, 68, 74, 79, 77, 82, 85, 83, 88, 91];

const tones = {
  amber: { color: '#fbbf24', bg: 'rgba(245,158,11,0.13)' },
  blue: { color: '#7dd3fc', bg: 'rgba(56,189,248,0.13)' },
  green: { color: '#86efac', bg: 'rgba(34,197,94,0.13)' },
  red: { color: '#fca5a5', bg: 'rgba(239,68,68,0.13)' },
};

function Sparkline({ trend, tone }) {
  return (
    <svg className="fleet-spark" viewBox="0 0 44 28" aria-hidden="true">
      <path d={sparkPaths[trend]} fill="none" stroke={tones[tone].color} strokeWidth="3" strokeLinecap="round" />
      <path d={`${sparkPaths[trend]} L42 28 L2 28 Z`} fill={tones[tone].color} opacity="0.10" />
    </svg>
  );
}

function KpiCard({ item }) {
  const tone = tones[item.tone];
  return (
    <article className="fleet-kpi transit-panel">
      <div className="fleet-kpi-top">
        <div className="fleet-icon" style={{ background: tone.bg, color: tone.color }}>
          <span className="material-symbols-outlined">{item.icon}</span>
        </div>
        <Sparkline trend={item.trend} tone={item.tone} />
      </div>
      <p className="transit-kicker">{item.label}</p>
      <div className="fleet-kpi-value-row">
        <strong>{item.value}</strong>
        <span style={{ color: tone.color }}>{item.change}</span>
      </div>
    </article>
  );
}

function FleetLineChart() {
  const points = utilizationPoints.map((value, index) => {
    const x = 28 + index * 58;
    const y = 220 - ((value - 55) / 40) * 170;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="transit-panel fleet-chart-card">
      <div className="fleet-panel-head">
        <div>
          <h3>Fleet Utilization Line Chart</h3>
          <p>Hourly utilization across active vehicles</p>
        </div>
        <span className="transit-chip"><span className="fleet-live-dot" /> Live</span>
      </div>
      <svg className="fleet-line-chart" viewBox="0 0 700 260" role="img" aria-label="Fleet utilization line chart">
        {[0, 1, 2, 3].map(row => <line key={row} x1="24" x2="676" y1={48 + row * 50} y2={48 + row * 50} />)}
        <polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={`${points} 666,232 28,232`} fill="rgba(251,191,36,0.10)" stroke="none" />
        {points.split(' ').map(point => {
          const [x, y] = point.split(',');
          return <circle key={point} cx={x} cy={y} r="5" />;
        })}
        {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00'].map((label, index) => <text key={label} x={38 + index * 120} y="250">{label}</text>)}
      </svg>
    </div>
  );
}

function DonutChart() {
  return (
    <div className="transit-panel fleet-donut-card">
      <div className="fleet-panel-head compact">
        <div><h3>Vehicle Type Distribution</h3><p>Fleet mix by operational class</p></div>
      </div>
      <div className="donut-wrap">
        <div className="donut" />
        <div className="donut-center"><strong>480</strong><span>Total Fleet</span></div>
      </div>
      <div className="donut-legend">
        {typeDistribution.map(item => (
          <div key={item.label}><span style={{ background: item.color }} /><p>{item.label}</p><strong>{item.value}%</strong></div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'On Time': 'badge badge-active',
    Complete: 'badge badge-approved',
    Delayed: 'badge badge-overdue',
  };
  return <span className={map[status] || 'badge badge-draft'}>{status}</span>;
}

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Fleet Dashboard">
      <div className="fleet-dashboard max-w-[1480px] mx-auto space-y-6">
        <section className="fleet-hero">
          <div>
            <p className="transit-eyebrow mb-3">Smart Transport Operations Platform</p>
            <h1>Good Morning Fleet Manager 👋</h1>
            <p>Here is your live operational picture across fleet availability, active trips, utilization, maintenance, and cost control.</p>
          </div>
          <div className="fleet-hero-actions">
            <button className="transit-btn"><span className="material-symbols-outlined">calendar_today</span>Today</button>
            <button className="transit-btn transit-btn-primary" onClick={() => navigate('/reports')}><span className="material-symbols-outlined">download</span>Export Report</button>
          </div>
        </section>

        <section className="fleet-kpi-grid">
          {kpis.map(item => <KpiCard key={item.label} item={item} />)}
        </section>

        <section className="fleet-main-grid">
          <FleetLineChart />

          <div className="transit-panel fleet-trips-card">
            <div className="fleet-panel-head">
              <div><h3>Recent Trips</h3><p>Latest high-priority trip movements</p></div>
              <button className="transit-btn">View All</button>
            </div>
            <div className="fleet-trip-list">
              {trips.map(trip => (
                <div key={trip.id} className="fleet-trip-row">
                  <div className="fleet-trip-icon"><span className="material-symbols-outlined">route</span></div>
                  <div className="fleet-trip-main">
                    <strong>{trip.route}</strong>
                    <span>{trip.id} · {trip.vehicle} · {trip.driver}</span>
                  </div>
                  <div className="fleet-trip-meta"><span>{trip.eta}</span><StatusBadge status={trip.status} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="transit-panel fleet-cost-card">
            <div className="fleet-panel-head compact"><div><h3>Operational Cost Summary</h3><p>Today versus daily budget</p></div></div>
            <div className="fleet-cost-total">₹18.4L <span>+5.8%</span></div>
            <div className="cost-bars">
              {[['Fuel', 62, '#fbbf24'], ['Maintenance', 24, '#38bdf8'], ['Driver Ops', 44, '#22c55e'], ['Tolls', 18, '#f87171']].map(([label, pct, color]) => (
                <div key={label}>
                  <div><span>{label}</span><strong>{pct}%</strong></div>
                  <i><b style={{ width: `${pct}%`, background: color }} /></i>
                </div>
              ))}
            </div>
          </div>

          <DonutChart />

          <div className="transit-panel fleet-alert-card">
            <div className="fleet-panel-head compact"><div><h3>Alerts & Notifications</h3><p>Actionable operational events</p></div></div>
            <div className="fleet-alert-list">
              {alerts.map(alert => (
                <div key={alert.title} className={`fleet-alert ${alert.tone}`}>
                  <span className="material-symbols-outlined">{alert.icon}</span>
                  <div><strong>{alert.title}</strong><p>{alert.detail}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="transit-panel fleet-maint-card">
            <div className="fleet-panel-head compact"><div><h3>Today's Maintenance</h3><p>Scheduled service windows</p></div></div>
            <div className="maintenance-list">
              {maintenance.map(item => (
                <div key={item.vehicle}>
                  <div><strong>{item.vehicle}</strong><span>{item.task}</span></div>
                  <p>{item.window}</p>
                  <em className={item.priority.toLowerCase()}>{item.priority}</em>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .fleet-hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; padding: 26px 28px; border-radius: 16px; background: linear-gradient(135deg, rgba(17,24,39,.92), rgba(15,23,42,.78)), radial-gradient(circle at 85% 20%, rgba(245,158,11,.18), transparent 30%); border: 1px solid rgba(148,163,184,.16); box-shadow: var(--shadow); }
        .fleet-hero h1 { margin: 0; color: #fff; font-size: clamp(30px, 4vw, 44px); line-height: 1.05; font-weight: 950; }
        .fleet-hero p { margin: 12px 0 0; max-width: 720px; color: #94a3b8; font-size: 15px; line-height: 1.65; }
        .fleet-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .fleet-kpi-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; }
        .fleet-kpi { padding: 18px; min-height: 168px; }
        .fleet-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .fleet-icon { width: 44px; height: 44px; border-radius: 15px; display: grid; place-items: center; }
        .fleet-icon span { font-size: 23px; font-variation-settings: 'FILL' 1; }
        .fleet-spark { width: 58px; height: 34px; flex-shrink: 0; }
        .fleet-kpi-value-row { display: flex; align-items: end; justify-content: space-between; gap: 10px; margin-top: 8px; }
        .fleet-kpi-value-row strong { color: #fff; font-size: 30px; line-height: 1; font-weight: 950; }
        .fleet-kpi-value-row span { font-size: 12px; font-weight: 900; }
        .fleet-main-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 18px; }
        .fleet-chart-card { grid-column: span 8; padding: 20px; min-height: 390px; }
        .fleet-trips-card { grid-column: span 4; padding: 20px; }
        .fleet-cost-card, .fleet-donut-card, .fleet-alert-card, .fleet-maint-card { grid-column: span 3; padding: 20px; }
        .fleet-panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .fleet-panel-head.compact { margin-bottom: 18px; }
        .fleet-panel-head h3 { margin: 0; color: #fff; font-size: 16px; font-weight: 900; }
        .fleet-panel-head p { margin: 4px 0 0; color: #94a3b8; font-size: 12px; font-weight: 700; }
        .fleet-live-dot { width: 8px; height: 8px; border-radius: 999px; background: #22c55e; }
        .fleet-line-chart { width: 100%; height: 292px; display: block; }
        .fleet-line-chart line { stroke: rgba(148,163,184,.13); stroke-width: 1; }
        .fleet-line-chart circle { fill: #111827; stroke: #fbbf24; stroke-width: 3; }
        .fleet-line-chart text { fill: #64748b; font-size: 12px; font-weight: 700; }
        .fleet-trip-list, .fleet-alert-list, .maintenance-list { display: flex; flex-direction: column; gap: 12px; }
        .fleet-trip-row { display: grid; grid-template-columns: 42px 1fr auto; gap: 12px; align-items: center; padding: 13px; border-radius: 16px; background: rgba(15,23,42,.58); border: 1px solid rgba(148,163,184,.12); }
        .fleet-trip-icon { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; background: rgba(245,158,11,.12); color: #fbbf24; }
        .fleet-trip-icon span { font-size: 21px; }
        .fleet-trip-main strong { display: block; color: #fff; font-size: 13px; }
        .fleet-trip-main span, .fleet-trip-meta span { color: #94a3b8; font-size: 12px; font-weight: 700; }
        .fleet-trip-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; }
        .fleet-cost-total { color: #fff; font-size: 32px; font-weight: 950; line-height: 1; margin-bottom: 20px; }
        .fleet-cost-total span { color: #86efac; font-size: 13px; margin-left: 8px; }
        .cost-bars { display: flex; flex-direction: column; gap: 14px; }
        .cost-bars div div { display: flex; justify-content: space-between; color: #cbd5e1; font-size: 12px; font-weight: 800; margin-bottom: 6px; }
        .cost-bars i { display: block; height: 9px; border-radius: 999px; overflow: hidden; background: rgba(148,163,184,.13); }
        .cost-bars b { display: block; height: 100%; border-radius: 999px; }
        .donut-wrap { position: relative; width: 180px; height: 180px; margin: 2px auto 18px; }
        .donut { width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(#fbbf24 0 46%, #38bdf8 46% 74%, #22c55e 74% 92%, #f87171 92% 100%); box-shadow: inset 0 0 0 24px rgba(15,23,42,.95), 0 20px 50px rgba(0,0,0,.28); }
        .donut-center { position: absolute; inset: 46px; border-radius: 50%; display: grid; place-items: center; align-content: center; background: rgba(17,24,39,.94); }
        .donut-center strong { color: #fff; font-size: 24px; line-height: 1; }
        .donut-center span { color: #94a3b8; font-size: 11px; font-weight: 800; margin-top: 4px; }
        .donut-legend { display: grid; gap: 9px; }
        .donut-legend div { display: grid; grid-template-columns: 10px 1fr auto; align-items: center; gap: 9px; color: #cbd5e1; font-size: 12px; font-weight: 800; }
        .donut-legend span { width: 10px; height: 10px; border-radius: 999px; }
        .donut-legend p { margin: 0; color: #cbd5e1; }
        .donut-legend strong { color: #fff; }
        .fleet-alert { display: grid; grid-template-columns: 38px 1fr; gap: 12px; padding: 13px; border-radius: 16px; border: 1px solid rgba(148,163,184,.12); background: rgba(15,23,42,.58); }
        .fleet-alert > span { width: 38px; height: 38px; border-radius: 13px; display: grid; place-items: center; font-size: 20px; }
        .fleet-alert.amber > span { color: #fbbf24; background: rgba(245,158,11,.12); }
        .fleet-alert.red > span { color: #fca5a5; background: rgba(239,68,68,.12); }
        .fleet-alert.green > span { color: #86efac; background: rgba(34,197,94,.12); }
        .fleet-alert strong { display: block; color: #fff; font-size: 13px; }
        .fleet-alert p { margin: 4px 0 0; color: #94a3b8; font-size: 12px; line-height: 1.45; }
        .maintenance-list > div { position: relative; padding: 13px 72px 13px 13px; border-radius: 16px; border: 1px solid rgba(148,163,184,.12); background: rgba(15,23,42,.58); }
        .maintenance-list strong { display: block; color: #fff; font-size: 13px; }
        .maintenance-list span { color: #94a3b8; font-size: 12px; font-weight: 700; }
        .maintenance-list p { margin: 8px 0 0; color: #cbd5e1; font-size: 12px; font-weight: 800; }
        .maintenance-list em { position: absolute; right: 12px; top: 13px; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-style: normal; font-weight: 900; }
        .maintenance-list em.high { color: #fca5a5; background: rgba(239,68,68,.13); }
        .maintenance-list em.medium { color: #fbbf24; background: rgba(245,158,11,.13); }
        .maintenance-list em.low { color: #86efac; background: rgba(34,197,94,.13); }
        @media (max-width: 1400px) { .fleet-kpi-grid { grid-template-columns: repeat(3, 1fr); } .fleet-chart-card, .fleet-trips-card { grid-column: span 12; } .fleet-cost-card, .fleet-donut-card, .fleet-alert-card, .fleet-maint-card { grid-column: span 6; } }
        @media (max-width: 800px) { .fleet-hero { align-items: flex-start; flex-direction: column; } .fleet-kpi-grid { grid-template-columns: 1fr; } .fleet-cost-card, .fleet-donut-card, .fleet-alert-card, .fleet-maint-card { grid-column: span 12; } .fleet-trip-row { grid-template-columns: 42px 1fr; } .fleet-trip-meta { grid-column: 2; align-items: flex-start; } }
      `}</style>
    </Layout>
  );
};

export default Dashboard;
