import { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { driversAPI } from '../api/drivers';

const LICENSE_STATUSES = ['All Licenses', 'Valid', 'Expiring Soon', 'Expired'];
const SCORE_FILTERS = ['All Scores', '90+ Excellent', '80-89 Good', '70-79 Watchlist', 'Below 70'];
const CURRENT_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
const LICENSE_CATEGORIES = ['Heavy Duty', 'Light Commercial', 'Passenger Bus', 'Medium Truck'];

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
};

function scoreMatches(score, filter) {
  if (filter === '90+ Excellent') return score >= 90;
  if (filter === '80-89 Good') return score >= 80 && score <= 89;
  if (filter === '70-79 Watchlist') return score >= 70 && score <= 79;
  if (filter === 'Below 70') return score < 70;
  return true;
}

function initialsFor(name) {
  if (!name) return 'DR';
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function daysUntil(dateString) {
  if (!dateString) return 0;
  const today = new Date('2026-07-12T00:00:00');
  const expiry = new Date(dateString.split('T')[0] + 'T00:00:00');
  return Math.ceil((expiry - today) / 86400000);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString.split('T')[0] + 'T00:00:00'));
  } catch (e) {
    return 'N/A';
  }
}

function getLicenseStatus(expiryDate) {
  const days = daysUntil(expiryDate);
  if (days < 0) return 'Expired';
  if (days <= 45) return 'Expiring Soon';
  return 'Valid';
}

function isExpiringSoon(driver) {
  const remaining = daysUntil(driver.licenseExpiryDate);
  return remaining >= 0 && remaining <= 45;
}

function getTone(status) {
  if (status === 'Suspended') return 'red';
  if (status === 'On Trip') return 'blue';
  if (status === 'Off Duty') return 'amber';
  return 'green';
}

