import { useMemo, useState } from 'react';
import Layout from '../components/Layout';

const VEHICLES = [
  { id: 'KA-01-TX-2048', label: 'KA-01-TX-2048 - Volvo 9400', unavailable: false },
  { id: 'MH-12-FL-7781', label: 'MH-12-FL-7781 - Tata Prima', unavailable: false },
  { id: 'DL-09-UR-1188', label: 'DL-09-UR-1188 - Ashok Leyland', unavailable: true },
  { id: 'TN-22-LG-0432', label: 'TN-22-LG-0432 - Force Traveller', unavailable: true },
  { id: 'GJ-05-RT-3904', label: 'GJ-05-RT-3904 - Eicher Pro', unavailable: false },
  { id: 'RJ-14-DR-5520', label: 'RJ-14-DR-5520 - Tata Winger', unavailable: true },
];

const TYPES = ['Preventive Service', 'Engine Inspection', 'Brake System', 'Tyre Replacement', 'Electrical Repair', 'Body Work'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const TECHNICIANS = ['Priya Nambiar', 'Aarav Kulkarni', 'Sofia Khan', 'Nikhil Verma', 'Mira Joseph'];
const STATUSES = ['Scheduled', 'In Progress', 'Completed'];

const INITIAL_HISTORY = [
  { id: 'MNT-8841', vehicle: 'DL-09-UR-1188', type: 'Brake System', priority: 'Critical', technician: 'Priya Nambiar', cost: 48500, status: 'In Progress', date: 'Jul 12, 2026', notes: 'ABS module replacement and route safety validation required before release.' },
  { id: 'MNT-8840', vehicle: 'TN-22-LG-0432', type: 'Preventive Service', priority: 'High', technician: 'Aarav Kulkarni', cost: 18200, status: 'Scheduled', date: 'Jul 13, 2026', notes: 'Scheduled service window before Kochi route reassignment.' },
  { id: 'MNT-8839', vehicle: 'KA-01-TX-2048', type: 'Engine Inspection', priority: 'Medium', technician: 'Sofia Khan', cost: 26400, status: 'Completed', date: 'Jul 10, 2026', notes: 'Oil pressure issue resolved; vehicle cleared for dispatch.' },
  { id: 'MNT-8838', vehicle: 'RJ-14-DR-5520', type: 'Electrical Repair', priority: 'High', technician: 'Nikhil Verma', cost: 22100, status: 'In Progress', date: 'Jul 12, 2026', notes: 'Telematics unit offline; vehicle held from active trips.' },
];

const priorityConfig = {
  Low: { cls: 'maintenance-badge low', icon: 'low_priority' },
  Medium: { cls: 'maintenance-badge medium', icon: 'remove' },
  High: { cls: 'maintenance-badge high', icon: 'priority_high' },
  Critical: { cls: 'maintenance-badge critical', icon: 'warning' },
};

const statusConfig = {
  Scheduled: { cls: 'maintenance-badge scheduled', icon: 'event' },
  'In Progress': { cls: 'maintenance-badge progress', icon: 'engineering' },
  Completed: { cls: 'maintenance-badge completed', icon: 'task_alt' },
};

function Badge({ value, type = 'status' }) {
  const cfg = type === 'priority' ? priorityConfig[value] : statusConfig[value];
  const fallback = type === 'priority' ? priorityConfig.Medium : statusConfig.Scheduled;
  const active = cfg || fallback;
  return <span className={active.cls}><span className="material-symbols-outlined">{active.icon}</span>{value}</span>;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function MaintenanceTimeline({ status }) {
  const steps = ['Scheduled', 'In Progress', 'Completed'];
  const activeIndex = steps.indexOf(status);
  return (
    <div className="maintenance-timeline" aria-label="Maintenance timeline">
      {steps.map((step, index) => {
        const done = index < activeIndex || status === 'Completed';
        const active = index === activeIndex;
        return <div key={step} className={'maintenance-step ' + (done ? 'done ' : '') + (active ? 'active' : '')}>
          <span className="maintenance-step-dot"><span className="material-symbols-outlined">{done ? 'check' : active ? 'radio_button_checked' : 'radio_button_unchecked'}</span></span>
          <div><strong>{step}</strong><p>{step === 'Scheduled' ? 'Work order approved' : step === 'In Progress' ? 'Vehicle in service bay' : 'Vehicle ready for release'}</p></div>
        </div>;
      })}
    </div>
  );
}

function VehiclePill({ vehicle }) {
  const info = VEHICLES.find(item => item.id === vehicle);
  const unavailable = info?.unavailable;
  return <span className={'maintenance-vehicle-pill ' + (unavailable ? 'unavailable' : '')}><span className="material-symbols-outlined">{unavailable ? 'no_transfer' : 'directions_bus'}</span>{vehicle}</span>;
}

const MaintenanceManagement = () => {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [selected, setSelected] = useState(INITIAL_HISTORY[0]);
  const [form, setForm] = useState({ vehicle: 'DL-09-UR-1188', type: 'Brake System', priority: 'High', technician: 'Priya Nambiar', cost: 32000, status: 'Scheduled', notes: '' });

  const unavailableVehicles = useMemo(() => VEHICLES.filter(vehicle => vehicle.unavailable), []);
  const activeStatus = selected?.status || form.status;

  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'cost' ? Number(event.target.value) : event.target.value }));
  const submit = event => {
    event.preventDefault();
    const record = { ...form, id: 'MNT-' + Date.now().toString().slice(-4), date: 'Jul 12, 2026', notes: form.notes || 'Maintenance record created from operations console.' };
    setHistory(prev => [record, ...prev]);
    setSelected(record);
    setForm(prev => ({ ...prev, notes: '', cost: 32000, status: 'Scheduled' }));
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
            <div><strong>{unavailableVehicles.length} vehicles unavailable</strong><p>{unavailableVehicles.map(vehicle => vehicle.id).join('  |  ')}</p></div>
          </div>
        </section>

        <section className="maintenance-grid">
          <form className="transit-panel maintenance-form" onSubmit={submit}>
            <div className="maintenance-panel-head"><div><p className="transit-kicker">Work Order</p><h2>Vehicle Maintenance Form</h2></div><Badge value={form.priority} type="priority" /></div>
            <label>Vehicle<select value={form.vehicle} onChange={set('vehicle')}>{VEHICLES.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.label}{vehicle.unavailable ? ' - unavailable' : ''}</option>)}</select></label>
            <div className="maintenance-form-row"><label>Maintenance Type<select value={form.type} onChange={set('type')}>{TYPES.map(item => <option key={item}>{item}</option>)}</select></label><label>Priority<select value={form.priority} onChange={set('priority')}>{PRIORITIES.map(item => <option key={item}>{item}</option>)}</select></label></div>
            <div className="maintenance-form-row"><label>Technician<select value={form.technician} onChange={set('technician')}>{TECHNICIANS.map(item => <option key={item}>{item}</option>)}</select></label><label>Estimated Cost<input type="number" min="0" value={form.cost} onChange={set('cost')} /></label></div>
            <label>Status<select value={form.status} onChange={set('status')}>{STATUSES.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Notes<textarea value={form.notes} onChange={set('notes')} placeholder="Add service bay notes, replacement parts, release checks, or approval details." rows="4" /></label>
            <div className="maintenance-form-summary"><VehiclePill vehicle={form.vehicle} /><strong>{formatCurrency(form.cost)}</strong></div>
            <div className="drawer-actions"><button type="button" className="transit-btn" onClick={() => setForm({ vehicle: 'DL-09-UR-1188', type: 'Brake System', priority: 'High', technician: 'Priya Nambiar', cost: 32000, status: 'Scheduled', notes: '' })}>Reset</button><button type="submit" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">add_task</span>Save Work Order</button></div>
          </form>

          <aside className="transit-panel maintenance-timeline-panel">
            <div className="maintenance-panel-head"><div><p className="transit-kicker">Service Progress</p><h2>Maintenance Timeline</h2></div><Badge value={activeStatus} /></div>
            <MaintenanceTimeline status={activeStatus} />
            {selected && <div className="maintenance-selected-card">
              <VehiclePill vehicle={selected.vehicle} />
              <h3>{selected.type}</h3>
              <p>{selected.notes}</p>
              <div className="maintenance-meta-grid"><div><span>Technician</span><strong>{selected.technician}</strong></div><div><span>Estimated Cost</span><strong>{formatCurrency(selected.cost)}</strong></div><div><span>Priority</span><Badge value={selected.priority} type="priority" /></div><div><span>Status</span><Badge value={selected.status} /></div></div>
            </div>}
          </aside>
        </section>

        <section className="maintenance-history-section">
          <div className="driver-table-head"><div><p className="transit-kicker">Maintenance History</p><h2>Recent Work Orders</h2></div><span>{history.length} records</span></div>
          <div className="maintenance-history-grid">
            {history.map(record => {
              const unavailable = VEHICLES.find(vehicle => vehicle.id === record.vehicle)?.unavailable || record.status !== 'Completed';
              return <button key={record.id} type="button" className={'maintenance-history-card ' + (unavailable ? 'unavailable' : '')} onClick={() => setSelected(record)}>
                <div className="maintenance-card-top"><VehiclePill vehicle={record.vehicle} /><Badge value={record.status} /></div>
                <h3>{record.type}</h3>
                <p>{record.notes}</p>
                <div className="maintenance-card-bottom"><span>{record.id}</span><span>{record.date}</span><Badge value={record.priority} type="priority" /><strong>{formatCurrency(record.cost)}</strong></div>
                {unavailable && <div className="maintenance-unavailable-note"><span className="material-symbols-outlined">warning</span>Vehicle unavailable for dispatch</div>}
              </button>;
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default MaintenanceManagement;
