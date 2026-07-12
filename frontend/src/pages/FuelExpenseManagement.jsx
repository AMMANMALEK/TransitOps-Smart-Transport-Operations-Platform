import { useMemo, useState } from 'react';
import Layout from '../components/Layout';

const VEHICLES = ['All Vehicles', 'KA-01-TX-2048', 'MH-12-FL-7781', 'DL-09-UR-1188', 'TN-22-LG-0432', 'GJ-05-RT-3904', 'TS-07-MB-6201'];
const DATE_FILTERS = ['Today', 'Last 7 Days', 'This Month', 'Last Month', 'Quarter to Date'];
const EXPENSE_TYPES = ['Fuel', 'Tolls', 'Repair', 'Maintenance', 'Insurance'];

const INITIAL_EXPENSES = [
  { id: 'EXP-9041', date: 'Jul 12, 2026', vehicle: 'KA-01-TX-2048', type: 'Fuel', vendor: 'Shell Fleet Card', litres: 168, mileage: 5.8, amount: 18480, status: 'Settled' },
  { id: 'EXP-9040', date: 'Jul 12, 2026', vehicle: 'MH-12-FL-7781', type: 'Tolls', vendor: 'FASTag Corridor', litres: 0, mileage: 0, amount: 4280, status: 'Pending' },
  { id: 'EXP-9039', date: 'Jul 11, 2026', vehicle: 'DL-09-UR-1188', type: 'Repair', vendor: 'Metro Service Bay', litres: 0, mileage: 0, amount: 48500, status: 'Approved' },
  { id: 'EXP-9038', date: 'Jul 10, 2026', vehicle: 'TN-22-LG-0432', type: 'Maintenance', vendor: 'TransitOps Workshop', litres: 0, mileage: 0, amount: 18200, status: 'Settled' },
  { id: 'EXP-9037', date: 'Jul 09, 2026', vehicle: 'GJ-05-RT-3904', type: 'Fuel', vendor: 'HP Fleet Fuel', litres: 142, mileage: 6.2, amount: 15620, status: 'Settled' },
  { id: 'EXP-9036', date: 'Jul 08, 2026', vehicle: 'TS-07-MB-6201', type: 'Insurance', vendor: 'National Fleet Cover', litres: 0, mileage: 0, amount: 64200, status: 'Approved' },
  { id: 'EXP-9035', date: 'Jul 07, 2026', vehicle: 'MH-12-FL-7781', type: 'Fuel', vendor: 'Reliance Fleet', litres: 196, mileage: 5.4, amount: 21560, status: 'Settled' },
];

const MONTHLY_SPEND = [
  { label: 'Feb', value: 282000 },
  { label: 'Mar', value: 318000 },
  { label: 'Apr', value: 296000 },
  { label: 'May', value: 352000 },
  { label: 'Jun', value: 338000 },
  { label: 'Jul', value: 391000 },
];

const typeConfig = {
  Fuel: { cls: 'expense-badge fuel', icon: 'local_gas_station', color: '#f59e0b' },
  Tolls: { cls: 'expense-badge tolls', icon: 'toll', color: '#38bdf8' },
  Repair: { cls: 'expense-badge repair', icon: 'build_circle', color: '#ef4444' },
  Maintenance: { cls: 'expense-badge maintenance-exp', icon: 'engineering', color: '#22c55e' },
  Insurance: { cls: 'expense-badge insurance', icon: 'verified_user', color: '#a78bfa' },
};

