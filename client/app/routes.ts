import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

    layout("components/ProtectedRoute.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("employees", "routes/employees.tsx"),
        route("roles", "routes/roles.tsx"),
        route("departments", "routes/departments.tsx"),
        route("payroll/allowances", "routes/payroll/allowances.tsx"),
        route("payroll/deductions", "routes/payroll/deductions.tsx"),
        route("payroll/employee-payroll", "routes/payroll/employee-payroll.tsx"),
        route("attendance/logs", "routes/attendance/logs.tsx"),
        route("leaves", "routes/leaves/index.tsx"),
    ]),
] satisfies RouteConfig;
