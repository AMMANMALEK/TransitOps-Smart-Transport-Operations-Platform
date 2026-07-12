import { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { maintenanceAPI } from '../api/maintenance';
import { vehiclesAPI } from '../api/vehicles';
import { useAppState } from '../context/StateContext';
import { hasActionAccess } from '../config/permissions';

const TYPES = ['Preventive Service', 'Engine Inspection', 'Brake System', 'Tyre Replacement', 'Electrical Repair', 'Body Work'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const priorityConfig = {
  Low: { cls: 'maintenance-badge low', icon: 'low_priority' },
  Medium: { cls: 'maintenance-badge medium', icon: 'remove' },
  High: { cls: 'maintenance-badge high', icon: 'priority_high' },
  Critical: { cls: 'maintenance-badge critical', icon: 'warning' },
};

const statusConfig = {
  Active: { cls: 'maintenance-badge progress', icon: 'engineering', label: 'In Progress' },
  Closed: { cls: 'maintenance-badge completed', icon: 'task_alt', label: 'Completed' },
};

function Badge({ value, type = 'status' }) {
  if (type === 'priority') {
    const cfg = priorityConfig[value] || priorityConfig.Medium;
    return <span className={cfg.cls}><span className="material-symbols-outlined">{cfg.icon}</span>{value}</span>;
  } else {
    const cfg = statusConfig[value] || statusConfig.Active;
    return <span className={cfg.cls}><span className="material-symbols-outlined">{cfg.icon}</span>{cfg.label}</span>;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function MaintenanceTimeline({ status }) {
  const steps = ['Scheduled', 'In Progress', 'Completed'];
  let activeIndex = 1; // Active corresponds to In Progress
  if (status === 'Closed') {
    activeIndex = 2; // Completed
  }
  return (
    <div className="maintenance-timeline" aria-label="Maintenance timeline">
      {steps.map((step, index) => {
        const done = index < activeIndex || status === 'Closed';
        const active = index === activeIndex;
        return <div key={step} className={'maintenance-step ' + (done ? 'done ' : '') + (active ? 'active' : '')}>
          <span className="maintenance-step-dot"><span className="material-symbols-outlined">{done ? 'check' : active ? 'radio_button_checked' : 'radio_button_unchecked'}</span></span>
          <div><strong>{step}</strong><p>{step === 'Scheduled' ? 'Work order approved' : step === 'In Progress' ? 'Vehicle in service bay' : 'Vehicle ready for release'}</p></div>
        </div>;
      })}
    </div>
  );
}

function VehiclePill({ registrationNumber, status }) {
  const isUnavailable = status === 'In Shop' || status === 'Retired';
  return <span className={'maintenance-vehicle-pill ' + (isUnavailable ? 'unavailable' : '')}><span className="material-symbols-outlined">{isUnavailable ? 'no_transfer' : 'directions_bus'}</span>{registrationNumber}</span>;
}

const MaintenanceManagement = () => {
  const { user } = useAppState();
  const canManage = hasActionAccess(user?.role, 'maintenance', 'manage');
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', type: 'Preventive Service', priority: 'Medium', cost: 15000, startDate: new Date().toISOString().split('T')[0], notes: '' });

  const unavailableVehicles = useMemo(() => vehicles.filter(v => v.status === 'In Shop'), [vehicles]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsResponse, vehiclesResponse] = await Promise.all([
        maintenanceAPI.getAll(),
        vehiclesAPI.getAll()
      ]);
      const fetchedLogs = logsResponse.logs || [];
      const vehiclesList = vehiclesResponse.vehicles || vehiclesResponse || [];
      setLogs(fetchedLogs);
      setVehicles(vehiclesList);
      
      // Auto select first log if available
      if (fetchedLogs.length > 0) {
        setSelected(fetchedLogs[0]);
      }
      
      // Set default vehicle in form if available
      if (vehiclesList.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehiclesList[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load maintenance operations');
    } finally {
      setLoading(false);
    }
  };

  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'cost' ? Number(event.target.value) : event.target.value }));
  
  const submit = async event => {
    event.preventDefault();
    setError('');
    
    if (!form.vehicleId) {
      alert('Please select a vehicle');
      return;
    }

    try {
      const description = `${form.type}${form.notes ? ': ' + form.notes : ''}`;
      const payload = {
        vehicleId: form.vehicleId,
        description,
        cost: form.cost,
        startDate: form.startDate,
        priority: form.priority // frontend specific
      };
      
      const response = await maintenanceAPI.create(payload);
      alert('Maintenance work order scheduled successfully!');
      
      setForm(prev => ({ ...prev, notes: '', cost: 15000 }));
      loadData(); // reload records
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule maintenance');
    }
  };

  const handleCloseMaintenance = async (id) => {
    if (!confirm('Are you sure you want to close this work order and release the vehicle?')) return;
    try {
      await maintenanceAPI.close(id, { endDate: new Date().toISOString() });
      alert('Maintenance closed successfully. Vehicle status restored!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close maintenance');
    }
  };

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel maintenance-header">
          <div className="vehicle-title-block">
            <p className="transit-eyebrow">Fleet Reliability</p>
            <h1>Maintenance Management</h1>
            <span>Schedule service, track technician progress, and keep unavailable vehicles visible to operations.</span>
          </div>
          <div className="maintenance-unavailable-strip">
            <span className="material-symbols-outlined">no_transfer</span>
            <div>
              <strong>{unavailableVehicles.length} vehicles currently in shop</strong>
              <p>{unavailableVehicles.map(v => v.registrationNumber).join('  |  ') || 'None'}</p>
            </div>
          </div>
        </section>

        {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

        {loading ? (
          <section className="transit-panel" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading maintenance operations...</p>
          </section>
        ) : (
          <section className="maintenance-grid">
            <form className="transit-panel maintenance-form" onSubmit={submit}>
              <div className="maintenance-panel-head"><div><p className="transit-kicker">Work Order</p><h2>Vehicle Maintenance Form</h2></div><Badge value={form.priority} type="priority" /></div>
              
              <label>Vehicle
                <select value={form.vehicleId} onChange={set('vehicleId')}>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} - {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </label>

              <div className="maintenance-form-row">
                <label>Maintenance Type
                  <select value={form.type} onChange={set('type')}>
                    {TYPES.map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>Priority
                  <select value={form.priority} onChange={set('priority')}>
                    {PRIORITIES.map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <div className="maintenance-form-row">
                <label>Start Date
                  <input type="date" required value={form.startDate} onChange={set('startDate')} />
                </label>
                <label>Estimated Cost (INR)
                  <input type="number" min="0" value={form.cost} onChange={set('cost')} />
                </label>
              </div>

              <label>Notes
                <textarea value={form.notes} onChange={set('notes')} placeholder="Add service bay notes, replacement parts, release checks, or approval details." rows="4" />
              </label>
              
              <div className="maintenance-form-summary">
                {form.vehicleId && (
                  <VehiclePill 
                    registrationNumber={vehicles.find(v => v._id === form.vehicleId)?.registrationNumber} 
                    status={vehicles.find(v => v._id === form.vehicleId)?.status} 
                  />
                )}
                <strong>{formatCurrency(form.cost)}</strong>
              </div>

              {canManage && (
                <div className="drawer-actions">
                  <button type="button" className="transit-btn" onClick={() => setForm(prev => ({ ...prev, notes: '', cost: 15000 }))}>Reset</button>
                  <button type="submit" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">add_task</span>Save Work Order</button>
                </div>
              )}
            </form>

            <aside className="transit-panel maintenance-timeline-panel">
              <div className="maintenance-panel-head"><div><p className="transit-kicker">Service Progress</p><h2>Maintenance Timeline</h2></div>{selected && <Badge value={selected.status} />}</div>
              {selected && <MaintenanceTimeline status={selected.status} />}
              {selected && (
                <div className="maintenance-selected-card">
                  <VehiclePill registrationNumber={selected.vehicleId?.registrationNumber} status={selected.vehicleId?.status} />
                  <h3>{selected.description.split(':')[0]}</h3>
                  <p>{selected.description.split(':').slice(1).join(':').trim() || 'No notes provided.'}</p>
                  
                  <div className="maintenance-meta-grid">
                    <div><span>Start Date</span><strong>{new Date(selected.startDate).toLocaleDateString('en-IN')}</strong></div>
                    <div><span>End Date</span><strong>{selected.endDate ? new Date(selected.endDate).toLocaleDateString('en-IN') : 'Ongoing'}</strong></div>
                    <div><span>Cost Charged</span><strong>{formatCurrency(selected.cost)}</strong></div>
                    <div><span>Status</span><Badge value={selected.status} /></div>
                  </div>

                  {selected.status === 'Active' && canManage && (
                    <div className="driver-panel-actions" style={{ marginTop: '16px', justifyContent: 'flex-end' }}>
                      <button type="button" className="transit-btn transit-btn-primary" onClick={() => handleCloseMaintenance(selected._id)}>
                        <span className="material-symbols-outlined">verified</span>Close &amp; Release Vehicle
                      </button>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </section>
        )}

        <section className="maintenance-history-section">
          <div className="driver-table-head"><div><p className="transit-kicker">Maintenance History</p><h2>Recent Work Orders</h2></div><span>{logs.length} records</span></div>
          <div className="maintenance-history-grid">
            {logs.map(record => {
              const unavailable = record.status === 'Active';
              return (
                <button key={record._id} type="button" className={'maintenance-history-card ' + (unavailable ? 'unavailable' : '')} onClick={() => setSelected(record)}>
                  <div className="maintenance-card-top">
                    <VehiclePill registrationNumber={record.vehicleId?.registrationNumber} status={record.vehicleId?.status} />
                    <Badge value={record.status} />
                  </div>
                  <h3>{record.description.split(':')[0]}</h3>
                  <p>{record.description.split(':').slice(1).join(':').trim() || 'No notes.'}</p>
                  <div className="maintenance-card-bottom">
                    <span>{record._id.slice(-6).toUpperCase()}</span>
                    <span>{new Date(record.startDate).toLocaleDateString('en-IN')}</span>
                    <strong>{formatCurrency(record.cost)}</strong>
                  </div>
                  {unavailable && <div className="maintenance-unavailable-note"><span className="material-symbols-outlined">warning</span>Vehicle in shop (unavailable)</div>}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default MaintenanceManagement;
