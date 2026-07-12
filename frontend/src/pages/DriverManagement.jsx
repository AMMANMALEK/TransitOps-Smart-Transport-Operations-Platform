import { useMemo, useState } from 'react';
import Layout from '../components/Layout';

const INITIAL_DRIVERS = [
  { id: 1, name: 'Anika Rao', license: 'DL-KA-4829-2048', phone: '+91 98765 12048', safety: 96, expiry: '2027-08-18', trips: 1248, status: 'Available', licenseStatus: 'Valid', vehicle: 'KA-01-TX-2048', base: 'Bengaluru North Depot', initials: 'AR', tone: 'amber' },
  { id: 2, name: 'Dev Mehta', license: 'DL-MH-7712-9981', phone: '+91 98220 77781', safety: 88, expiry: '2026-08-04', trips: 982, status: 'On Trip', licenseStatus: 'Expiring Soon', vehicle: 'MH-12-FL-7781', base: 'Pune Freight Hub', initials: 'DM', tone: 'blue' },
  { id: 3, name: 'Maya Singh', license: 'DL-DL-6409-1188', phone: '+91 99111 91188', safety: 91, expiry: '2027-02-11', trips: 1126, status: 'Available', licenseStatus: 'Valid', vehicle: 'DL-09-UR-1188', base: 'Delhi Urban Terminal', initials: 'MS', tone: 'green' },
  { id: 4, name: 'Rohan Iyer', license: 'DL-TN-2230-0432', phone: '+91 98400 10432', safety: 74, expiry: '2026-07-29', trips: 640, status: 'Off Duty', licenseStatus: 'Expiring Soon', vehicle: 'TN-22-LG-0432', base: 'Chennai South Yard', initials: 'RI', tone: 'red' },
  { id: 5, name: 'Kabir Shah', license: 'DL-GJ-5510-3904', phone: '+91 97240 33904', safety: 82, expiry: '2026-12-09', trips: 804, status: 'On Trip', licenseStatus: 'Valid', vehicle: 'GJ-05-RT-3904', base: 'Surat Logistics Park', initials: 'KS', tone: 'purple' },
  { id: 6, name: 'Noor Ali', license: 'DL-KA-7710-0097', phone: '+91 99009 80097', safety: 69, expiry: '2026-07-21', trips: 516, status: 'Suspended', licenseStatus: 'Under Review', vehicle: 'Unassigned', base: 'Bengaluru Service Bay', initials: 'NA', tone: 'red' },
  { id: 7, name: 'Isha Nair', license: 'DL-TS-9207-6201', phone: '+91 97000 66201', safety: 94, expiry: '2027-05-27', trips: 1370, status: 'Available', licenseStatus: 'Valid', vehicle: 'TS-07-MB-6201', base: 'Hyderabad Metro Depot', initials: 'IN', tone: 'green' },
  { id: 8, name: 'Arjun Menon', license: 'DL-RJ-1414-5520', phone: '+91 94600 55520', safety: 79, expiry: '2026-09-02', trips: 731, status: 'Off Duty', licenseStatus: 'Expiring Soon', vehicle: 'RJ-14-DR-5520', base: 'Jaipur Regional Yard', initials: 'AM', tone: 'blue' },
];

const LICENSE_STATUSES = ['All Licenses', 'Valid', 'Expiring Soon', 'Expired', 'Under Review'];
const SCORE_FILTERS = ['All Scores', '90+ Excellent', '80-89 Good', '70-79 Watchlist', 'Below 70'];
const CURRENT_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
const LICENSE_OPTIONS = ['Valid', 'Expiring Soon', 'Expired', 'Under Review'];

const statusConfig = {
  Available: { cls: 'driver-badge available', icon: 'check_circle' },
  'On Trip': { cls: 'driver-badge trip', icon: 'route' },
  'Off Duty': { cls: 'driver-badge off', icon: 'bedtime' },
  Suspended: { cls: 'driver-badge danger', icon: 'block' },
};

