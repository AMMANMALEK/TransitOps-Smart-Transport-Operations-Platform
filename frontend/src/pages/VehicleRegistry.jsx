import { useMemo, useState } from 'react';
import Layout from '../components/Layout';

const INITIAL_VEHICLES = [
  { id: 1, reg: 'KA-01-TX-2048', model: 'Volvo 9400 Intercity', type: 'Bus', capacity: '52 seats', driver: 'Anika Rao', fuel: 84, status: 'Available' },
  { id: 2, reg: 'MH-12-FL-7781', model: 'Tata Prima 5530', type: 'Truck', capacity: '32 tons', driver: 'Dev Mehta', fuel: 61, status: 'On Trip' },
  { id: 3, reg: 'DL-09-UR-1188', model: 'Ashok Leyland Lynx', type: 'Bus', capacity: '41 seats', driver: 'Maya Singh', fuel: 28, status: 'Maintenance' },
  { id: 4, reg: 'TN-22-LG-0432', model: 'Force Traveller 3350', type: 'Van', capacity: '18 seats', driver: 'Rohan Iyer', fuel: 72, status: 'Available' },
  { id: 5, reg: 'GJ-05-RT-3904', model: 'Eicher Pro 3015', type: 'Truck', capacity: '16 tons', driver: 'Kabir Shah', fuel: 45, status: 'On Trip' },
  { id: 6, reg: 'KA-03-SV-0097', model: 'Mahindra Bolero Camper', type: 'Service', capacity: '1.5 tons', driver: 'Noor Ali', fuel: 12, status: 'Retired' },
  { id: 7, reg: 'TS-07-MB-6201', model: 'Mercedes-Benz City Bus', type: 'Bus', capacity: '48 seats', driver: 'Isha Nair', fuel: 93, status: 'Available' },
  { id: 8, reg: 'RJ-14-DR-5520', model: 'Tata Winger Staff', type: 'Van', capacity: '15 seats', driver: 'Arjun Menon', fuel: 57, status: 'Maintenance' },
];

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
  const tone = value < 25 ? '#fca5a5' : value < 55 ? '#fbbf24' : '#86efac';
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
  const [form, setForm] = useState({ reg: '', model: '', type: 'Bus', capacity: '', driver: '', fuel: 78, status: 'Available' });
  if (!open) return null;

  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'fuel' ? Number(event.target.value) : event.target.value }));
  const submit = event => {
    event.preventDefault();
    onAdd(form);
    setForm({ reg: '', model: '', type: 'Bus', capacity: '', driver: '', fuel: 78, status: 'Available' });
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Add vehicle" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Registry Control</p><h2>Add Vehicle</h2></div>
          <button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={submit} className="drawer-form">
          <label>Registration Number<input required value={form.reg} onChange={set('reg')} placeholder="KA-01-TX-0000" /></label>
          <label>Model<input required value={form.model} onChange={set('model')} placeholder="Volvo 9400 Intercity" /></label>
          <div className="drawer-grid">
            <label>Vehicle Type<select value={form.type} onChange={set('type')}>{VEHICLE_TYPES.slice(1).map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={set('status')}>{STATUSES.slice(1).map(item => <option key={item}>{item}</option>)}</select></label>
          </div>
          <label>Capacity<input required value={form.capacity} onChange={set('capacity')} placeholder="52 seats / 16 tons" /></label>
          <label>Current Driver<input required value={form.driver} onChange={set('driver')} placeholder="Driver name" /></label>
          <label>Fuel Level <span>{form.fuel}%</span><input className="range" type="range" min="0" max="100" value={form.fuel} onChange={set('fuel')} /></label>
          <div className="drawer-actions"><button type="button" className="transit-btn" onClick={onClose}>Cancel</button><button type="submit" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">add</span>Add Vehicle</button></div>
        </form>
      </aside>
    </div>
  );
}

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Status');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredVehicles = useMemo(() => vehicles.filter(vehicle => {
    const haystack = (vehicle.reg + ' ' + vehicle.model + ' ' + vehicle.type + ' ' + vehicle.driver).toLowerCase();
    return haystack.includes(query.toLowerCase()) && (type === 'All Types' || vehicle.type === type) && (status === 'All Status' || vehicle.status === status);
  }), [query, status, type, vehicles]);

  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const visibleVehicles = filteredVehicles.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = setter => event => { setter(event.target.value); setPage(1); };
  const addVehicle = vehicle => { setVehicles(prev => [{ ...vehicle, id: Date.now() }, ...prev]); setDrawerOpen(false); setPage(1); };

  return (
    <Layout title="Vehicle Registry">
      <div className="vehicle-registry max-w-[1480px] mx-auto space-y-5">
        <section className="vehicle-toolbar transit-panel">
          <div className="vehicle-title-block"><p className="transit-eyebrow">Fleet Control</p><h1>Vehicle Registry</h1><span>{vehicles.length} vehicles tracked across the TransitOps network</span></div>
          <div className="vehicle-controls">
            <div className="vehicle-search"><span className="material-symbols-outlined">search</span><input value={query} onChange={updateFilter(setQuery)} placeholder="Search registration, model, driver..." /></div>
            <button className="transit-btn"><span className="material-symbols-outlined">filter_list</span>Filters</button>
            <select value={type} onChange={updateFilter(setType)}>{VEHICLE_TYPES.map(item => <option key={item}>{item}</option>)}</select>
            <select value={status} onChange={updateFilter(setStatus)}>{STATUSES.map(item => <option key={item}>{item}</option>)}</select>
            <button className="transit-btn"><span className="material-symbols-outlined">download</span>Export</button>
            <button className="transit-btn transit-btn-primary" onClick={() => setDrawerOpen(true)}><span className="material-symbols-outlined">add</span>Add Vehicle</button>
          </div>
        </section>
        <section className="vehicle-table-card transit-panel">
          {visibleVehicles.length === 0 ? <EmptyState /> : <div className="vehicle-table-wrap"><table className="vehicle-table"><thead><tr><th>Vehicle</th><th>Registration Number</th><th>Model</th><th>Vehicle Type</th><th>Capacity</th><th>Current Driver</th><th>Fuel Level</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleVehicles.map(vehicle => <tr key={vehicle.id}><td><div className="vehicle-avatar"><span className="material-symbols-outlined">{typeIcons[vehicle.type]}</span></div></td><td><strong className="reg-number">{vehicle.reg}</strong></td><td>{vehicle.model}</td><td><span className="type-pill">{vehicle.type}</span></td><td>{vehicle.capacity}</td><td><div className="driver-cell"><span>{vehicle.driver.split(' ').map(part => part[0]).join('').slice(0, 2)}</span>{vehicle.driver}</div></td><td><FuelLevel value={vehicle.fuel} /></td><td><StatusBadge status={vehicle.status} /></td><td><div className="row-actions"><button aria-label={'View ' + vehicle.reg}><span className="material-symbols-outlined">visibility</span></button><button aria-label={'Edit ' + vehicle.reg}><span className="material-symbols-outlined">edit</span></button><button aria-label={'More actions for ' + vehicle.reg}><span className="material-symbols-outlined">more_horiz</span></button></div></td></tr>)}</tbody></table></div>}
          <div className="vehicle-pagination"><p>Showing <strong>{visibleVehicles.length}</strong> of <strong>{filteredVehicles.length}</strong> vehicles</p><div><button className="transit-btn" disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><span>Page {page} of {pageCount}</span><button className="transit-btn" disabled={page === pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>Next</button></div></div>
        </section>
      </div>
      <AddVehicleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdd={addVehicle} />
    </Layout>
  );
};

export default VehicleRegistry;
