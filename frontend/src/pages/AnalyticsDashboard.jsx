import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { reportsAPI } from '../api/reports';

const HEAT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEAT_SLOTS = ['06', '09', '12', '15', '18', '21'];
const HEAT_VALUES = [2, 3, 5, 4, 3, 2, 3, 4, 6, 6, 5, 3, 4, 5, 7, 8, 6, 4, 3, 5, 8, 9, 7, 5, 4, 6, 9, 10, 8, 6, 2, 4, 6, 7, 5, 3, 1, 3, 4, 5, 4, 2];

const INSIGHTS = [
  { title: 'North corridor margin improved', meta: '+8.4% route profitability', icon: 'trending_up', tone: 'good' },
  { title: 'Diesel spend variance detected', meta: 'FASTag corridor spend within bounds', icon: 'local_gas_station', tone: 'good' },
  { title: 'Maintenance downtime reduced', meta: 'Downtime metrics synchronized with active work orders', icon: 'engineering', tone: 'good' },
];

const RECOMMENDATIONS = [
  { title: 'Shift dispatches to high-efficiency vehicles', impact: 'Reduce operational cost overhead', confidence: 92 },
  { title: 'Optimize preventive service frequencies', impact: 'Lower overall breakdown probability by 14%', confidence: 84 },
];

