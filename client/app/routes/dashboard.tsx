import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Users, ShieldCheck, Building2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Calculate permissions
    const userRoles = user?.roles || [];
    const hasPermission = (resource: string) => userRoles.some((r: any) =>
        r.resourcePermissions?.find((p: any) => p.resource === resource)?.canView
    );

    const canViewDashboard = hasPermission('Dashboard');
    const canViewEmployees = hasPermission('Employees');
    const canViewRoles = hasPermission('Roles');
    const canViewDepartments = hasPermission('Departments');

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            if (!canViewDashboard) {
                setLoading(false);
                return;
            }

            try {
                const requests = [];
                if (canViewEmployees) requests.push(axios.get('http://localhost:5000/api/employees', config).catch(e => ({ data: [], error: true })));
                else requests.push(Promise.resolve({ data: [] }));

                if (canViewRoles) requests.push(axios.get('http://localhost:5000/api/roles', config).catch(e => ({ data: [], error: true })));
                else requests.push(Promise.resolve({ data: [] }));

                if (canViewDepartments) requests.push(axios.get('http://localhost:5000/api/departments', config).catch(e => ({ data: [], error: true })));
                else requests.push(Promise.resolve({ data: [] }));

                const [empRes, roleRes, deptRes] = await Promise.all(requests);

                setEmployees(empRes.data || []);
                setRoles(roleRes.data || []);
                setDepartments(deptRes.data || []);
            } catch (error) {
                console.error('Error fetching dashboard data', error);
                setErrorMsg('Failed to fetch dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, canViewDashboard, canViewEmployees, canViewRoles, canViewDepartments]);

    if (!canViewDashboard) {
        return <div className="p-8 text-center text-red-500 font-semibold">You do not have permission to view the dashboard.</div>;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 font-medium">Loading dashboard data...</div>
            </div>
        );
    }

    if (errorMsg) {
        return <div className="p-8 text-center text-red-500 font-semibold">{errorMsg}</div>;
    }

    // Process data for charts
    const employeesByRole = roles.map((role: any) => {
        const count = employees.filter((emp: any) => emp.role && (emp.role._id === role._id || emp.role === role._id)).length;
        return { name: role.name, count };
    });

    const employeesByDepartment = employees.reduce((acc: any, emp: any) => {
        const deptName = emp.department?.name || emp.department || 'Unknown';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
    }, {});

    const deptData = Object.keys(employeesByDepartment).map((dept) => ({
        name: dept,
        value: employeesByDepartment[dept],
    }));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{user?.username}</span></div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Employees</p>
                        <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Roles</p>
                        <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                        <Building2 className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Departments</p>
                        <p className="text-3xl font-bold text-gray-900">{departments.length || Object.keys(employeesByDepartment).length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Employees by Role Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Staff Distribution by Role</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={employeesByRole}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Employees" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employees by Department Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Department Allocation</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deptData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deptData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