const statusConfig = {
  Settled: 'finance-status settled',
  Pending: 'finance-status pending',
  Approved: 'finance-status approved',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function ExpenseBadge({ type }) {
  const cfg = typeConfig[type] || typeConfig.Fuel;
  return <span className={cfg.cls}><span className="material-symbols-outlined">{cfg.icon}</span>{type}</span>;
}

function FinanceStatus({ status }) {
  return <span className={statusConfig[status] || statusConfig.Pending}>{status}</span>;
}

function AddExpenseDrawer({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ vehicle: 'KA-01-TX-2048', type: 'Fuel', vendor: '', litres: 120, mileage: 5.6, amount: 15000, status: 'Pending' });
  if (!open) return null;
  const set = field => event => setForm(prev => ({ ...prev, [field]: ['litres', 'mileage', 'amount'].includes(field) ? Number(event.target.value) : event.target.value }));
  const submit = event => {
    event.preventDefault();
    onAdd({ ...form, id: 'EXP-' + Date.now().toString().slice(-4), date: 'Jul 12, 2026' });
    setForm({ vehicle: 'KA-01-TX-2048', type: 'Fuel', vendor: '', litres: 120, mileage: 5.6, amount: 15000, status: 'Pending' });
  };
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Add expense" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head"><div><p className="transit-kicker">Finance Control</p><h2>Add Expense</h2></div><button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button></div>
        <form onSubmit={submit} className="drawer-form">
          <label>Vehicle<select value={form.vehicle} onChange={set('vehicle')}>{VEHICLES.slice(1).map(item => <option key={item}>{item}</option>)}</select></label>
          <div className="drawer-grid"><label>Expense Type<select value={form.type} onChange={set('type')}>{EXPENSE_TYPES.map(item => <option key={item}>{item}</option>)}</select></label><label>Status<select value={form.status} onChange={set('status')}>{['Pending', 'Approved', 'Settled'].map(item => <option key={item}>{item}</option>)}</select></label></div>
          <label>Vendor<input required value={form.vendor} onChange={set('vendor')} placeholder="Fuel station, toll provider, insurer" /></label>
          <div className="drawer-grid"><label>Fuel Litres<input type="number" min="0" value={form.litres} onChange={set('litres')} /></label><label>Average Mileage<input type="number" min="0" step="0.1" value={form.mileage} onChange={set('mileage')} /></label></div>
          <label>Amount<input type="number" min="0" value={form.amount} onChange={set('amount')} /></label>
          <div className="drawer-actions"><button type="button" className="transit-btn" onClick={onClose}>Cancel</button><button type="submit" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">add_card</span>Add Expense</button></div>
        </form>
      </aside>
    </div>
  );
}

