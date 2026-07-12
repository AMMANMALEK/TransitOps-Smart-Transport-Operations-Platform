import { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { vehiclesAPI } from '../api/vehicles';

const VEHICLE_TYPES = ['All Types', 'Bus', 'Truck', 'Van', 'Service'];
const STATUSES = ['All Status', 'Available', 'On Trip', 'Maintenance', 'Retired'];
const typeIcons = { Bus: 'directions_bus', Truck: 'local_shipping', Van: 'airport_shuttle', Service: 'home_repair_service' };
const statusConfig = {
  Available: { cls: 'vehicle-badge available', icon: 'check_circle' },
  'On Trip': { cls: 'vehicle-badge trip', icon: 'route' },
  Maintenance: { cls: 'vehicle-badge maintenance', icon: 'build_circle' },
  Retired: { cls: 'vehicle-badge retired', icon: 'block' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Available;
  return <span className={cfg.cls}><span className="material-symbols-outlined">{cfg.icon}</span>{status}</span>;
}

function FuelLevel({ value }) {
  const tone = value < 25 ? '#fca5a5' : value < 55 ? '#fb923c' : '#86efac';
  return <div className="fuel-cell"><div><span style={{ width: value + '%', background: tone }} /></div><strong>{value}%</strong></div>;
}

function EmptyState() {
  return (
    <div className="vehicle-empty">
      <div className="empty-illustration"><span className="material-symbols-outlined road">route</span><span className="material-symbols-outlined bus">directions_bus</span><i /></div>
      <h3>No vehicles found</h3>
      <p>Adjust your search or filters to bring vehicles back into view.</p>
    </div>
  );
}

function AddVehicleDrawer({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ registrationNumber: '', model: '', type: 'Bus', capacity: '', assignedDriver: '', fuelLevel: 78, status: 'Available' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!open) return null;

  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'fuelLevel' ? Number(event.target.value) : event.target.value }));
  
  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const newVehicle = await vehiclesAPI.create(form);
      onAdd(newVehicle);
      setForm({ registrationNumber: '', model: '', type: 'Bus', capacity: '', assignedDriver: '', fuelLevel: 78, status: 'Available' });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create vehicle';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Vehicle Registry</p><h2>Add Vehicle</h2></div>
          <button type="button" onClick={onClose} aria-label="Close"><span className="material-symbols-outlined">close</span></button>
        </div>
        
        <form onSubmit={submit} className="drawer-form">
          {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}
          
          <label>Registration Number<input required value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="KA-01-TX-2048" /></label>
          <label>Model<input required value={form.model} onChange={set('model')} placeholder="Volvo 9400 Intercity" /></label>
          <div className="drawer-grid">
            <label>Type<select value={form.type} onChange={set('type')}>{VEHICLE_TYPES.slice(1).map(t => <option key={t}>{t}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={set('status')}>{STATUSES.slice(1).map(s => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label>Capacity<input required value={form.capacity} onChange={set('capacity')} placeholder="52 seats or 32 tons" /></label>
          <label>Assigned Driver<input value={form.assignedDriver} onChange={set('assignedDriver')} placeholder="Driver name (optional)" /></label>
          <label>Fuel Level: <span>{form.fuelLevel}%</span><input type="range" min="0" max="100" className="range" value={form.fuelLevel} onChange={set('fuelLevel')} /></label>
          
          <div className="drawer-actions">
            <button type="button" className="transit-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="transit-btn transit-btn-primary" disabled={loading}>
              <span className="material-symbols-outlined">add_road</span>
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Status');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getAll();
      setVehicles(data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load vehicles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => vehicles.filter(v => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [v.registrationNumber, v.model, v.type, v.assignedDriver, v.capacity].some(value => String(value).toLowerCase().includes(query));
    const matchesType = type === 'All Types' || v.type === type;
    const matchesStatus = status === 'All Status' || v.status === status;
    return matchesQuery && matchesType && matchesStatus;
  }), [vehicles, search, type, status]);

  const handleAdd = (newVehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
    setDrawerOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle? This action cannot be undone.')) return;
    
    try {
      await vehiclesAPI.delete(id);
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete vehicle';
      alert(errorMessage);
    }
  };

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel vehicle-toolbar">
          <div className="vehicle-title-block">
            <p className="transit-eyebrow">Fleet Registry</p>
            <h1>Vehicle Registry</h1>
            <span>Register, monitor, and track every vehicle in your transport network from a unified registry interface.</span>
          </div>
          <div className="vehicle-controls">
            <button type="button" className="transit-btn transit-btn-primary" onClick={() => setDrawerOpen(true)}>
              <span className="material-symbols-outlined">add_road</span>Add Vehicle
            </button>
            <label className="vehicle-search" aria-label="Search vehicles">
              <span className="material-symbols-outlined">search</span>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search reg, model, driver" />
            </label>
            <select value={type} onChange={event => setType(event.target.value)} aria-label="Vehicle type filter">
              {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Status filter">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </section>

        {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

        <section className="transit-panel vehicle-table-card">
          <div className="vehicle-table-wrap">
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                <p>Loading vehicles...</p>
              </div>
            ) : (
              <table className="vehicle-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Registration Number</th>
                    <th>Vehicle Model</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Assigned Driver</th>
                    <th>Fuel Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map(vehicle => (
                    <tr key={vehicle._id}>
                      <td><div className="vehicle-avatar"><span className="material-symbols-outlined">{typeIcons[vehicle.type] || 'commute'}</span></div></td>
                      <td><span className="reg-number">{vehicle.registrationNumber}</span></td>
                      <td>{vehicle.model}</td>
                      <td><span className="type-pill">{vehicle.type}</span></td>
                      <td>{vehicle.capacity}</td>
                      <td><div className="driver-cell">{vehicle.assignedDriver ? <><span>{vehicle.assignedDriver.split(' ').map(p => p[0]).join('').slice(0, 2)}</span>{vehicle.assignedDriver}</> : <span style={{color: '#94a3b8'}}>Unassigned</span>}</div></td>
                      <td><FuelLevel value={vehicle.fuelLevel || 0} /></td>
                      <td><StatusBadge status={vehicle.status} /></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" aria-label="View details"><span className="material-symbols-outlined">visibility</span></button>
                          <button type="button" onClick={() => handleDelete(vehicle._id)} aria-label="Delete"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!loading && filteredVehicles.length === 0 && <EmptyState />}
          <div className="vehicle-pagination">
            <p>Showing <strong>{filteredVehicles.length}</strong> of <strong>{vehicles.length}</strong> vehicles</p>
            <div><button className="transit-btn" disabled>Previous</button><span>Page 1 of 1</span><button className="transit-btn" disabled>Next</button></div>
          </div>
        </section>
      </main>
      <AddVehicleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={handleAdd} />
    </Layout>
  );
};

export default VehicleRegistry;
