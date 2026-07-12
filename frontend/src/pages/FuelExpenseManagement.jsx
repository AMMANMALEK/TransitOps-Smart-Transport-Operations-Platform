import { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { financeAPI } from '../api/finance';
import { vehiclesAPI } from '../api/vehicles';
import { useAppState } from '../context/StateContext';
import { hasActionAccess } from '../config/permissions';

const DATE_FILTERS = ['All Time', 'Today', 'Last 7 Days', 'This Month'];
const EXPENSE_TYPES = ['Fuel', 'Toll', 'Other'];

const typeConfig = {
  Fuel: { cls: 'expense-badge fuel', icon: 'local_gas_station', color: '#f59e0b' },
  Toll: { cls: 'expense-badge tolls', icon: 'toll', color: '#38bdf8' },
  Other: { cls: 'expense-badge insurance', icon: 'payments', color: '#a78bfa' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function ExpenseBadge({ type }) {
  const cfg = typeConfig[type] || typeConfig.Other;
  return <span className={cfg.cls}><span className="material-symbols-outlined">{cfg.icon}</span>{type}</span>;
}

function AddExpenseDrawer({ open, onClose, onAdd, vehicles }) {
  const [form, setForm] = useState({ vehicleId: '', type: 'Fuel', liters: 100, cost: 9500, amount: 2000, description: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicles.length > 0 && !form.vehicleId) {
      setForm(prev => ({ ...prev, vehicleId: vehicles[0]._id }));
    }
  }, [vehicles]);

  if (!open) return null;

  const set = field => event => setForm(prev => ({ 
    ...prev, 
    [field]: ['liters', 'cost', 'amount'].includes(field) ? Number(event.target.value) : event.target.value 
  }));

  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!form.vehicleId) {
      setError('Please select a vehicle');
      setLoading(false);
      return;
    }

    try {
      if (form.type === 'Fuel') {
        const payload = {
          vehicleId: form.vehicleId,
          liters: Number(form.liters),
          cost: Number(form.cost),
          date: form.date
        };
        await financeAPI.createFuelLog(payload);
        alert('Fuel purchase logged successfully!');
      } else {
        const payload = {
          vehicleId: form.vehicleId,
          type: form.type, // 'Toll' or 'Other'
          amount: Number(form.amount),
          description: form.description,
          date: form.date
        };
        await financeAPI.createExpense(payload);
        alert('Operational expense logged successfully!');
      }
      onAdd();
      setForm({ vehicleId: vehicles[0]?._id || '', type: 'Fuel', liters: 100, cost: 9500, amount: 2000, description: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Add transaction" onMouseDown={event => event.stopPropagation()} style={{ overflowY: 'auto' }}>
        <div className="drawer-head"><div><p className="transit-kicker">Finance Control</p><h2>Add Expense/Fuel</h2></div><button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button></div>
        <form onSubmit={submit} className="drawer-form">
          {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}
          
          <label>Vehicle
            <select value={form.vehicleId} onChange={set('vehicleId')}>
              {vehicles.map(item => <option key={item._id} value={item._id}>{item.registrationNumber} - {item.model}</option>)}
            </select>
          </label>
          
          <div className="drawer-grid">
            <label>Transaction Type
              <select value={form.type} onChange={set('type')}>
                {EXPENSE_TYPES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>Transaction Date
              <input type="date" required value={form.date} onChange={set('date')} />
            </label>
          </div>

          {form.type === 'Fuel' ? (
            <div className="drawer-grid">
              <label>Fuel Quantity (liters)
                <input type="number" min="1" required value={form.liters} onChange={set('liters')} />
              </label>
              <label>Total Cost (INR)
                <input type="number" min="1" required value={form.cost} onChange={set('cost')} />
              </label>
            </div>
          ) : (
            <>
              <label>Expense Amount (INR)
                <input type="number" min="1" required value={form.amount} onChange={set('amount')} />
              </label>
              <label>Description/Vendor
                <input required value={form.description} onChange={set('description')} placeholder="e.g. Expressway FASTag toll or Insurance premium" />
              </label>
            </>
          )}

          <div className="drawer-actions">
            <button type="button" className="transit-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="transit-btn transit-btn-primary" disabled={loading}>
              <span className="material-symbols-outlined">add_card</span>Log Transaction
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

const FuelExpenseManagement = () => {
  const { user } = useAppState();
  const canLog = hasActionAccess(user?.role, 'finance', 'logExpense');
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dateFilter, setDateFilter] = useState('All Time');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fuelData, expenseData, vehiclesData] = await Promise.all([
        financeAPI.getAllFuelLogs(),
        financeAPI.getAllExpenses(),
        vehiclesAPI.getAll()
      ]);
      setFuelLogs(fuelData);
      setExpenses(expenseData);
      setVehicles(vehiclesData?.vehicles || vehiclesData || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  // Merge FuelLogs and Expenses into a single list
  const transactions = useMemo(() => {
    const fuelList = fuelLogs.map(f => ({
      _id: f._id,
      date: f.date,
      vehicleId: f.vehicleId,
      registrationNumber: f.vehicleId?.registrationNumber || 'N/A',
      type: 'Fuel',
      liters: f.liters,
      amount: f.cost,
      description: `${f.liters} liters fuel purchase`
    }));

    const expenseList = expenses.map(e => ({
      _id: e._id,
      date: e.date,
      vehicleId: e.vehicleId,
      registrationNumber: e.vehicleId?.registrationNumber || 'N/A',
      type: e.type,
      liters: 0,
      amount: e.amount,
      description: e.description || `${e.type} fee`
    }));

    return [...fuelList, ...expenseList].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [fuelLogs, expenses]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesVehicle = vehicleFilter === 'All Vehicles' || t.vehicleId?._id === vehicleFilter;
      
      let matchesDate = true;
      if (dateFilter === 'Today') {
        const todayStr = new Date('2026-07-12T00:00:00').toDateString();
        matchesDate = new Date(t.date).toDateString() === todayStr;
      } else if (dateFilter === 'Last 7 Days') {
        const sevenDaysAgo = new Date('2026-07-05T00:00:00');
        matchesDate = new Date(t.date) >= sevenDaysAgo;
      } else if (dateFilter === 'This Month') {
        const currentMonth = new Date('2026-07-12T00:00:00').getMonth();
        matchesDate = new Date(t.date).getMonth() === currentMonth;
      }

      return matchesVehicle && matchesDate;
    });
  }, [transactions, vehicleFilter, dateFilter]);

  const totalSpend = filteredTransactions.reduce((sum, item) => sum + item.amount, 0);
  const fuelSpend = filteredTransactions.filter(item => item.type === 'Fuel').reduce((sum, item) => sum + item.amount, 0);
  const tollOtherSpend = filteredTransactions.filter(item => item.type !== 'Fuel').reduce((sum, item) => sum + item.amount, 0);
  const totalLiters = filteredTransactions.filter(item => item.type === 'Fuel').reduce((sum, item) => sum + item.liters, 0);

  const breakdown = EXPENSE_TYPES.map(type => ({
    type,
    amount: filteredTransactions.filter(item => {
      if (type === 'Fuel') return item.type === 'Fuel';
      if (type === 'Toll') return item.type === 'Toll';
      return item.type !== 'Fuel' && item.type !== 'Toll';
    }).reduce((sum, item) => sum + item.amount, 0)
  }));

  const handleAddTransaction = () => {
    setDrawerOpen(false);
    loadData();
  };

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel vehicle-toolbar">
          <div className="vehicle-title-block">
            <p className="transit-eyebrow">Finance Control</p>
            <h1>Fuel &amp; Expense Management</h1>
            <span>Record fuel purchases, track tolls, and manage fleet operational cost centers dynamically.</span>
          </div>
          <div className="vehicle-controls">
            {canLog && (
              <button type="button" className="transit-btn transit-btn-primary" onClick={() => setDrawerOpen(true)}>
                <span className="material-symbols-outlined">add_card</span>Log Expense/Fuel
              </button>
            )}
            <select value={vehicleFilter} onChange={event => setVehicleFilter(event.target.value)} aria-label="Vehicle filter">
              <option value="All Vehicles">All Vehicles</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
            </select>
            <select value={dateFilter} onChange={event => setDateFilter(event.target.value)} aria-label="Timeframe filter">
              {DATE_FILTERS.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>
        </section>

        {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

        {loading ? (
          <section className="transit-panel" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading financial ledgers...</p>
          </section>
        ) : (
          <>
          <section className="db-kpi-row">
              <div className="transit-panel db-kpi">
                <div className="db-kpi-icon" style={{ background: 'rgba(99,102,241,.12)', color: '#818cf8' }}>
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="db-kpi-body">
                  <p className="db-kpi-label">Total Spend</p>
                  <strong className="db-kpi-value">{formatCurrency(totalSpend)}</strong>
                  <span className="db-kpi-sub">Tolls, fuel, &amp; other combined</span>
                </div>
              </div>
              <div className="transit-panel db-kpi">
                <div className="db-kpi-icon" style={{ background: 'rgba(59,130,246,.12)', color: '#60a5fa' }}>
                  <span className="material-symbols-outlined">local_gas_station</span>
                </div>
                <div className="db-kpi-body">
                  <p className="db-kpi-label">Fuel Expenditure</p>
                  <strong className="db-kpi-value">{formatCurrency(fuelSpend)}</strong>
                  <span className="db-kpi-sub">{totalLiters.toLocaleString()} liters purchased</span>
                </div>
              </div>
              <div className="transit-panel db-kpi">
                <div className="db-kpi-icon" style={{ background: 'rgba(34,197,94,.12)', color: '#4ade80' }}>
                  <span className="material-symbols-outlined">toll</span>
                </div>
                <div className="db-kpi-body">
                  <p className="db-kpi-label">Tolls &amp; Other Fees</p>
                  <strong className="db-kpi-value">{formatCurrency(tollOtherSpend)}</strong>
                  <span className="db-kpi-sub">FASTag &amp; miscellaneous operational costs</span>
                </div>
              </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 0.4fr)', gap: '24px', alignItems: 'start' }}>
              <div className="transit-panel vehicle-table-card">
                <div className="driver-table-head"><div><p className="transit-kicker">Unified Ledger</p><h2>Recent Expenditures</h2></div><span>{filteredTransactions.length} records found</span></div>
                <div className="vehicle-table-wrap">
                  <table className="vehicle-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Description/Vendor</th>
                        <th>Litres</th>
                        <th>Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(item => (
                        <tr key={item._id}>
                          <td>{new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td><span className="reg-number">{item.registrationNumber}</span></td>
                          <td><ExpenseBadge type={item.type === 'Toll' ? 'Toll' : item.type === 'Fuel' ? 'Fuel' : 'Other'} /></td>
                          <td>{item.description}</td>
                          <td>{item.liters > 0 ? `${item.liters} L` : '—'}</td>
                          <td><strong>{formatCurrency(item.amount)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTransactions.length === 0 && (
                  <div className="vehicle-empty">
                    <div className="trip-empty-art"><span className="material-symbols-outlined map">payments</span><i /></div>
                    <h3>No transactions recorded</h3>
                    <p>Change your filter selections or log a new fuel buy or toll expense.</p>
                  </div>
                )}
              </div>

              <div className="transit-panel maintenance-timeline-panel" style={{ background: 'linear-gradient(180deg, rgba(30,41,59,.24), rgba(15,23,42,.38))' }}>
                <div className="maintenance-panel-head"><div><p className="transit-kicker">Spend Analysis</p><h2>Category Breakdown</h2></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 16px', gap: '20px' }}>
                  <div className="w-40 h-40 rounded-full flex items-center justify-center text-slate-100 font-black text-xl shadow-xl" style={{
                    width: '140px', height: '140px', borderRadius: '999px',
                    background: 'conic-gradient(#f59e0b 0% 65%, #38bdf8 65% 85%, #a78bfa 85% 100%)',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
                    display: 'grid', placeItems: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '14px', textAlign: 'center'
                  }}>
                    {Math.round((fuelSpend / (totalSpend || 1)) * 100)}% Fuel
                  </div>
                  <div style={{ width: '100%', display: 'grid', gap: '12px' }}>
                    {breakdown.map((item, index) => {
                      const pct = Math.round((item.amount / (totalSpend || 1)) * 100);
                      const colors = ['#f59e0b', '#38bdf8', '#a78bfa'];
                      return (
                        <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: colors[index], display: 'inline-block' }} />
                            <span style={{ color: '#94a3b8', fontWeight: 700 }}>{item.type === 'Other' ? 'Miscellaneous' : item.type}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#f8fafc' }}>{formatCurrency(item.amount)}</strong>
                            <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>{pct}% share</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <AddExpenseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={handleAddTransaction} vehicles={vehicles} />
    </Layout>
  );
};

export default FuelExpenseManagement;