const FuelExpenseManagement = () => {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [dateFilter, setDateFilter] = useState('This Month');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredExpenses = useMemo(() => expenses.filter(item => vehicleFilter === 'All Vehicles' || item.vehicle === vehicleFilter), [expenses, vehicleFilter]);
  const total = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const todayFuel = filteredExpenses.filter(item => item.date === 'Jul 12, 2026' && item.type === 'Fuel').reduce((sum, item) => sum + item.amount, 0);
  const fuelTotal = filteredExpenses.filter(item => item.type === 'Fuel').reduce((sum, item) => sum + item.amount, 0);
  const mileageItems = filteredExpenses.filter(item => item.mileage > 0);
  const avgMileage = mileageItems.length ? mileageItems.reduce((sum, item) => sum + item.mileage, 0) / mileageItems.length : 0;
  const breakdown = EXPENSE_TYPES.map(type => ({ type, amount: filteredExpenses.filter(item => item.type === type).reduce((sum, item) => sum + item.amount, 0) }));
  const maxMonth = Math.max(...MONTHLY_SPEND.map(item => item.value));

  const pieStyle = {
    background: 'conic-gradient(#f59e0b 0 33%, #38bdf8 33% 41%, #ef4444 41% 61%, #22c55e 61% 73%, #a78bfa 73% 100%)',
  };

  const addExpense = expense => {
    setExpenses(prev => [expense, ...prev]);
    setDrawerOpen(false);
  };

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel finance-toolbar">
          <div className="vehicle-title-block"><p className="transit-eyebrow">Cost Operations</p><h1>Fuel & Expense Management</h1><span>Track fuel, tolls, repair, maintenance, and insurance costs across the transport network.</span></div>
          <div className="vehicle-controls finance-controls">
            <select value={dateFilter} onChange={event => setDateFilter(event.target.value)} aria-label="Date filter">{DATE_FILTERS.map(item => <option key={item}>{item}</option>)}</select>
            <select value={vehicleFilter} onChange={event => setVehicleFilter(event.target.value)} aria-label="Vehicle filter">{VEHICLES.map(item => <option key={item}>{item}</option>)}</select>
            <button type="button" className="transit-btn"><span className="material-symbols-outlined">download</span>Export</button>
            <button type="button" className="transit-btn transit-btn-primary" onClick={() => setDrawerOpen(true)}><span className="material-symbols-outlined">add_card</span>Add Expense</button>
          </div>
        </section>

        <section className="finance-layout">
          <div className="finance-main">
            <section className="fuel-summary-grid">
              <div className="finance-kpi-card"><span className="material-symbols-outlined">local_gas_station</span><p>Today's Fuel Cost</p><strong>{formatCurrency(todayFuel)}</strong><small>Live fleet card spend</small></div>
              <div className="finance-kpi-card"><span className="material-symbols-outlined">calendar_month</span><p>Monthly Fuel Cost</p><strong>{formatCurrency(fuelTotal)}</strong><small>{dateFilter}</small></div>
              <div className="finance-kpi-card"><span className="material-symbols-outlined">speed</span><p>Average Mileage</p><strong>{avgMileage.toFixed(1)} km/l</strong><small>Across fueled vehicles</small></div>
              <div className="finance-kpi-card"><span className="material-symbols-outlined">payments</span><p>Operational Cost</p><strong>{formatCurrency(total)}</strong><small>Filtered expense total</small></div>
            </section>

            <section className="transit-panel finance-table-card">
              <div className="driver-table-head"><div><p className="transit-kicker">Expense Ledger</p><h2>Fuel, tolls, repair, maintenance, insurance</h2></div><span>{filteredExpenses.length} transactions</span></div>
              <div className="vehicle-table-wrap">
                <table className="vehicle-table finance-table">
                  <thead><tr><th>Expense</th><th>Date</th><th>Vehicle</th><th>Vendor</th><th>Fuel</th><th>Mileage</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{filteredExpenses.map(item => <tr key={item.id}>
                    <td><div className="finance-expense-cell"><ExpenseBadge type={item.type} /><span>{item.id}</span></div></td>
                    <td>{item.date}</td><td><span className="reg-number">{item.vehicle}</span></td><td>{item.vendor}</td><td>{item.litres ? item.litres + ' L' : '-'}</td><td>{item.mileage ? item.mileage + ' km/l' : '-'}</td><td><strong className="finance-amount">{formatCurrency(item.amount)}</strong></td><td><FinanceStatus status={item.status} /></td>
                    <td><div className="row-actions"><button type="button" aria-label="View expense"><span className="material-symbols-outlined">visibility</span></button><button type="button" aria-label="More actions"><span className="material-symbols-outlined">more_horiz</span></button></div></td>
                  </tr>)}</tbody>
                </table>
              </div>
              <div className="vehicle-pagination"><p>Showing <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> expenses</p><div><button className="transit-btn" disabled>Previous</button><span>Page 1 of 1</span><button className="transit-btn" disabled>Next</button></div></div>
            </section>
          </div>

          <aside className="finance-sidebar">
            <section className="transit-panel finance-chart-card"><div className="finance-chart-head"><div><p className="transit-kicker">Breakdown</p><h2>Expense Mix</h2></div><span>{formatCurrency(total)}</span></div><div className="expense-pie" style={pieStyle}><div>{Math.round((breakdown[0].amount / Math.max(total, 1)) * 100)}%<small>Fuel</small></div></div><div className="expense-legend">{breakdown.map(item => <div key={item.type}><i style={{ background: typeConfig[item.type].color }} /><span>{item.type}</span><strong>{formatCurrency(item.amount)}</strong></div>)}</div></section>
            <section className="transit-panel finance-chart-card"><div className="finance-chart-head"><div><p className="transit-kicker">Trend</p><h2>Monthly Spending</h2></div><span>6 mo</span></div><div className="spending-bars">{MONTHLY_SPEND.map(item => <div key={item.label}><span style={{ height: Math.max(18, (item.value / maxMonth) * 150) + 'px' }} /><strong>{item.label}</strong><small>{Math.round(item.value / 1000)}k</small></div>)}</div></section>
          </aside>
        </section>
      </main>
      <AddExpenseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={addExpense} />
    </Layout>
  );
};

export default FuelExpenseManagement;
