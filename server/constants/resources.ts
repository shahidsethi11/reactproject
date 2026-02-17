export const RESOURCE_NAMES = {
    EMPLOYEES: 'Employees',
    ROLES: 'Roles',
    DASHBOARD: 'Dashboard',
    DEPARTMENTS: 'Departments',
    PAYROLL: 'Payroll'
} as const;

export const RESOURCES = Object.values(RESOURCE_NAMES);