function DriverPhoto({ driver, large = false }) {
  const tone = getTone(driver.status);
  const initials = initialsFor(driver.name);
  return <div className={'driver-photo ' + tone + (large ? ' large' : '')} aria-hidden="true"><span>{initials}</span></div>;
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
  const remaining = daysUntil(driver.licenseExpiryDate);
  return (
    <button type="button" className={'driver-card ' + (isExpiringSoon(driver) ? 'expiring' : '')} onClick={() => onOpen(driver)} aria-label={'Open profile for ' + driver.name}>
      <div className="driver-card-top">
        <DriverPhoto driver={driver} />
        <div>
          <h3>{driver.name}</h3>
          <p>{driver.licenseNumber}</p>
        </div>
        <DriverBadge value={driver.status} />
      </div>
      <div className="driver-card-metrics">
        <div><span>Safety</span><strong>{driver.safetyScore}</strong></div>
        <div><span>Category</span><strong>{driver.licenseCategory}</strong></div>
        <div><span>Expiry</span><strong>{formatDate(driver.licenseExpiryDate)}</strong></div>
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

function DriverProfilePanel({ driver, onClose, onDelete }) {
  if (!driver) return null;
  const remaining = daysUntil(driver.licenseExpiryDate);
  const licStatus = getLicenseStatus(driver.licenseExpiryDate);
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
          <p>{driver.region || 'Regional Depot'}</p>
        </div>
        <div className="driver-profile-grid">
          <div><span>License Number</span><strong>{driver.licenseNumber}</strong></div>
          <div><span>Phone</span><strong>{driver.contactNumber}</strong></div>
          <div><span>License Category</span><strong>{driver.licenseCategory}</strong></div>
          <div><span>Region</span><strong>{driver.region || 'N/A'}</strong></div>
        </div>
        <div className="driver-profile-section">
          <div className="driver-section-head"><h3>Safety Score</h3><strong>{driver.safetyScore}/100</strong></div>
          <SafetyScore value={driver.safetyScore} />
        </div>
        <div className={'driver-profile-section ' + (isExpiringSoon(driver) ? 'license-alert' : '')}>
          <div className="driver-section-head"><h3>License Status</h3><DriverBadge value={licStatus} type="license" /></div>
          <p>Expires {formatDate(driver.licenseExpiryDate)}{remaining >= 0 ? ' in ' + remaining + ' days.' : '. Renewal is overdue.'}</p>
        </div>
        <div className="driver-panel-actions">
          <button type="button" className="transit-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,.3)' }} onClick={() => onDelete(driver._id)}>
            <span className="material-symbols-outlined">delete</span>Delete Profile
          </button>
          <button type="button" className="transit-btn transit-btn-primary" onClick={onClose}>
            <span className="material-symbols-outlined">done</span>Done
          </button>
        </div>
      </aside>
    </div>
  );
}

function AddDriverDrawer({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', licenseNumber: '', contactNumber: '', licenseCategory: 'Heavy Duty', safetyScore: 90, licenseExpiryDate: '2028-12-31', status: 'Available', region: 'North' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const set = field => event => setForm(prev => ({ ...prev, [field]: field === 'safetyScore' ? Number(event.target.value) : event.target.value }));
  
  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await driversAPI.create(form);
      onAdd(response.driver || response);
      setForm({ name: '', licenseNumber: '', contactNumber: '', licenseCategory: 'Heavy Duty', safetyScore: 90, licenseExpiryDate: '2028-12-31', status: 'Available', region: 'North' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create driver profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="vehicle-drawer" role="dialog" aria-modal="true" aria-label="Add driver" onMouseDown={event => event.stopPropagation()}>
        <div className="drawer-head">
          <div><p className="transit-kicker">Roster Control</p><h2>Add Driver</h2></div>
          <button type="button" onClick={onClose} aria-label="Close drawer"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={submit} className="drawer-form">
          {error && <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}
          <label>Driver Name<input required value={form.name} onChange={set('name')} placeholder="Driver full name" /></label>
          <label>License Number<input required value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="DL-KA-0000-0000" /></label>
          <label>Phone Number<input required value={form.contactNumber} onChange={set('contactNumber')} placeholder="+91 90000 00000" /></label>
          <div className="drawer-grid">
            <label>License Category<select value={form.licenseCategory} onChange={set('licenseCategory')}>{LICENSE_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={set('status')}>{CURRENT_STATUSES.map(item => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="drawer-grid">
            <label>Expiry Date<input type="date" required value={form.licenseExpiryDate} onChange={set('licenseExpiryDate')} /></label>
            <label>Region<input value={form.region} onChange={set('region')} placeholder="North / West" /></label>
          </div>
          <label>Safety Score <span>{form.safetyScore}</span><input className="range" type="range" min="0" max="100" value={form.safetyScore} onChange={set('safetyScore')} /></label>
          <div className="drawer-actions"><button type="button" className="transit-btn" onClick={onClose}>Cancel</button><button type="submit" className="transit-btn transit-btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Driver'}</button></div>
        </form>
      </aside>
    </div>
  );
}

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [licenseStatus, setLicenseStatus] = useState('All Licenses');
  const [scoreFilter, setScoreFilter] = useState('All Scores');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driversAPI.getAll();
      setDrivers(data?.drivers || data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load drivers list');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = useMemo(() => drivers.filter(driver => {
    const query = search.trim().toLowerCase();
    const licStatus = getLicenseStatus(driver.licenseExpiryDate);
    const matchesQuery = !query || [driver.name, driver.licenseNumber, driver.contactNumber, driver.status, driver.region].some(value => String(value || '').toLowerCase().includes(query));
    const matchesLicense = licenseStatus === 'All Licenses' || licStatus === licenseStatus;
    const matchesScore = scoreMatches(driver.safetyScore, scoreFilter);
    return matchesQuery && matchesLicense && matchesScore;
  }), [drivers, search, licenseStatus, scoreFilter]);

  const featuredDrivers = useMemo(() => {
    const expiring = filteredDrivers.filter(isExpiringSoon);
    return (expiring.length ? expiring : filteredDrivers).slice(0, 3);
  }, [filteredDrivers]);

  const addDriver = driver => {
    setDrivers(prev => [driver, ...prev]);
    setSelectedDriver(driver);
    setAddOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver profile? This action cannot be undone.')) return;
    try {
      await driversAPI.delete(id);
      setDrivers(prev => prev.filter(d => d._id !== id));
      setSelectedDriver(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete driver');
    }
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
            <select value={licenseStatus} onChange={event => setLicenseStatus(event.target.value)} aria-label="License status filter">{LICENSE_STATUSES.map(item => <option key={item}>{item}</option>)}</select>
            <select value={scoreFilter} onChange={event => setScoreFilter(event.target.value)} aria-label="Safety score filter">{SCORE_FILTERS.map(item => <option key={item}>{item}</option>)}</select>
            <button type="button" className="transit-btn transit-btn-primary" onClick={() => setAddOpen(true)}><span className="material-symbols-outlined">person_add</span>Add Driver</button>
          </div>
        </section>

        {loading ? (
          <section className="transit-panel vehicle-table-card" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading driver roster...</p>
          </section>
        ) : error ? (
          <div className="auth-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>
        ) : filteredDrivers.length === 0 ? (
          <section className="transit-panel vehicle-table-card"><EmptyDrivers /></section>
        ) : (
          <>
            <section className="driver-feature-grid">
              {featuredDrivers.map(driver => <DriverCard key={driver._id} driver={driver} onOpen={setSelectedDriver} />)}
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
                      <th>License Category</th>
                      <th>Current Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.map(driver => {
                      const licStatus = getLicenseStatus(driver.licenseExpiryDate);
                      return (
                        <tr key={driver._id} className={isExpiringSoon(driver) ? 'driver-row-expiring' : ''} onClick={() => setSelectedDriver(driver)}>
                          <td><div className="driver-identity"><DriverPhoto driver={driver} /><div><strong>{driver.name}</strong><span>{driver.region || 'Regional Depot'}</span></div></div></td>
                          <td><span className="reg-number">{driver.licenseNumber}</span><DriverBadge value={licStatus} type="license" /></td>
                          <td>{driver.contactNumber}</td>
                          <td><SafetyScore value={driver.safetyScore} /></td>
                          <td><div className="expiry-cell"><strong>{formatDate(driver.licenseExpiryDate)}</strong>{isExpiringSoon(driver) && <span>{daysUntil(driver.licenseExpiryDate)} days left</span>}</div></td>
                          <td>{driver.licenseCategory}</td>
                          <td><DriverBadge value={driver.status} /></td>
                          <td><div className="row-actions"><button type="button" onClick={event => { event.stopPropagation(); setSelectedDriver(driver); }} aria-label={'Open ' + driver.name}><span className="material-symbols-outlined">visibility</span></button><button type="button" onClick={event => { event.stopPropagation(); handleDelete(driver._id); }} style={{ color: '#fca5a5' }} aria-label="Delete driver"><span className="material-symbols-outlined">delete</span></button></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="vehicle-pagination"><p>Showing <strong>{filteredDrivers.length}</strong> of <strong>{drivers.length}</strong> drivers</p><div><button className="transit-btn" disabled>Previous</button><span>Page 1 of 1</span><button className="transit-btn" disabled>Next</button></div></div>
            </section>
          </>
        )}
      </main>
      <DriverProfilePanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} onDelete={handleDelete} />
      <AddDriverDrawer open={addOpen} onClose={() => setAddOpen(false)} onAdd={addDriver} />
    </Layout>
  );
};

export default DriverManagement;
