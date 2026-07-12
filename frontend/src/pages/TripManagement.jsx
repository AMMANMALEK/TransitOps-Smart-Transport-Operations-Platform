import { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { tripsAPI } from '../api/trips';
import { vehiclesAPI } from '../api/vehicles';
import { driversAPI } from '../api/drivers';

const TRIP_STEPS = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
const TRIP_STATUSES = ['All Status', 'Draft', 'Dispatched', 'Completed', 'Cancelled'];

const statusConfig = {
  Draft: { cls: 'trip-badge draft', icon: 'edit_note' },
  Dispatched: { cls: 'trip-badge dispatched', icon: 'local_shipping' },
  Completed: { cls: 'trip-badge completed', icon: 'task_alt' },
  Cancelled: { cls: 'trip-badge cancelled', icon: 'cancel' },
};

function initialsFor(name) {
  if (!name) return 'DR';
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function TripBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Draft;
  return <span className={cfg.cls}><span className="material-symbols-outlined">{cfg.icon}</span>{status}</span>;
}

function TripStepper({ status }) {
  const activeIndex = TRIP_STEPS.indexOf(status);
  const cancelled = status === 'Cancelled';
  return (
    <div className="trip-stepper" aria-label="Trip lifecycle">
      {TRIP_STEPS.map((step, index) => {
        const done = !cancelled && index < activeIndex;
        const active = index === activeIndex;
        return <div key={step} className={'trip-step ' + (done ? 'done ' : '') + (active ? 'active ' : '') + (step === 'Cancelled' && cancelled ? 'cancelled' : '')}><span>{done ? 'check' : step === 'Cancelled' ? 'close' : index + 1}</span><strong>{step}</strong></div>;
      })}
    </div>
  );
}

function TripProgress({ status }) {
  let value = 0;
  if (status === 'Draft') value = 15;
  else if (status === 'Dispatched') value = 50;
  else if (status === 'Completed') value = 100;
  const tone = status === 'Cancelled' ? 'cancelled' : status === 'Completed' ? 'completed' : status === 'Draft' ? 'draft' : 'active';
  return <div className="trip-progress"><div><span className={tone} style={{ width: value + '%' }} /></div><strong>{value}%</strong></div>;
}

function TripDetailPanel({ trip, onClose, onUpdate }) {
  const [completeForm, setCompleteForm] = useState({ actualDistance: '', fuelConsumed: '', revenue: '', fuelCost: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!trip) return null;

  const handleDispatch = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await tripsAPI.dispatch(trip._id);
      onUpdate(response.trip || response);
      alert('Trip dispatched successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch trip');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    setError('');
    setLoading(true);
    try {
      const response = await tripsAPI.cancel(trip._id);
      onUpdate(response.trip || response);
      alert('Trip cancelled successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel trip');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        actualDistance: Number(completeForm.actualDistance),
        fuelConsumed: Number(completeForm.fuelConsumed),
        revenue: Number(completeForm.revenue),
        fuelCost: Number(completeForm.fuelCost)
      };
      const response = await tripsAPI.complete(trip._id, payload);
      onUpdate(response.trip || response);
      alert('Trip completed successfully!');
      setCompleteForm({ actualDistance: '', fuelConsumed: '', revenue: '', fuelCost: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="trip-detail-panel" role="dialog" aria-modal="true" aria-label="Trip details" onMouseDown={event => event.stopPropagation()} style={{ overflowY: 'auto' }}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Trip Command</p><h2>{trip._id.slice(-6).toUpperCase()}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close trip details"><span className="material-symbols-outlined">close</span></button>
        </div>

        {error && <div className="auth-error" role="alert" style={{ marginBottom: '16px' }}><span className="material-symbols-outlined">error</span>{error}</div>}

        <div className="trip-route-card">
          <div><span>Source</span><strong>{trip.source}</strong></div>
          <span className="material-symbols-outlined">east</span>
          <div><span>Destination</span><strong>{trip.destination}</strong></div>
        </div>
        
        <TripStepper status={trip.status} />
        
        <div className="trip-detail-grid">
          <div><span>Assigned Vehicle</span><strong>{trip.vehicleId?.registrationNumber || 'N/A'}</strong></div>
          <div><span>Assigned Driver</span><strong>{trip.driverId?.name || 'N/A'}</strong></div>
          <div><span>Cargo Weight</span><strong>{trip.cargoWeight} tons</strong></div>
          <div><span>Planned Distance</span><strong>{trip.plannedDistance} km</strong></div>
        </div>

        <div className="trip-panel-section">
          <div className="driver-section-head"><h3>Progress</h3><TripBadge status={trip.status} /></div>
          <TripProgress status={trip.status} />
        </div>

        {trip.status === 'Draft' && (
          <div className="driver-panel-actions">
            <button type="button" className="transit-btn transit-btn-primary" onClick={handleDispatch} disabled={loading}>
              <span className="material-symbols-outlined">local_shipping</span>Dispatch Vehicle
            </button>
          </div>
        )}

        {trip.status === 'Dispatched' && (
          <div className="trip-panel-section" style={{ borderTop: '1px solid rgba(148,163,184,.16)', paddingTop: '16px' }}>
            <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Complete Trip Metrics</h3>
            <form onSubmit={handleComplete} className="drawer-form" style={{ background: 'transparent', padding: 0 }}>
              <div className="drawer-grid">
                <label>Actual Distance (km)
                  <input type="number" required value={completeForm.actualDistance} onChange={e => setCompleteForm(prev => ({ ...prev, actualDistance: e.target.value }))} placeholder="e.g. 570" />
                </label>
                <label>Fuel Consumed (liters)
                  <input type="number" required value={completeForm.fuelConsumed} onChange={e => setCompleteForm(prev => ({ ...prev, fuelConsumed: e.target.value }))} placeholder="e.g. 150" />
                </label>
              </div>
              <div className="drawer-grid">
                <label>Revenue Generated (INR)
                  <input type="number" required value={completeForm.revenue} onChange={e => setCompleteForm(prev => ({ ...prev, revenue: e.target.value }))} placeholder="e.g. 25000" />
                </label>
                <label>Fuel Cost (INR)
                  <input type="number" required value={completeForm.fuelCost} onChange={e => setCompleteForm(prev => ({ ...prev, fuelCost: e.target.value }))} placeholder="e.g. 15000" />
                </label>
              </div>
              <div className="driver-panel-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="transit-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }} onClick={handleCancel} disabled={loading}>Cancel Trip</button>
                <button type="submit" className="transit-btn transit-btn-primary" disabled={loading}>
                  <span className="material-symbols-outlined">task_alt</span>Complete Trip
                </button>
              </div>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}

function CreateTripDrawer({ open, onClose, onAdd, vehicles, drivers }) {
  const [form, setForm] = useState({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: 100 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableVehicles = useMemo(() => vehicles.filter(v => v.status === 'Available'), [vehicles]);
  const availableDrivers = useMemo(() => drivers.filter(d => d.status === 'Available'), [drivers]);

  // Set default selection when available lists update
  useEffect(() => {
    if (availableVehicles.length && !form.vehicleId) {
      setForm(prev => ({ ...prev, vehicleId: availableVehicles[0]._id }));
    }
  }, [availableVehicles]);

  useEffect(() => {
    if (availableDrivers.length && !form.driverId) {
      setForm(prev => ({ ...prev, driverId: availableDrivers[0]._id }));
    }
  }, [availableDrivers]);

  if (!open) return null;

  const set = field => event => setForm(prev => ({ ...prev, [field]: ['plannedDistance', 'cargoWeight'].includes(field) ? Number(event.target.value) : event.target.value }));
  
  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!form.vehicleId || !form.driverId) {
      setError('Please select both an available vehicle and an available driver.');
      setLoading(false);
      return;
    }

    try {
      const response = await tripsAPI.create(form);
      onAdd(response.trip || response);
      setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: 100 });
      alert('Trip drafted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to draft trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Create trip" onMouseDown={event => event.stopPropagation()} style={{ maxHeight: '90vh', borderRadius: '16px', border: '1px solid rgba(148,163,184,.16)', overflowY: 'auto' }}>
        <div className="drawer-head"><div><p className="transit-kicker">Trip Planning</p><h2>Create Trip</h2></div><button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button></div>
        <form onSubmit={submit} className="drawer-form">
          {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}
          <label>Source<input required value={form.source} onChange={set('source')} placeholder="Origin depot" /></label>
          <label>Destination<input required value={form.destination} onChange={set('destination')} placeholder="Destination hub" /></label>
          
          <div className="drawer-grid">
            <label>Assigned Available Vehicle
              <select required value={form.vehicleId} onChange={set('vehicleId')}>
                {availableVehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} - {v.model}</option>)}
                {availableVehicles.length === 0 && <option value="">No available vehicles</option>}
              </select>
            </label>
            <label>Assigned Available Driver
              <select required value={form.driverId} onChange={set('driverId')}>
                {availableDrivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.licenseCategory})</option>)}
                {availableDrivers.length === 0 && <option value="">No available drivers</option>}
              </select>
            </label>
          </div>
          <div className="drawer-grid">
            <label>Cargo Weight (tons)
              <input type="number" step="0.1" required value={form.cargoWeight} onChange={set('cargoWeight')} placeholder="e.g. 18.4" />
            </label>
            <label>Planned Distance (km)
              <input type="number" min="1" required value={form.plannedDistance} onChange={set('plannedDistance')} />
            </label>
          </div>
          <div className="drawer-actions"><button type="button" className="transit-btn" onClick={onClose}>Cancel</button><button type="submit" className="transit-btn transit-btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Trip'}</button></div>
        </form>
      </aside>
    </div>
  );
}

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Status');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        tripsAPI.getAll(),
        vehiclesAPI.getAll(),
        driversAPI.getAll()
      ]);
      setTrips(tripsData.trips || []);
      setVehicles(vehiclesData?.vehicles || vehiclesData || []);
      setDrivers(driversData?.drivers || driversData || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load trip board operations');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = useMemo(() => trips.filter(trip => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [
      trip._id,
      trip.source,
      trip.destination,
      trip.vehicleId?.registrationNumber,
      trip.driverId?.name,
      trip.cargoWeight
    ].some(value => String(value || '').toLowerCase().includes(query));
    const matchesStatus = status === 'All Status' || trip.status === status;
    return matchesQuery && matchesStatus;
  }), [trips, search, status]);

  const addTrip = trip => {
    setTrips(prev => [trip, ...prev]);
    setCreateOpen(false);
    // Reload database metrics to refresh vehicle/driver availability statuses
    loadData();
  };

  const handleUpdate = updatedTrip => {
    setTrips(prev => prev.map(t => t._id === updatedTrip._id ? updatedTrip : t));
    setSelectedTrip(updatedTrip);
    loadData(); // refresh roster availability statuses
  };

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel vehicle-toolbar trip-toolbar">
          <div className="vehicle-title-block">
            <p className="transit-eyebrow">Operations Control</p>
            <h1>Trip Management</h1>
            <span>Plan, dispatch, track, and close transport movements from one operational command table.</span>
          </div>
          <div className="vehicle-controls trip-controls">
            <button type="button" className="transit-btn transit-btn-primary" onClick={() => setCreateOpen(true)}><span className="material-symbols-outlined">add_road</span>Create Trip</button>
            <label className="vehicle-search" aria-label="Search trips"><span className="material-symbols-outlined">search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search trip ID, route, vehicle, driver" /></label>
            <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Trip status filter">{TRIP_STATUSES.map(item => <option key={item}>{item}</option>)}</select>
          </div>
        </section>

        {loading ? (
          <section className="transit-panel vehicle-table-card" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading active trip board...</p>
          </section>
        ) : error ? (
          <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>
        ) : (
          <section className="transit-panel vehicle-table-card trip-table-card">
            <div className="driver-table-head"><div><p className="transit-kicker">Trip Board</p><h2>Active Trips</h2></div><span>{filteredTrips.length} records</span></div>
            <div className="vehicle-table-wrap">
              <table className="vehicle-table trip-table">
                <thead><tr><th>Trip ID</th><th>Source</th><th>Destination</th><th>Assigned Vehicle</th><th>Assigned Driver</th><th>Cargo Weight</th><th>Planned Distance</th><th>Trip Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredTrips.map(trip => (
                    <tr key={trip._id} onClick={() => setSelectedTrip(trip)}>
                      <td><span className="trip-id">{trip._id.slice(-6).toUpperCase()}</span></td>
                      <td>{trip.source}</td>
                      <td>{trip.destination}</td>
                      <td><span className="type-pill">{trip.vehicleId?.registrationNumber || 'N/A'}</span></td>
                      <td><div className="driver-cell"><span>{initialsFor(trip.driverId?.name)}</span>{trip.driverId?.name || 'N/A'}</div></td>
                      <td>{trip.cargoWeight} tons</td>
                      <td>{trip.plannedDistance} km</td>
                      <td><div className="trip-status-cell"><TripBadge status={trip.status} /><TripProgress status={trip.status} /></div></td>
                      <td><div className="row-actions"><button type="button" onClick={event => { event.stopPropagation(); setSelectedTrip(trip); }} aria-label={'Open ' + trip._id}><span className="material-symbols-outlined">visibility</span></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTrips.length === 0 && <div className="vehicle-empty"><div className="trip-empty-art"><span className="material-symbols-outlined map">route</span><span className="material-symbols-outlined truck">local_shipping</span><i /></div><h3>No trips found</h3><p>Adjust search or trip status filters to restore records.</p></div>}
            <div className="vehicle-pagination"><p>Showing <strong>{filteredTrips.length}</strong> of <strong>{trips.length}</strong> trips</p><div><button className="transit-btn" disabled>Previous</button><span>Page 1 of 1</span><button className="transit-btn" disabled>Next</button></div></div>
          </section>
        )}
      </main>
      <TripDetailPanel trip={selectedTrip} onClose={() => setSelectedTrip(null)} onUpdate={handleUpdate} />
      <CreateTripDrawer open={createOpen} onClose={() => setCreateOpen(false)} onAdd={addTrip} vehicles={vehicles} drivers={drivers} />
    </Layout>
  );
};

export default TripManagement;