const licenseConfig = {
  Valid: { cls: 'driver-badge valid', icon: 'verified' },
  'Expiring Soon': { cls: 'driver-badge warning', icon: 'schedule' },
  Expired: { cls: 'driver-badge danger', icon: 'report' },
  'Under Review': { cls: 'driver-badge info', icon: 'policy' },
};

function scoreMatches(score, filter) {
  if (filter === '90+ Excellent') return score >= 90;
  if (filter === '80-89 Good') return score >= 80 && score <= 89;
  if (filter === '70-79 Watchlist') return score >= 70 && score <= 79;
  if (filter === 'Below 70') return score < 70;
  return true;
}

function initialsFor(name) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function daysUntil(dateString) {
  const today = new Date('2026-07-12T00:00:00');
  const expiry = new Date(dateString + 'T00:00:00');
  return Math.ceil((expiry - today) / 86400000);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString + 'T00:00:00'));
}

function isExpiringSoon(driver) {
  const remaining = daysUntil(driver.expiry);
  return driver.licenseStatus === 'Expiring Soon' || (remaining >= 0 && remaining <= 45);
}

function DriverPhoto({ driver, large = false }) {
  return <div className={'driver-photo ' + driver.tone + (large ? ' large' : '')} aria-hidden="true"><span>{driver.initials || initialsFor(driver.name)}</span></div>;
}

function DriverBadge({ value, type = 'status' }) {
  const cfg = type === 'license' ? licenseConfig[value] : statusConfig[value];
  const fallback = type === 'license' ? licenseConfig.Valid : statusConfig.Available;
  const active = cfg || fallback;
  return <span className={active.cls}><span className="material-symbols-outlined">{active.icon}</span>{value}</span>;
}

