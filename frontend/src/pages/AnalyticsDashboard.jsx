import Layout from '../components/Layout';

const KPI_CARDS = [
  { label: 'Revenue', value: 'Rs 42.8M', change: '+12.4%', icon: 'monitoring', tone: 'amber', spark: [22, 34, 28, 46, 44, 62, 76] },
  { label: 'Fuel Efficiency', value: '6.1 km/l', change: '+4.8%', icon: 'local_gas_station', tone: 'green', spark: [42, 45, 43, 52, 58, 56, 64] },
  { label: 'Fleet Utilization', value: '87.6%', change: '+6.2%', icon: 'directions_bus', tone: 'blue', spark: [38, 48, 54, 57, 64, 71, 74] },
  { label: 'Vehicle ROI', value: '31.2%', change: '+3.1%', icon: 'price_check', tone: 'purple', spark: [30, 34, 36, 44, 41, 52, 57] },
  { label: 'Operational Cost', value: 'Rs 9.6M', change: '-2.7%', icon: 'payments', tone: 'red', spark: [78, 70, 66, 64, 58, 55, 49] },
];

const AREA_POINTS = [32, 44, 39, 58, 64, 57, 72, 80, 77, 88, 92, 97];
const LINE_POINTS = [76, 71, 79, 83, 81, 88, 91, 86, 94, 96, 93, 98];
const BAR_DATA = [
  { label: 'Bus', value: 82 },
  { label: 'Truck', value: 76 },
  { label: 'Van', value: 58 },
  { label: 'Service', value: 42 },
  { label: 'EV', value: 64 },
];
const DONUT_DATA = [
  { label: 'Revenue', value: 48, color: '#f59e0b' },
  { label: 'Fuel', value: 22, color: '#38bdf8' },
  { label: 'Maintenance', value: 18, color: '#22c55e' },
  { label: 'Risk', value: 12, color: '#ef4444' },
];
const HEAT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEAT_SLOTS = ['06', '09', '12', '15', '18', '21'];
const HEAT_VALUES = [2, 3, 5, 4, 3, 2, 3, 4, 6, 6, 5, 3, 4, 5, 7, 8, 6, 4, 3, 5, 8, 9, 7, 5, 4, 6, 9, 10, 8, 6, 2, 4, 6, 7, 5, 3, 1, 3, 4, 5, 4, 2];

const INSIGHTS = [
  { title: 'North corridor margin improved', meta: '+8.4% route profitability', icon: 'trending_up', tone: 'good' },
  { title: 'Diesel spend variance detected', meta: 'Rs 1.2M above weekly baseline', icon: 'local_gas_station', tone: 'warn' },
  { title: 'Maintenance downtime reduced', meta: '17 fewer unavailable vehicle-hours', icon: 'engineering', tone: 'good' },
  { title: 'Peak dispatch congestion', meta: 'Thu 15:00-18:00 load exceeds target', icon: 'traffic', tone: 'info' },
];

const RECOMMENDATIONS = [
  { title: 'Shift 12 Pune-Mumbai trips to high-mileage trucks', impact: 'Projected monthly saving Rs 4.8L', confidence: 92 },
  { title: 'Pre-book toll corridors for western freight lanes', impact: 'Reduce dwell time by 11%', confidence: 88 },
  { title: 'Increase preventive service on buses over 75k km', impact: 'Lower breakdown probability by 14%', confidence: 84 },
];

function Sparkline({ points }) {
  return <div className="analytics-sparkline">{points.map((point, index) => <i key={index} style={{ height: point + '%' }} />)}</div>;
}

function AnalyticsDashboard() {
  const areaPath = AREA_POINTS.map((point, index) => (index === 0 ? 'M ' : 'L ') + (index * 9.1) + ' ' + (100 - point)).join(' ');
  const linePath = LINE_POINTS.map((point, index) => (index === 0 ? 'M ' : 'L ') + (index * 9.1) + ' ' + (100 - point)).join(' ');
  const donutStyle = { background: 'conic-gradient(#f59e0b 0 48%, #38bdf8 48% 70%, #22c55e 70% 88%, #ef4444 88% 100%)' };

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
            <button type="button" className="transit-btn"><span className="material-symbols-outlined">picture_as_pdf</span>Export PDF</button>
            <button type="button" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">table_view</span>Export CSV</button>
          </div>
        </section>

        <section className="analytics-kpi-grid">
          {KPI_CARDS.map(card => <article key={card.label} className={'analytics-kpi-card ' + card.tone}>
            <div className="analytics-kpi-head"><span className="material-symbols-outlined">{card.icon}</span><small>{card.change}</small></div>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <Sparkline points={card.spark} />
          </article>)}
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
            <div className="analytics-card-head"><div><p className="transit-kicker">Utilization</p><h2>Bar Chart</h2></div><span>By fleet</span></div>
            <div className="analytics-bars">{BAR_DATA.map(item => <div key={item.label}><span style={{ height: item.value + '%' }} /><strong>{item.label}</strong><small>{item.value}%</small></div>)}</div>
          </article>

          <article className="transit-panel analytics-chart-card">
            <div className="analytics-card-head"><div><p className="transit-kicker">Portfolio</p><h2>Donut Chart</h2></div><span>4 signals</span></div>
            <div className="analytics-donut-wrap"><div className="analytics-donut" style={donutStyle}><span>BI</span></div><div className="analytics-donut-legend">{DONUT_DATA.map(item => <p key={item.label}><i style={{ background: item.color }} />{item.label}<strong>{item.value}%</strong></p>)}</div></div>
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
      </main>
    </Layout>
  );
}

export default AnalyticsDashboard;
