/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

// â”€â”€â”€ Hardcoded Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Vendors can also self-register; these are the 4 default accounts.
const SEED_USERS = [
  {
    id: 'USR-001',
    name: 'Arjun Kapoor',
    email: 'admin@transitops.com',
    password: 'Admin@123',
    role: 'admin',
    roleLabel: 'Administrator',
    symbol: 'ðŸ‘‘',
    company: 'TransitOps Control'
  },
  {
    id: 'USR-002',
    name: 'Rahul Sharma',
    email: 'officer@transitops.com',
    password: 'Officer@123',
    role: 'officer',
    roleLabel: 'Procurement Officer',
    symbol: 'ðŸ“‹',
    company: 'TransitOps Control'
  },
  {
    id: 'USR-003',
    name: 'Priya Mehta',
    email: 'manager@transitops.com',
    password: 'Manager@123',
    role: 'manager',
    roleLabel: 'Manager / Approver',
    symbol: 'âœ…',
    company: 'TransitOps Control'
  },
  {
    id: 'USR-004',
    name: 'Infra Supplies Pvt Ltd',
    email: 'vendor@infrasupp.com',
    password: 'Vendor@123',
    role: 'vendor',
    roleLabel: 'Vendor',
    symbol: 'ðŸ­',
    company: 'Infra Supplies Pvt Ltd'
  }
];

// â”€â”€â”€ Default Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const getInitialRegisteredUsers = () => {
  const data = localStorage.getItem('vb_registered_users');
  if (!data) return SEED_USERS;

  try {
    const storedUsers = JSON.parse(data);
    const customUsers = storedUsers.filter(
      user => !SEED_USERS.some(seed => seed.email.toLowerCase() === user.email.toLowerCase())
    );
    return [...SEED_USERS, ...customUsers];
  } catch {
    return SEED_USERS;
  }
};

const defaultVendors = [
  { id: "VND-001", name: "Global Tech Solutions", contact: "amit@globaltech.com", category: "IT Hardware", status: "Active", rating: "4.8", address: "Mumbai, MH" },
  { id: "VND-002", name: "Aura Logistics", contact: "operations@auralogistics.in", category: "Logistics", status: "Active", rating: "4.5", address: "Pune, MH" },
  { id: "VND-003", name: "Swift Supplies Ltd", contact: "sales@swiftsupplies.com", category: "Office Supplies", status: "Active", rating: "4.2", address: "Delhi, NCR" },
  { id: "VND-004", name: "Deepak Industries", contact: "deepak@deepakind.com", category: "Industrial Parts", status: "Active", rating: "4.9", address: "Ahmedabad, GJ" },
  { id: "VND-005", name: "Infra Supplies Pvt Ltd", contact: "vendor@infrasupp.com", category: "Industrial Parts", status: "Active", rating: "4.6", address: "Chennai, TN" }
];

const defaultRFQs = [
  { id: "RFQ-2026-001", title: "Enterprise Laptops (20 units)", category: "IT Hardware", createdDate: "2026-05-15", deadline: "2026-05-30", status: "Closed", description: "Requirement of high performance Core i7, 16GB RAM laptops with 3 years warranty." },
  { id: "RFQ-2026-002", title: "West Zone Freight Distribution", category: "Logistics", createdDate: "2026-06-01", deadline: "2026-06-15", status: "Open", description: "Monthly logistics and freight distribution services for West zone warehouses." },
  { id: "RFQ-2026-003", title: "Bulk Stationary Supplies", category: "Office Supplies", createdDate: "2026-06-04", deadline: "2026-06-20", status: "Open", description: "Annual stationary supply contract for corporate offices." }
];

const defaultQuotations = [
  { id: "QTN-901", rfqId: "RFQ-2026-002", rfqTitle: "West Zone Freight Distribution", vendorId: "VND-002", vendorName: "Aura Logistics", amount: 12800, deliveryDays: 3, terms: "Net 30", status: "Pending", submittedDate: "2026-06-03" },
  { id: "QTN-902", rfqId: "RFQ-2026-002", rfqTitle: "West Zone Freight Distribution", vendorId: "VND-003", vendorName: "Swift Supplies Ltd", amount: 14200, deliveryDays: 5, terms: "Net 15", status: "Pending", submittedDate: "2026-06-04" },
  { id: "QTN-903", rfqId: "RFQ-2026-001", rfqTitle: "Enterprise Laptops (20 units)", vendorId: "VND-001", vendorName: "Global Tech Solutions", amount: 45000, deliveryDays: 7, terms: "Net 30", status: "Approved", submittedDate: "2026-05-20" }
];

