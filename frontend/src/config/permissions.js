export const ROLES = {
  ADMIN: 'Admin',
  FLEET_MANAGER: 'FleetManager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'SafetyOfficer',
  FINANCIAL_ANALYST: 'FinancialAnalyst',
};

export const ROUTE_ACCESS = {
  '/dashboard': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST],
  '/vehicles': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST],
  '/drivers': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],
  '/trips': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.SAFETY_OFFICER],
  '/maintenance': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],
  '/expenses': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST, ROLES.DRIVER],
  '/analytics': [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.FLEET_MANAGER]: '/dashboard',
  [ROLES.DRIVER]: '/trips',
  [ROLES.SAFETY_OFFICER]: '/drivers',
  [ROLES.FINANCIAL_ANALYST]: '/expenses',
};

export const ACTION_ACCESS = {
  vehicles: {
    manage: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  },
  drivers: {
    edit: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],
    delete: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  },
  trips: {
    manage: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER],
  },
  maintenance: {
    manage: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],
  },
  finance: {
    logFuel: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.FINANCIAL_ANALYST],
    logExpense: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
  },
  reports: {
    exportCSV: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
  }
};

export const hasActionAccess = (role, resource, action) => {
  return ACTION_ACCESS[resource]?.[action]?.includes(role) || false;
};

export const hasRouteAccess = (role, route) => {
  return ROUTE_ACCESS[route]?.includes(role) || false;
};
