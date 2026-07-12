import { useMemo, useState } from 'react';
import Layout from '../components/Layout';

const TRIP_STEPS = ['Draft', 'Dispatched', 'On Route', 'Completed', 'Cancelled'];
const VEHICLE_TYPES = ['All Vehicle Types', 'Truck', 'Bus', 'Van', 'Service'];
const TRIP_STATUSES = ['All Status', 'Draft', 'Dispatched', 'On Route', 'Completed', 'Cancelled'];

const INITIAL_TRIPS = [
  { id: 'TRP-24081', source: 'Bengaluru North Depot', destination: 'Hyderabad Metro Hub', vehicle: 'KA-01-TX-2048', vehicleType: 'Truck', driver: 'Anika Rao', cargo: '18.4 tons', distance: 568, status: 'On Route', progress: 64, eta: 'Today, 18:40', checkpoints: [
    { label: 'Trip drafted', place: 'Bengaluru North Depot', time: '08:10', state: 'done' },
    { label: 'Vehicle dispatched', place: 'Nelamangala Gate', time: '09:05', state: 'done' },
    { label: 'Checkpoint crossed', place: 'Kurnool Corridor', time: '14:35', state: 'active' },
    { label: 'Arrival scan', place: 'Hyderabad Metro Hub', time: '18:40 ETA', state: 'pending' },
  ] },
  { id: 'TRP-24082', source: 'Pune Freight Hub', destination: 'Mumbai Port Terminal', vehicle: 'MH-12-FL-7781', vehicleType: 'Truck', driver: 'Dev Mehta', cargo: '24.1 tons', distance: 154, status: 'Dispatched', progress: 28, eta: 'Today, 15:20', checkpoints: [
    { label: 'Trip drafted', place: 'Pune Freight Hub', time: '10:00', state: 'done' },
    { label: 'Vehicle dispatched', place: 'Wakad Toll', time: '10:45', state: 'active' },
    { label: 'Checkpoint scan', place: 'Panvel Yard', time: '13:50 ETA', state: 'pending' },
    { label: 'Cargo handoff', place: 'Mumbai Port Terminal', time: '15:20 ETA', state: 'pending' },
  ] },
  { id: 'TRP-24083', source: 'Delhi Urban Terminal', destination: 'Jaipur Regional Yard', vehicle: 'DL-09-UR-1188', vehicleType: 'Bus', driver: 'Maya Singh', cargo: 'Passenger route', distance: 281, status: 'Completed', progress: 100, eta: 'Completed 12:05', checkpoints: [
    { label: 'Trip drafted', place: 'Delhi Urban Terminal', time: '06:30', state: 'done' },
    { label: 'Vehicle dispatched', place: 'Gurugram Station', time: '07:15', state: 'done' },
    { label: 'On-route validation', place: 'Neemrana', time: '09:25', state: 'done' },
    { label: 'Completed', place: 'Jaipur Regional Yard', time: '12:05', state: 'done' },
  ] },
  { id: 'TRP-24084', source: 'Chennai South Yard', destination: 'Kochi Logistics Park', vehicle: 'TN-22-LG-0432', vehicleType: 'Van', driver: 'Rohan Iyer', cargo: '4.6 tons', distance: 690, status: 'Draft', progress: 8, eta: 'Awaiting dispatch', checkpoints: [
    { label: 'Trip drafted', place: 'Chennai South Yard', time: '11:15', state: 'active' },
    { label: 'Vehicle dispatch', place: 'Loading Bay 4', time: 'Pending', state: 'pending' },
    { label: 'Checkpoint scan', place: 'Coimbatore Bypass', time: 'Pending', state: 'pending' },
    { label: 'Delivery confirmation', place: 'Kochi Logistics Park', time: 'Pending', state: 'pending' },
  ] },
  { id: 'TRP-24085', source: 'Surat Logistics Park', destination: 'Ahmedabad Consolidation Center', vehicle: 'GJ-05-RT-3904', vehicleType: 'Truck', driver: 'Kabir Shah', cargo: '15.2 tons', distance: 263, status: 'Cancelled', progress: 0, eta: 'Cancelled', checkpoints: [
    { label: 'Trip drafted', place: 'Surat Logistics Park', time: '07:50', state: 'done' },
    { label: 'Dispatch held', place: 'Compliance desk', time: '08:35', state: 'cancelled' },
    { label: 'Cargo reassignment', place: 'Planning queue', time: 'Pending', state: 'pending' },
  ] },
  { id: 'TRP-24086', source: 'Hyderabad Metro Depot', destination: 'Bengaluru East Hub', vehicle: 'TS-07-MB-6201', vehicleType: 'Bus', driver: 'Isha Nair', cargo: 'Passenger route', distance: 575, status: 'On Route', progress: 72, eta: 'Today, 21:10', checkpoints: [
    { label: 'Trip drafted', place: 'Hyderabad Metro Depot', time: '12:00', state: 'done' },
    { label: 'Vehicle dispatched', place: 'Shamshabad Exit', time: '12:40', state: 'done' },
    { label: 'Checkpoint crossed', place: 'Anantapur Terminal', time: '17:20', state: 'active' },
    { label: 'Arrival scan', place: 'Bengaluru East Hub', time: '21:10 ETA', state: 'pending' },
  ] },
];