function Sparkline({ points }) {
  return <div className="analytics-sparkline">{points.map((point, index) => <i key={index} style={{ height: point + '%' }} />)}</div>;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function AnalyticsDashboard() {
  const [roiData, setRoiData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [roiResponse, statsResponse] = await Promise.all([
          reportsAPI.getVehicleROI(),
          reportsAPI.getDashboard()
        ]);
        setRoiData(roiResponse.reports || []);
        setDashboardStats(statsResponse);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics statistics');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  // Compute stats dynamically
  const metrics = useMemo(() => {
    const reports = roiData;
    const revenueVal = reports.reduce((sum, v) => sum + (v.revenue || 0), 0);
    const costVal = reports.reduce((sum, v) => sum + (v.totalOperationalCost || 0), 0);
    
    const validEff = reports.filter(v => (v.fuelEfficiency || 0) > 0);
    const avgEff = validEff.length 
      ? Number((validEff.reduce((sum, v) => sum + v.fuelEfficiency, 0) / validEff.length).toFixed(2))
      : 0;

    const avgRoi = reports.length
      ? Number((reports.reduce((sum, v) => sum + (v.roi || 0), 0) * 100 / reports.length).toFixed(2))
      : 0;

    return {
      revenue: revenueVal,
      cost: costVal,
      efficiency: avgEff,
      roi: avgRoi
    };
  }, [roiData]);

  const kpis = useMemo(() => {
    return [
      { label: 'Revenue', value: formatCurrency(metrics.revenue), change: '+Live', icon: 'monitoring', tone: 'amber', spark: [22, 34, 28, 46, 44, 62, 76] },
      { label: 'Fuel Efficiency', value: `${metrics.efficiency} km/l`, change: 'Avg', icon: 'local_gas_station', tone: 'green', spark: [42, 45, 43, 52, 58, 56, 64] },
      { label: 'Fleet Utilization', value: `${dashboardStats?.fleetUtilization ?? 0}%`, change: 'Active', icon: 'directions_bus', tone: 'blue', spark: [38, 48, 54, 57, 64, 71, 74] },
      { label: 'Vehicle ROI', value: `${metrics.roi}%`, change: 'Average', icon: 'price_check', tone: 'purple', spark: [30, 34, 36, 44, 41, 52, 57] },
      { label: 'Operational Cost', value: formatCurrency(metrics.cost), change: '-Live', icon: 'payments', tone: 'red', spark: [78, 70, 66, 64, 58, 55, 49] },
    ];
  }, [metrics, dashboardStats]);

  const barData = useMemo(() => {
    const types = ['Bus', 'Truck', 'Van', 'Service'];
    return types.map(type => {
      const count = roiData.filter(v => v.type === type).length;
      const total = roiData.length || 1;
      return {
        label: type,
        value: Math.round((count / total) * 100)
      };
    });
  }, [roiData]);

  const donutData = useMemo(() => {
    const revenueVal = metrics.revenue;
    const costVal = metrics.cost;
    const profitVal = Math.max(0, revenueVal - costVal);
    const total = revenueVal + costVal + profitVal || 1;
    
    return [
      { label: 'Net Profit', value: Math.round((profitVal / total) * 100), color: '#22c55e' },
      { label: 'Operating Cost', value: Math.round((costVal / total) * 100), color: '#ef4444' },
      { label: 'Revenue Gross', value: Math.round((revenueVal / total) * 100), color: '#f59e0b' },
    ];
  }, [metrics]);

  const donutStyle = useMemo(() => {
    const pVal = donutData[0].value;
    const cVal = donutData[1].value;
    // Build gradient sections: Profit, Cost, Gross
    return {
      background: `conic-gradient(#22c55e 0% ${pVal}%, #ef4444 ${pVal}% ${pVal + cVal}%, #f59e0b ${pVal + cVal}% 100%)`
    };
  }, [donutData]);

  const handleExportCSV = async () => {
    try {
      const blob = await reportsAPI.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transitops-roi-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      alert('CSV Exported successfully!');
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  const areaPath = "M 0 68 L 9.1 56 L 18.2 61 L 27.3 42 L 36.4 36 L 45.5 43 L 54.6 28 L 63.7 20 L 72.8 23 L 81.9 12 L 91 8 L 100 3";
  const linePath = "M 0 24 L 9.1 29 L 18.2 21 L 27.3 17 L 36.4 19 L 45.5 12 L 54.6 9 L 63.7 14 L 72.8 6 L 81.9 4 L 91 7 L 100 2";

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel analytics-hero">
          <div className="vehicle-title-block">
            <p className="transit-eyebrow">Business Intelligence</p>
            <h1>Analytics Dashboard</h1>
            <span>Executive visibility into revenue, efficiency, utilization, ROI, and operating cost performance.</span>
          </div>
          <div className="analytics-actions">
            <button type="button" className="transit-btn transit-btn-primary" onClick={handleExportCSV}>
              <span className="material-symbols-outlined">table_view</span>Export CSV
            </button>
          </div>
        </section>

        {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading business intelligence analytics...</p>
          </div>
        ) : (
          <>
            <section className="analytics-kpi-grid">
              {kpis.map(card => (
                <article key={card.label} className={'analytics-kpi-card ' + card.tone}>
                  <div className="analytics-kpi-head"><span className="material-symbols-outlined">{card.icon}</span><small>{card.change}</small></div>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                  <Sparkline points={card.spark} />
                </article>
              ))}
            </section>

            <section className="analytics-chart-grid">
              <article className="transit-panel analytics-chart-card analytics-wide">
                <div className="analytics-card-head"><div><p className="transit-kicker">Revenue Intelligence</p><h2>Area Chart</h2></div><span>+12.4% MoM</span></div>
                <div className="analytics-area-chart">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="area-fill" d={areaPath + ' L 100 100 L 0 100 Z'} /><path className="area-line" d={areaPath} /></svg>
                  <div className="analytics-axis"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div>
                </div>
              </article>

              <article className="transit-panel analytics-chart-card">
                <div className="analytics-card-head"><div><p className="transit-kicker">Efficiency</p><h2>Line Chart</h2></div><span>98 index</span></div>
                <div className="analytics-line-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={linePath} /></svg></div>
              </article>

              <article className="transit-panel analytics-chart-card">
                <div className="analytics-card-head"><div><p className="transit-kicker">Utilization</p><h2>Bar Chart</h2></div><span>By Type</span></div>
                <div className="analytics-bars">{barData.map(item => <div key={item.label}><span style={{ height: item.value + '%' }} /><strong>{item.label}</strong><small>{item.value}%</small></div>)}</div>
              </article>

              <article className="transit-panel analytics-chart-card">
                <div className="analytics-card-head"><div><p className="transit-kicker">Portfolio</p><h2>Donut Chart</h2></div><span>BI Profit/Cost breakdown</span></div>
                <div className="analytics-donut-wrap">
                  <div className="analytics-donut" style={donutStyle}><span>BI</span></div>
                  <div className="analytics-donut-legend">
                    {donutData.map(item => <p key={item.label}><i style={{ background: item.color }} />{item.label}<strong>{item.value}%</strong></p>)}
                  </div>
                </div>
              </article>

              <article className="transit-panel analytics-chart-card analytics-heat-card">
                <div className="analytics-card-head"><div><p className="transit-kicker">Demand Density</p><h2>Heat Map</h2></div><span>Dispatch load</span></div>
                <div className="analytics-heatmap">
                  <div className="heatmap-times">{HEAT_SLOTS.map(slot => <span key={slot}>{slot}</span>)}</div>
                  {HEAT_DAYS.map((day, dayIndex) => <div key={day} className="heatmap-row"><strong>{day}</strong>{HEAT_SLOTS.map((slot, slotIndex) => { const value = HEAT_VALUES[dayIndex * HEAT_SLOTS.length + slotIndex]; return <i key={slot} className={'heat-' + value} title={day + ' ' + slot} />; })}</div>)}
                </div>
              </article>
            </section>

            <section className="analytics-intel-grid">
              <article className="transit-panel analytics-panel">
                <div className="analytics-card-head"><div><p className="transit-kicker">Signals</p><h2>Recent Insights</h2></div><span>Live</span></div>
                <div className="analytics-insight-list">{INSIGHTS.map(item => <div key={item.title} className={'analytics-insight ' + item.tone}><span className="material-symbols-outlined">{item.icon}</span><div><strong>{item.title}</strong><p>{item.meta}</p></div></div>)}</div>
              </article>
              <article className="transit-panel analytics-panel">
                <div className="analytics-card-head"><div><p className="transit-kicker">AI Ops</p><h2>AI Recommendations</h2></div><span>Ranked</span></div>
                <div className="analytics-rec-list">{RECOMMENDATIONS.map(item => <div key={item.title} className="analytics-rec"><div><strong>{item.title}</strong><p>{item.impact}</p></div><span>{item.confidence}%</span></div>)}</div>
              </article>
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}

export default AnalyticsDashboard;
