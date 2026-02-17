export const RESOURCE_NAMES = {
    EMPLOYEES: 'Employees',
    ROLES: 'Roles',
    DASHBOARD: 'Dashboard',
    DEPARTMENTS: 'Departments',
    PAYROLL: 'Payroll',
    ATTENDANCE: 'Attendance',
    LEAVES: 'Leaves'
} as const;

export const RESOURCES = Object.values(RESOURCE_NAMES);