const statusConfig = {
  Draft: { cls: 'trip-badge draft', icon: 'edit_note' },
  Dispatched: { cls: 'trip-badge dispatched', icon: 'local_shipping' },
  'On Route': { cls: 'trip-badge route', icon: 'route' },
  Completed: { cls: 'trip-badge completed', icon: 'task_alt' },
  Cancelled: { cls: 'trip-badge cancelled', icon: 'cancel' },
};

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

function TripProgress({ value, status }) {
  const tone = status === 'Cancelled' ? 'cancelled' : status === 'Completed' ? 'completed' : status === 'Draft' ? 'draft' : 'active';
  return <div className="trip-progress"><div><span className={tone} style={{ width: value + '%' }} /></div><strong>{value}%</strong></div>;
}

function Timeline({ trip }) {
  return (
    <div className="trip-timeline">
      {trip.checkpoints.map((item, index) => <div key={item.label + index} className={'timeline-item ' + item.state}>
        <span className="timeline-dot"><span className="material-symbols-outlined">{item.state === 'done' ? 'check' : item.state === 'cancelled' ? 'close' : item.state === 'active' ? 'radio_button_checked' : 'radio_button_unchecked'}</span></span>
        <div><strong>{item.label}</strong><p>{item.place}</p><small>{item.time}</small></div>
      </div>)}
    </div>
  );
}

function TripDetailPanel({ trip, onClose }) {
  if (!trip) return null;
  return (
    <div className="driver-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="trip-detail-panel" role="dialog" aria-modal="true" aria-label="Trip details" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Trip Command</p><h2>{trip.id}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close trip details"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="trip-route-card">
          <div><span>Source</span><strong>{trip.source}</strong></div>
          <span className="material-symbols-outlined">east</span>
          <div><span>Destination</span><strong>{trip.destination}</strong></div>
        </div>
        <TripStepper status={trip.status} />
        <div className="trip-detail-grid">
          <div><span>Assigned Vehicle</span><strong>{trip.vehicle}</strong></div>
          <div><span>Assigned Driver</span><strong>{trip.driver}</strong></div>
          <div><span>Cargo Weight</span><strong>{trip.cargo}</strong></div>
          <div><span>Distance</span><strong>{trip.distance} km</strong></div>
        </div>
        <div className="trip-panel-section">
          <div className="driver-section-head"><h3>Progress</h3><TripBadge status={trip.status} /></div>
          <TripProgress value={trip.progress} status={trip.status} />
          <p>{trip.eta}</p>
        </div>
        <div className="trip-panel-section">
          <div className="driver-section-head"><h3>Checkpoint Timeline</h3><span className="transit-chip">Live</span></div>
          <Timeline trip={trip} />
        </div>
        <div className="driver-panel-actions"><button type="button" className="transit-btn"><span className="material-symbols-outlined">ios_share</span>Share</button><button type="button" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">edit_square</span>Update Trip</button></div>
      </aside>
    </div>
  );
}

function CreateTripDrawer({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ source: '', destination: '', vehicle: '', vehicleType: 'Truck', driver: '', cargo: '', distance: 120, status: 'Draft' });
  if (!open) return null;
  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'distance' ? Number(event.target.value) : event.target.value }));
  const submit = event => {
    event.preventDefault();
    onAdd({ ...form, id: 'TRP-' + Date.now().toString().slice(-5), progress: form.status === 'Draft' ? 8 : 22, eta: 'Awaiting dispatch', checkpoints: [
      { label: 'Trip drafted', place: form.source, time: 'Just now', state: 'active' },
      { label: 'Vehicle dispatch', place: 'Dispatch bay', time: 'Pending', state: 'pending' },
      { label: 'Checkpoint scan', place: 'Route checkpoint', time: 'Pending', state: 'pending' },
      { label: 'Delivery confirmation', place: form.destination, time: 'Pending', state: 'pending' },
    ] });
    setForm({ source: '', destination: '', vehicle: '', vehicleType: 'Truck', driver: '', cargo: '', distance: 120, status: 'Draft' });
  };
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Create trip" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head"><div><p className="transit-kicker">Trip Planning</p><h2>Create Trip</h2></div><button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button></div>
        <form onSubmit={submit} className="drawer-form">
          <label>Source<input required value={form.source} onChange={set('source')} placeholder="Origin depot" /></label>
          <label>Destination<input required value={form.destination} onChange={set('destination')} placeholder="Destination hub" /></label>
          <div className="drawer-grid"><label>Vehicle Type<select value={form.vehicleType} onChange={set('vehicleType')}>{VEHICLE_TYPES.slice(1).map(item => <option key={item}>{item}</option>)}</select></label><label>Status<select value={form.status} onChange={set('status')}>{TRIP_STATUSES.slice(1).map(item => <option key={item}>{item}</option>)}</select></label></div>
          <label>Assigned Vehicle<input required value={form.vehicle} onChange={set('vehicle')} placeholder="KA-01-TX-2048" /></label>
          <label>Assigned Driver<input required value={form.driver} onChange={set('driver')} placeholder="Driver name" /></label>
          <div className="drawer-grid"><label>Cargo Weight<input required value={form.cargo} onChange={set('cargo')} placeholder="18.4 tons" /></label><label>Distance<input type="number" min="1" value={form.distance} onChange={set('distance')} /></label></div>
          <div className="drawer-actions"><button type="button" className="transit-btn" onClick={onClose}>Cancel</button><button type="submit" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">add_road</span>Create Trip</button></div>
        </form>
      </aside>
    </div>
  );
}

