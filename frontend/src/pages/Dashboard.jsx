import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { reportsAPI } from '../api/reports';
import { tripsAPI } from '../api/trips';

const tones = {
  amber: { color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
  blue:  { color: '#0284c7', bg: 'rgba(56,189,248,0.15)' },
  green: { color: '#16a34a', bg: 'rgba(34,197,94,0.15)' },
  red:   { color: '#dc2626', bg: 'rgba(239,68,68,0.12)' },
};

function KpiCard({ item }) {
  const tone = tones[item.tone];
  return (
    <article className="db-kpi transit-panel">
      <div className="db-kpi-icon" style={{ background: tone.bg, color: tone.color }}>
        <span className="material-symbols-outlined">{item.icon}</span>
      </div>
      <div className="db-kpi-body">
        <p className="db-kpi-label">{item.label}</p>
        <strong className="db-kpi-value">{item.value}</strong>
        <span className="db-kpi-sub">{item.sub}</span>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const map = { 
    Draft: 'badge badge-draft', 
    Dispatched: 'badge badge-pending', 
    Completed: 'badge badge-approved', 
    Cancelled: 'badge badge-overdue' 
  };
  return <span className={map[status] || 'badge badge-draft'}>{status}</span>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, tripsResponse] = await Promise.all([
          reportsAPI.getDashboard(),
          tripsAPI.getAll()
        ]);
        setStats(statsData);
        setRecentTrips((tripsResponse.trips || []).slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const kpis = useMemo(() => {
    return [
      { 
        label: 'Active Vehicles', 
        value: stats?.activeVehicles ?? '0', 
        sub: `${stats?.availableVehicles ?? '0'} available`, 
        icon: 'directions_bus', 
        tone: 'blue' 
      },
      { 
        label: 'Active Trips', 
        value: stats?.activeTrips ?? '0', 
        sub: `${stats?.pendingTrips ?? '0'} pending dispatches`, 
        icon: 'route', 
        tone: 'green' 
      },
      { 
        label: 'Fleet Utilization', 
        value: `${stats?.fleetUtilization ?? '0'}%`, 
        sub: `${stats?.meta?.nonRetiredVehicles ?? '0'} active fleet`, 
        icon: 'monitoring', 
        tone: 'amber' 
      },
      { 
        label: 'In Maintenance', 
        value: stats?.vehiclesInMaintenance ?? '0', 
        sub: 'Currently in shop', 
        icon: 'build_circle', 
        tone: 'red' 
      },
    ];
  }, [stats]);

  const alerts = useMemo(() => {
    const list = [];
    if (stats?.vehiclesInMaintenance > 0) {
      list.push({
        icon: 'build_circle',
        title: 'Vehicles in service bay',
        detail: `${stats.vehiclesInMaintenance} vehicle(s) currently marked In Shop for active maintenance.`,
        tone: 'red'
      });
    }
    if (stats?.pendingTrips > 0) {
      list.push({
        icon: 'schedule',
        title: 'Awaiting dispatches',
        detail: `${stats.pendingTrips} trip(s) in Draft status ready for fleet coordination.`,
        tone: 'amber'
      });
    }
    list.push({
      icon: 'check_circle',
      title: 'Fleet health normalized',
      detail: `Total registered roster: ${stats?.meta?.totalDrivers ?? 0} driver(s) and ${stats?.meta?.totalVehicles ?? 0} vehicle(s).`,
      tone: 'green'
    });
    return list;
  }, [stats]);

  return (
    <Layout title="Dashboard">
      <div className="db-root">
        {/* Hero */}
        <section className="db-hero transit-panel">
          <div>
            <p className="transit-eyebrow mb-2">Smart Transport Operations</p>
            <h1 className="db-hero-title">Good Morning, Fleet Coordinator 👋</h1>
            <p className="db-hero-sub">Live operational picture — fleet, trips, utilization &amp; alerts.</p>
          </div>
          <div className="db-hero-actions">
            <button className="transit-btn transit-btn-primary" onClick={() => navigate('/analytics')}>
              <span className="material-symbols-outlined">insights</span>View Analytics
            </button>
          </div>
        </section>

        {error && <div className="auth-error" role="alert" style={{ marginBottom: '24px' }}><span className="material-symbols-outlined">error</span>{error}</div>}

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading dashboard telemetry...</p>
          </div>
        ) : (
          <>
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
                  {recentTrips.map(trip => (
                    <div key={trip._id} className="db-trip-row">
                      <div className="db-trip-icon">
                        <span className="material-symbols-outlined">route</span>
                      </div>
                      <div className="db-trip-main">
                        <strong>{trip.source} to {trip.destination}</strong>
                        <span>{trip.vehicleId?.registrationNumber || 'Unassigned'} · {trip.driverId?.name || 'Unassigned'}</span>
                      </div>
                      <div className="db-trip-meta">
                        <span>{trip.plannedDistance} km</span>
                        <StatusBadge status={trip.status} />
                      </div>
                    </div>
                  ))}
                  {recentTrips.length === 0 && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 0' }}>No recent trips logged.</p>
                  )}
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
          </>
        )}
      </div>

      <style>{`
        .db-root { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

        /* Hero */
        .db-hero {
          display: flex; justify-content: space-between; align-items: center;
          gap: 20px; padding: 24px 28px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
        }
        .db-hero-title { margin: 6px 0 0; color: var(--text-primary); font-size: clamp(26px, 3vw, 38px); font-weight: 700; line-height: 1.1; }
        .db-hero-sub   { margin: 6px 0 0; color: var(--text-secondary); font-size: 15px; line-height: 1.55; }
        .db-hero-actions { flex-shrink: 0; }

        /* KPI */
        .db-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .db-kpi { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .db-kpi-icon { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; flex-shrink: 0; }
        .db-kpi-icon span { font-size: 24px; font-variation-settings: 'FILL' 1; }
        .db-kpi-body { min-width: 0; }
        .db-kpi-label { margin: 0; color: var(--text-muted); font-size: 13px; font-weight: 600; }
        .db-kpi-value { display: block; color: var(--text-primary); font-size: 36px; font-weight: 700; line-height: 1.1; margin: 4px 0 2px; }
        .db-kpi-sub   { color: var(--text-muted); font-size: 12px; font-weight: 600; }

        /* Grid */
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .db-card { padding: 22px; }
        .db-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
        .db-card-head h3 { margin: 0; color: var(--text-primary); font-size: 17px; font-weight: 600; }
        .db-card-head p  { margin: 3px 0 0; color: var(--text-muted); font-size: 13px; font-weight: 600; }

        /* Trips */
        .db-trip-list { display: flex; flex-direction: column; gap: 10px; }
        .db-trip-row { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center; padding: 12px; border-radius: var(--radius-md); background: var(--bg-surface-solid); border: 1px solid var(--border-subtle); color: var(--text-primary); }
        .db-trip-icon { width: 40px; height: 40px; border-radius: 13px; display: grid; place-items: center; background: rgba(99, 102, 241, 0.12); color: var(--brand-primary); }
        .db-trip-icon span { font-size: 20px; }
        .db-trip-main strong { display: block; color: var(--text-primary); font-size: 14px; font-weight: 600; }
        .db-trip-main span  { color: var(--text-muted); font-size: 12px; font-weight: 500; }
        .db-trip-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .db-trip-meta span { color: var(--text-muted); font-size: 12px; font-weight: 500; }

        /* Alerts */
        .db-alert-list { display: flex; flex-direction: column; gap: 10px; }
        .db-alert { display: grid; grid-template-columns: 38px 1fr; gap: 12px; padding: 13px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-surface-solid); align-items: start; color: var(--text-primary); }
        .db-alert > span { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; font-variation-settings: 'FILL' 1; }
        .db-alert.amber > span { color: var(--status-pending-text); background: var(--status-pending-bg); }
        .db-alert.red   > span { color: var(--status-blocked-text); background: var(--status-blocked-bg); }
        .db-alert.green > span { color: var(--status-available-text); background: var(--status-available-bg); }
        .db-alert strong { display: block; color: var(--text-primary); font-size: 14px; font-weight: 600; }
        .db-alert p { margin: 3px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.45; }

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
