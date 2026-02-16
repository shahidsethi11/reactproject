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
    ]),
] satisfies RouteConfig;