const TripManagement = () => {
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Status');
  const [vehicleType, setVehicleType] = useState('All Vehicle Types');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredTrips = useMemo(() => trips.filter(trip => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [trip.id, trip.source, trip.destination, trip.vehicle, trip.driver, trip.cargo].some(value => String(value).toLowerCase().includes(query));
    const matchesStatus = status === 'All Status' || trip.status === status;
    const matchesType = vehicleType === 'All Vehicle Types' || trip.vehicleType === vehicleType;
    return matchesQuery && matchesStatus && matchesType;
  }), [trips, search, status, vehicleType]);

  const addTrip = trip => {
    setTrips(prev => [trip, ...prev]);
    setSelectedTrip(trip);
    setCreateOpen(false);
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
            <label className="vehicle-search" aria-label="Search trips"><span className="material-symbols-outlined">search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search trip, route, driver" /></label>
            <button type="button" className="transit-btn"><span className="material-symbols-outlined">tune</span>Filters</button>
            <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Trip status filter">{TRIP_STATUSES.map(item => <option key={item}>{item}</option>)}</select>
            <select value={vehicleType} onChange={event => setVehicleType(event.target.value)} aria-label="Vehicle type filter">{VEHICLE_TYPES.map(item => <option key={item}>{item}</option>)}</select>
          </div>
        </section>

        <section className="transit-panel trip-lifecycle-card">
          <div><p className="transit-kicker">Lifecycle Model</p><h2>Draft to delivery visibility</h2></div>
          <TripStepper status="On Route" />
        </section>

        <section className="transit-panel vehicle-table-card trip-table-card">
          <div className="driver-table-head"><div><p className="transit-kicker">Trip Board</p><h2>Active Trips</h2></div><span>{filteredTrips.length} records</span></div>
          <div className="vehicle-table-wrap">
            <table className="vehicle-table trip-table">
              <thead><tr><th>Trip ID</th><th>Source</th><th>Destination</th><th>Assigned Vehicle</th><th>Assigned Driver</th><th>Cargo Weight</th><th>Distance</th><th>Trip Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredTrips.map(trip => <tr key={trip.id} onClick={() => setSelectedTrip(trip)}>
                  <td><span className="trip-id">{trip.id}</span></td>
                  <td>{trip.source}</td>
                  <td>{trip.destination}</td>
                  <td><span className="type-pill">{trip.vehicle}</span></td>
                  <td><div className="driver-cell"><span>{trip.driver.split(' ').map(part => part[0]).join('').slice(0, 2)}</span>{trip.driver}</div></td>
                  <td>{trip.cargo}</td>
                  <td>{trip.distance} km</td>
                  <td><div className="trip-status-cell"><TripBadge status={trip.status} /><TripProgress value={trip.progress} status={trip.status} /></div></td>
                  <td><div className="row-actions"><button type="button" onClick={event => { event.stopPropagation(); setSelectedTrip(trip); }} aria-label={'Open ' + trip.id}><span className="material-symbols-outlined">visibility</span></button><button type="button" onClick={event => event.stopPropagation()} aria-label="More actions"><span className="material-symbols-outlined">more_horiz</span></button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          {filteredTrips.length === 0 && <div className="vehicle-empty"><div className="trip-empty-art"><span className="material-symbols-outlined map">route</span><span className="material-symbols-outlined truck">local_shipping</span><i /></div><h3>No trips found</h3><p>Adjust search, trip status, or vehicle type filters to restore records.</p></div>}
          <div className="vehicle-pagination"><p>Showing <strong>{filteredTrips.length}</strong> of <strong>{trips.length}</strong> trips</p><div><button className="transit-btn" disabled>Previous</button><span>Page 1 of 1</span><button className="transit-btn" disabled>Next</button></div></div>
        </section>
      </main>
      <TripDetailPanel trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      <CreateTripDrawer open={createOpen} onClose={() => setCreateOpen(false)} onAdd={addTrip} />
    </Layout>
  );
};

export default TripManagement;