const defaultPOs = [
  { id: "PO-2026-001", vendorName: "Global Tech Solutions", amount: 45000, status: "Approved", date: "2026-05-22", items: "Enterprise Laptops x20" },
  { id: "PO-2026-002", vendorName: "Aura Logistics", amount: 12800, status: "Pending Approval", date: "2026-06-03", items: "West Zone Freight Services (1 month)" },
  { id: "PO-2026-003", vendorName: "Swift Supplies Ltd", amount: 8400, status: "Draft", date: "2026-06-05", items: "Office desk sets and folders" },
  { id: "PO-2026-004", vendorName: "Deepak Industries", amount: 125000, status: "Approved", date: "2026-05-28", items: "High precision casting molds" }
];

const defaultInvoices = [
  { id: "INV-2026-001", poId: "PO-2026-001", vendorName: "Global Tech Solutions", amount: 45000, status: "Paid", date: "2026-05-25" },
  { id: "INV-2026-002", poId: "PO-2026-004", vendorName: "Deepak Industries", amount: 125000, status: "Overdue", date: "2026-05-29" },
  { id: "INV-2026-003", poId: "PO-2026-002", vendorName: "Aura Logistics", amount: 12800, status: "Unpaid", date: "2026-06-04" }
];

const defaultApprovals = [
  { id: "APP-001", type: "Quotation Approval", sourceId: "QTN-901", title: "Aura Logistics - West Zone Freight Quote", requester: "Rahul Sharma", amount: 12800, status: "Pending", date: "2026-06-03" },
  { id: "APP-002", type: "Purchase Order", sourceId: "PO-2026-002", title: "Aura Logistics PO Approval", requester: "Rahul Sharma", amount: 12800, status: "Pending", date: "2026-06-03" }
];