function SafetyScore({ value }) {
  const tone = value >= 90 ? 'excellent' : value >= 80 ? 'good' : value >= 70 ? 'watch' : 'risk';
  return (
    <div className="safety-score">
      <div><span className={tone} style={{ width: value + '%' }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

function DriverCard({ driver, onOpen }) {
  const remaining = daysUntil(driver.expiry);
  return (
    <button type="button" className={'driver-card ' + (isExpiringSoon(driver) ? 'expiring' : '')} onClick={() => onOpen(driver)} aria-label={'Open profile for ' + driver.name}>
      <div className="driver-card-top">
        <DriverPhoto driver={driver} />
        <div>
          <h3>{driver.name}</h3>
          <p>{driver.license}</p>
        </div>
        <DriverBadge value={driver.status} />
      </div>
      <div className="driver-card-metrics">
        <div><span>Safety</span><strong>{driver.safety}</strong></div>
        <div><span>Trips</span><strong>{driver.trips.toLocaleString('en-IN')}</strong></div>
        <div><span>Expiry</span><strong>{formatDate(driver.expiry)}</strong></div>
      </div>
      {isExpiringSoon(driver) && <div className="driver-license-warning"><span className="material-symbols-outlined">priority_high</span>{remaining <= 0 ? 'License action overdue' : 'License expires in ' + remaining + ' days'}</div>}
    </button>
  );
}

function EmptyDrivers() {
  return (
    <div className="vehicle-empty">
      <div className="driver-empty-art"><span className="material-symbols-outlined map">map</span><span className="material-symbols-outlined person">badge</span><i /></div>
      <h3>No drivers match these filters</h3>
      <p>Adjust the search, license status, or safety score filter to restore the roster.</p>
    </div>
  );
}

function DriverProfilePanel({ driver, onClose }) {
  if (!driver) return null;
  const remaining = daysUntil(driver.expiry);
  return (
    <div className="driver-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="driver-profile-panel" role="dialog" aria-modal="true" aria-label="Driver profile" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Driver Profile</p><h2>{driver.name}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close driver profile"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="driver-profile-hero">
          <DriverPhoto driver={driver} large />
          <DriverBadge value={driver.status} />
          <p>{driver.base}</p>
        </div>
        <div className="driver-profile-grid">
          <div><span>License Number</span><strong>{driver.license}</strong></div>
          <div><span>Phone</span><strong>{driver.phone}</strong></div>
          <div><span>Assigned Vehicle</span><strong>{driver.vehicle}</strong></div>
          <div><span>Trips Completed</span><strong>{driver.trips.toLocaleString('en-IN')}</strong></div>
        </div>
        <div className="driver-profile-section">
          <div className="driver-section-head"><h3>Safety Score</h3><strong>{driver.safety}/100</strong></div>
          <SafetyScore value={driver.safety} />
        </div>
        <div className={'driver-profile-section ' + (isExpiringSoon(driver) ? 'license-alert' : '')}>
          <div className="driver-section-head"><h3>License Status</h3><DriverBadge value={driver.licenseStatus} type="license" /></div>
          <p>Expires {formatDate(driver.expiry)}{remaining >= 0 ? ' in ' + remaining + ' days.' : '. Renewal is overdue.'}</p>
        </div>
        <div className="driver-panel-actions"><button type="button" className="transit-btn"><span className="material-symbols-outlined">chat</span>Message</button><button type="button" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">edit_square</span>Edit Profile</button></div>
      </aside>
    </div>
  );
}

function AddDriverDrawer({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', license: '', phone: '', safety: 86, expiry: '2027-01-15', trips: 0, status: 'Available', licenseStatus: 'Valid' });
  if (!open) return null;

  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'safety' || field === 'trips' ? Number(event.target.value) : event.target.value }));
  const submit = event => {
    event.preventDefault();
    onAdd({ ...form, base: 'New Driver Pool', vehicle: 'Unassigned', initials: initialsFor(form.name), tone: 'amber' });
    setForm({ name: '', license: '', phone: '', safety: 86, expiry: '2027-01-15', trips: 0, status: 'Available', licenseStatus: 'Valid' });
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Add driver" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Roster Control</p><h2>Add Driver</h2></div>
          <button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={submit} className="drawer-form">
          <label>Driver Name<input required value={form.name} onChange={set('name')} placeholder="Driver full name" /></label>
          <label>License Number<input required value={form.license} onChange={set('license')} placeholder="DL-KA-0000-0000" /></label>
          <label>Phone<input required value={form.phone} onChange={set('phone')} placeholder="+91 90000 00000" /></label>
          <div className="drawer-grid">
            <label>Status<select value={form.status} onChange={set('status')}>{CURRENT_STATUSES.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>License<select value={form.licenseStatus} onChange={set('licenseStatus')}>{LICENSE_OPTIONS.map(item => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="drawer-grid">
            <label>Expiry Date<input type="date" value={form.expiry} onChange={set('expiry')} /></label>
            <label>Trips Completed<input type="number" min="0" value={form.trips} onChange={set('trips')} /></label>
          </div>
          <label>Safety Score <span>{form.safety}</span><input className="range" type="range" min="0" max="100" value={form.safety} onChange={set('safety')} /></label>
          <div className="drawer-actions"><button type="button" className="transit-btn" onClick={onClose}>Cancel</button><button type="submit" className="transit-btn transit-btn-primary"><span className="material-symbols-outlined">person_add</span>Add Driver</button></div>
        </form>
      </aside>
    </div>
  );
}

const DriverManagement = () => {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [search, setSearch] = useState('');
  const [licenseStatus, setLicenseStatus] = useState('All Licenses');
  const [scoreFilter, setScoreFilter] = useState('All Scores');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const filteredDrivers = useMemo(() => drivers.filter(driver => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [driver.name, driver.license, driver.phone, driver.status, driver.base].some(value => String(value).toLowerCase().includes(query));
    const matchesLicense = licenseStatus === 'All Licenses' || driver.licenseStatus === licenseStatus;
    const matchesScore = scoreMatches(driver.safety, scoreFilter);
    return matchesQuery && matchesLicense && matchesScore;
  }), [drivers, search, licenseStatus, scoreFilter]);

  const featuredDrivers = useMemo(() => {
    const expiring = filteredDrivers.filter(isExpiringSoon);
    return (expiring.length ? expiring : filteredDrivers).slice(0, 3);
  }, [filteredDrivers]);

  const addDriver = driver => {
    const next = { ...driver, id: Date.now() };
    setDrivers(prev => [next, ...prev]);
    setSelectedDriver(next);
    setAddOpen(false);
  };

  return (
    <Layout>
      <main className="transit-shell-main space-y-lg">
        <section className="transit-panel vehicle-toolbar driver-toolbar">
          <div className="vehicle-title-block">
            <p className="transit-eyebrow">Workforce Control</p>
            <h1>Driver Management</h1>
            <span>License health, safety performance, and live assignment readiness across the fleet.</span>
          </div>
          <div className="vehicle-controls driver-controls">
            <label className="vehicle-search" aria-label="Search drivers"><span className="material-symbols-outlined">search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search driver, license, phone" /></label>
            <button type="button" className="transit-btn"><span className="material-symbols-outlined">tune</span>Filters</button>
            <select value={licenseStatus} onChange={event => setLicenseStatus(event.target.value)} aria-label="License status filter">{LICENSE_STATUSES.map(item => <option key={item}>{item}</option>)}</select>
            <select value={scoreFilter} onChange={event => setScoreFilter(event.target.value)} aria-label="Safety score filter">{SCORE_FILTERS.map(item => <option key={item}>{item}</option>)}</select>
            <button type="button" className="transit-btn transit-btn-primary" onClick={() => setAddOpen(true)}><span className="material-symbols-outlined">person_add</span>Add Driver</button>
          </div>
        </section>

        {filteredDrivers.length === 0 ? <section className="transit-panel vehicle-table-card"><EmptyDrivers /></section> : <>
          <section className="driver-feature-grid">
            {featuredDrivers.map(driver => <DriverCard key={driver.id} driver={driver} onOpen={setSelectedDriver} />)}
          </section>

          <section className="transit-panel vehicle-table-card driver-table-card">
            <div className="driver-table-head">
              <div><p className="transit-kicker">Roster Overview</p><h2>Drivers</h2></div>
              <span>{filteredDrivers.length} active records</span>
            </div>
            <div className="vehicle-table-wrap">
              <table className="vehicle-table driver-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>License Number</th>
                    <th>Phone</th>
                    <th>Safety Score</th>
                    <th>License Expiry</th>
                    <th>Trips Completed</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map(driver => (
                    <tr key={driver.id} className={isExpiringSoon(driver) ? 'driver-row-expiring' : ''} onClick={() => setSelectedDriver(driver)}>
                      <td><div className="driver-identity"><DriverPhoto driver={driver} /><div><strong>{driver.name}</strong><span>{driver.base}</span></div></div></td>
                      <td><span className="reg-number">{driver.license}</span><DriverBadge value={driver.licenseStatus} type="license" /></td>
                      <td>{driver.phone}</td>
                      <td><SafetyScore value={driver.safety} /></td>
                      <td><div className="expiry-cell"><strong>{formatDate(driver.expiry)}</strong>{isExpiringSoon(driver) && <span>{daysUntil(driver.expiry)} days left</span>}</div></td>
                      <td>{driver.trips.toLocaleString('en-IN')}</td>
                      <td><DriverBadge value={driver.status} /></td>
                      <td><div className="row-actions"><button type="button" onClick={event => { event.stopPropagation(); setSelectedDriver(driver); }} aria-label={'Open ' + driver.name}><span className="material-symbols-outlined">visibility</span></button><button type="button" onClick={event => event.stopPropagation()} aria-label="More actions"><span className="material-symbols-outlined">more_horiz</span></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="vehicle-pagination"><p>Showing <strong>{filteredDrivers.length}</strong> of <strong>{drivers.length}</strong> drivers</p><div><button className="transit-btn" disabled>Previous</button><span>Page 1 of 1</span><button className="transit-btn" disabled>Next</button></div></div>
          </section>
        </>}
      </main>
      <DriverProfilePanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
      <AddDriverDrawer open={addOpen} onClose={() => setAddOpen(false)} onAdd={addDriver} />
    </Layout>
  );
};

export default DriverManagement;