const defaultLogs = [
  { id: "LOG-001", user: "Rahul Sharma", action: "Created RFQ-2026-003 Bulk Stationary Supplies", category: "RFQ", timestamp: "2026-06-04T10:15:30Z" },
  { id: "LOG-002", user: "Global Tech Solutions", action: "Submitted quotation QTN-903", category: "Quotation", timestamp: "2026-05-20T14:20:00Z" },
  { id: "LOG-003", user: "Rahul Sharma", action: "Approved PO-2026-001 Global Tech Solutions", category: "Purchase Order", timestamp: "2026-05-22T09:30:15Z" }
];

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const StateProvider = ({ children }) => {
  // Registered accounts (seed + any vendor self-registrations)
  const [registeredUsers, setRegisteredUsers] = useState(getInitialRegisteredUsers);

  const [user, setUser] = useState(() => {
    const data = localStorage.getItem('vb_user');
    return data ? JSON.parse(data) : null;
  });

  const [vendors, setVendors] = useState(() => {
    const data = localStorage.getItem('vb_vendors');
    return data ? JSON.parse(data) : defaultVendors;
  });

  const [rfqs, setRfqs] = useState(() => {
    const data = localStorage.getItem('vb_rfqs');
    return data ? JSON.parse(data) : defaultRFQs;
  });

  const [quotations, setQuotations] = useState(() => {
    const data = localStorage.getItem('vb_quotations');
    return data ? JSON.parse(data) : defaultQuotations;
  });

  const [pos, setPos] = useState(() => {
    const data = localStorage.getItem('vb_pos');
    return data ? JSON.parse(data) : defaultPOs;
  });

  const [invoices, setInvoices] = useState(() => {
    const data = localStorage.getItem('vb_invoices');
    return data ? JSON.parse(data) : defaultInvoices;
  });

  const [approvals, setApprovals] = useState(() => {
    const data = localStorage.getItem('vb_approvals');
    return data ? JSON.parse(data) : defaultApprovals;
  });

  const [logs, setLogs] = useState(() => {
    const data = localStorage.getItem('vb_logs');
    return data ? JSON.parse(data) : defaultLogs;
  });

  // Persist everything
  useEffect(() => { localStorage.setItem('vb_registered_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => { localStorage.setItem('vb_user', user ? JSON.stringify(user) : ''); }, [user]);
  useEffect(() => { localStorage.setItem('vb_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('vb_rfqs', JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem('vb_quotations', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('vb_pos', JSON.stringify(pos)); }, [pos]);
  useEffect(() => { localStorage.setItem('vb_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('vb_approvals', JSON.stringify(approvals)); }, [approvals]);
  useEffect(() => { localStorage.setItem('vb_logs', JSON.stringify(logs)); }, [logs]);

  // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addLog = (action, category = 'System', actorName) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      user: actorName || (user ? user.name : 'System'),
      action,
      category,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const login = (email, password) => {
    const found = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return null;

    const loggedUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      roleLabel: found.roleLabel,
      symbol: found.symbol,
      company: found.company
    };
    setUser(loggedUser);
    addLog(`User logged in: ${loggedUser.name}`, 'Authentication', loggedUser.name);
    return loggedUser;
  };

  const logout = () => {
    addLog(`User logged out: ${user ? user.name : 'Unknown'}`, 'Authentication');
    setUser(null);
  };

  // Vendor self-registration â€” always creates a new account (multiple allowed)
  const registerVendor = (formData) => {
    const newUser = {
      id: `USR-${Date.now()}`,
      name: formData.companyName || formData.fullName,
      email: formData.email,
      password: formData.password || 'Vendor@123',
      role: 'vendor',
      roleLabel: 'Vendor',
      symbol: 'ðŸ­',
      company: formData.companyName || formData.fullName
    };
    setRegisteredUsers(prev => [...prev, newUser]);

    // Also add to vendor list as Pending
    const vendorEntry = {
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      name: formData.companyName || formData.fullName,
      contact: formData.email,
      category: formData.category || 'General',
      status: 'Pending',
      rating: '0.0',
      address: formData.country || ''
    };
    setVendors(prev => [...prev, vendorEntry]);
    addLog(`New vendor registered: ${newUser.name}`, 'Authentication', newUser.name);
    return newUser;
  };

  // Legacy registerCompany (kept for compatibility)
  const registerCompany = (formData) => registerVendor(formData);

  // â”€â”€â”€ Data Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addVendor = (vendor) => {
    const newVendor = { ...vendor, id: `VND-${String(vendors.length + 1).padStart(3, '0')}`, status: 'Active', rating: '5.0' };
    setVendors(prev => [...prev, newVendor]);
    addLog(`Onboarded new vendor: ${newVendor.name}`, 'Vendor');
    return newVendor;
  };

  const updateVendorStatus = (vendorId, newStatus) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v));
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) addLog(`Vendor ${vendor.name} status changed to ${newStatus}`, 'Vendor');
  };

  const addRFQ = (rfq) => {
    const newRFQ = {
      ...rfq,
      id: `RFQ-2026-${String(rfqs.length + 1).padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: rfq.isDraft ? 'Draft' : 'Open'
    };
    setRfqs(prev => [...prev, newRFQ]);
    if (!rfq.isDraft) addLog(`Published RFQ: ${newRFQ.title} â€” sent to ${(rfq.assignedVendors || []).length} vendor(s)`, 'RFQ');
    else addLog(`Saved RFQ as draft: ${newRFQ.title}`, 'RFQ');
    return newRFQ;
  };

  const generateInvoice = (poId) => {
    const po = pos.find(p => p.id === poId);
    if (!po) return null;
    // Check not already invoiced
    const existing = invoices.find(i => i.poId === poId);
    if (existing) return existing;
    const invId = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const gstRate = 0.18;
    const subtotal = po.amount;
    const gstAmount = Math.round(subtotal * gstRate);
    const newInvoice = {
      id: invId, poId: po.id, vendorName: po.vendorName,
      amount: po.amount, subtotal, gstAmount,
      grandTotal: subtotal + gstAmount,
      status: 'Unpaid',
      date: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [...prev, newInvoice]);
    addLog(`Generated Invoice ${invId} for PO ${poId} â€” ${po.vendorName}`, 'Invoice');
    return newInvoice;
  };

  const addQuotation = (quote) => {
    const isDraft = quote.isDraft || false;
    // Check if a draft already exists for this RFQ+vendor â€” update it
    const existingDraftIdx = quotations.findIndex(
      q => q.rfqId === quote.rfqId && q.vendorName === quote.vendorName && q.status === 'Draft'
    );
    if (existingDraftIdx !== -1) {
      const updatedId = quotations[existingDraftIdx].id;
      const updatedQuote = { ...quotations[existingDraftIdx], ...quote, id: updatedId, status: isDraft ? 'Draft' : 'Pending', submittedDate: new Date().toISOString().split('T')[0] };
      setQuotations(prev => prev.map(q => q.id === updatedId ? updatedQuote : q));
      if (!isDraft) {
        addLog(`Submitted quotation for RFQ: ${quote.rfqTitle} by ${quote.vendorName}`, 'Quotation');
        const newApproval = {
          id: `APP-${Date.now()}`,
          type: 'Quotation Approval',
          sourceId: updatedId,
          title: `${quote.vendorName} - ${quote.rfqTitle} Quote`,
          requester: user ? user.name : 'System',
          amount: quote.amount,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
        };
        setApprovals(prev => [newApproval, ...prev]);
      } else {
        addLog(`Saved draft quotation for RFQ: ${quote.rfqTitle}`, 'Quotation');
      }
      return updatedQuote;
    }

    const newQuote = {
      ...quote,
      id: `QTN-${900 + quotations.length + 1}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: isDraft ? 'Draft' : 'Pending'
    };
    setQuotations(prev => [...prev, newQuote]);

    if (!isDraft) {
      addLog(`Submitted quotation for RFQ: ${quote.rfqTitle} by ${quote.vendorName}`, 'Quotation');
      const newApproval = {
        id: `APP-${String(approvals.length + 1).padStart(3, '0')}`,
        type: 'Quotation Approval',
        sourceId: newQuote.id,
        title: `${newQuote.vendorName} - ${newQuote.rfqTitle} Quote`,
        requester: user ? user.name : 'System',
        amount: newQuote.amount,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      setApprovals(prev => [newApproval, ...prev]);
    } else {
      addLog(`Saved draft quotation for RFQ: ${quote.rfqTitle}`, 'Quotation');
    }
    return newQuote;
  };

  const approveQuotation = (quoteId) => {
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Approved' } : q));
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;

    addLog(`Approved quotation ${quoteId} from ${quote.vendorName}`, 'Quotation');

    const poId = `PO-2026-${String(pos.length + 1).padStart(3, '0')}`;
    const newPO = {
      id: poId,
      vendorName: quote.vendorName,
      amount: quote.amount,
      status: 'Pending Approval',
      date: new Date().toISOString().split('T')[0],
      items: `${quote.rfqTitle} - Agreed deliverables`
    };
    setPos(prev => [...prev, newPO]);
    addLog(`Generated Purchase Order: ${poId}`, 'Purchase Order');

    setApprovals(prev => prev.map(a => a.sourceId === quoteId ? { ...a, status: 'Approved' } : a));

    const newPOApproval = {
      id: `APP-${String(approvals.length + 2).padStart(3, '0')}`,
      type: 'Purchase Order',
      sourceId: poId,
      title: `${quote.vendorName} PO Approval`,
      requester: user ? user.name : 'System',
      amount: quote.amount,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setApprovals(prev => [newPOApproval, ...prev]);
  };

  const approveApproval = (approvalId, remark = '') => {
    let targetApproval;
    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        targetApproval = a;
        return { ...a, status: 'Approved', remark, decidedBy: user?.name, decidedAt: new Date().toISOString() };
      }
      return a;
    }));
    if (!targetApproval) return;
    addLog(`Approved ${targetApproval.type}: ${targetApproval.title}${remark ? ` â€” "${remark}"` : ''}`, 'Approvals');
    if (targetApproval.type === 'Quotation Approval') {
      approveQuotation(targetApproval.sourceId);
    } else if (targetApproval.type === 'Purchase Order') {
      const poId = targetApproval.sourceId;
      setPos(prev => prev.map(p => p.id === poId ? { ...p, status: 'Approved' } : p));
      const po = pos.find(p => p.id === poId);
      if (po) {
        const invId = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
        const subtotal = po.amount;
        const gstAmount = Math.round(subtotal * 0.18);
        const newInvoice = {
          id: invId, poId: po.id, vendorName: po.vendorName,
          amount: po.amount, subtotal, gstAmount,
          grandTotal: subtotal + gstAmount,
          status: 'Unpaid',
          date: new Date().toISOString().split('T')[0]
        };
        setInvoices(prev => [...prev, newInvoice]);
        addLog(`Auto-generated Invoice ${invId} after PO approval`, 'Invoice');
      }
    }
  };

  const rejectApproval = (approvalId, remark = '') => {
    let targetApproval;
    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        targetApproval = a;
        return { ...a, status: 'Rejected', remark, decidedBy: user?.name, decidedAt: new Date().toISOString() };
      }
      return a;
    }));
    if (!targetApproval) return;
    addLog(`Rejected ${targetApproval.type}: ${targetApproval.title}${remark ? ` â€” Reason: "${remark}"` : ''}`, 'Approvals');

    if (targetApproval.type === 'Quotation Approval') {
      // Reset quotation back to 'Pending' so officer can re-select from comparison
      setQuotations(prev => prev.map(q =>
        q.id === targetApproval.sourceId
          ? { ...q, status: 'Pending', rejectionRemark: remark, rejectedBy: user?.name, rejectedAt: new Date().toISOString() }
          : q
      ));
      // Create a "Returned" notification visible to the officer
      const returnNotif = {
        id: `RET-${Date.now()}`,
        type: 'Returned to Officer',
        sourceId: targetApproval.sourceId,
        rfqId: (() => { const q = quotations.find(q => q.id === targetApproval.sourceId); return q ? q.rfqId : ''; })(),
        rfqTitle: (() => { const q = quotations.find(q => q.id === targetApproval.sourceId); return q ? q.rfqTitle : ''; })(),
        title: `${targetApproval.title} â€” Returned`,
        requester: targetApproval.requester,
        amount: targetApproval.amount,
        status: 'Action Required',
        rejectionRemark: remark,
        rejectedBy: user?.name,
        date: new Date().toISOString().split('T')[0],
      };
      setApprovals(prev => [returnNotif, ...prev]);
      addLog(`Quotation returned to officer for revision. Reason: "${remark}"`, 'Approvals');
    } else if (targetApproval.type === 'Purchase Order') {
      setPos(prev => prev.map(p =>
        p.id === targetApproval.sourceId
          ? { ...p, status: 'Rejected', rejectionRemark: remark, rejectedBy: user?.name }
          : p
      ));
    }
  };

  const payInvoice = (invoiceId) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'Paid' } : i));
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) addLog(`Paid Invoice ${invoiceId} of amount â‚¹${inv.amount}`, 'Invoice');
  };

  // Officer dismisses a "Returned to Officer" notification after reading
  const dismissReturnNotif = (notifId) => {
    setApprovals(prev => prev.map(a =>
      a.id === notifId ? { ...a, status: 'Dismissed' } : a
    ));
  };

  // Officer resubmits the same quotation after addressing the rejection
  const resubmitForApproval = (quoteId) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;
    // Clear rejection metadata from quotation
    setQuotations(prev => prev.map(q =>
      q.id === quoteId
        ? { ...q, status: 'Pending', rejectionRemark: null, rejectedBy: null, rejectedAt: null }
        : q
    ));
    // Dismiss any active "Returned" notification for this quote
    setApprovals(prev => prev.map(a =>
      a.type === 'Returned to Officer' && a.sourceId === quoteId ? { ...a, status: 'Dismissed' } : a
    ));
    // Create a brand-new Quotation Approval for the manager
    const newApproval = {
      id: `APP-${Date.now()}`,
      type: 'Quotation Approval',
      sourceId: quoteId,
      title: `${quote.vendorName} - ${quote.rfqTitle} Quote (Resubmitted)`,
      requester: user ? user.name : 'System',
      amount: quote.amount,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      isResubmission: true,
    };
    setApprovals(prev => [newApproval, ...prev]);
    addLog(`Officer resubmitted quotation ${quoteId} for manager approval`, 'Approvals');
    return newApproval;
  };

  // â”€â”€â”€ User Management (Admin only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updateUserRole = (userId, newRole, newRoleLabel, newSymbol) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: newRole, roleLabel: newRoleLabel, symbol: newSymbol } : u
    ));
    const target = registeredUsers.find(u => u.id === userId);
    if (target) addLog(`Admin changed role of ${target.name} to ${newRoleLabel}`, 'System');
  };

  const deactivateUser = (userId) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'Inactive' ? 'Active' : 'Inactive' } : u
    ));
    const target = registeredUsers.find(u => u.id === userId);
    if (target) {
      const newStatus = target.status === 'Inactive' ? 'Active' : 'Inactive';
      addLog(`Admin ${newStatus === 'Inactive' ? 'deactivated' : 'reactivated'} user ${target.name}`, 'System');
    }
  };

  const resetUserPassword = (userId, newPassword) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    const target = registeredUsers.find(u => u.id === userId);
    if (target) addLog(`Admin reset password for ${target.name}`, 'System');
  };

  return (
    <StateContext.Provider value={{
      user, registeredUsers, vendors, rfqs, quotations, pos, invoices, approvals, logs,
      login, logout, registerVendor, registerCompany,
      addVendor, updateVendorStatus, addRFQ, generateInvoice, addQuotation,
      approveQuotation, approveApproval, rejectApproval, payInvoice,
      dismissReturnNotif, resubmitForApproval,
      updateUserRole, deactivateUser, resetUserPassword
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);


