import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Users, ShieldCheck, LogOut, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const checkResourceAccess = (resource: string) => {
        return user?.roles?.some((role: any) =>
            role.resourcePermissions?.find((p: any) => p.resource === resource)?.canView
        );
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: checkResourceAccess('Dashboard') },
        { name: 'Employees', path: '/employees', icon: Users, show: checkResourceAccess('Employees') },
        { name: 'Departments', path: '/departments', icon: Building2, show: checkResourceAccess('Departments') },
        { name: 'Roles', path: '/roles', icon: ShieldCheck, show: checkResourceAccess('Roles') },
    ].filter(item => item.show);

    return (
        <div className={`flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-blue-600 text-white rounded-full p-1.5 shadow-lg hover:bg-blue-700 transition-colors z-50 border-2 border-white"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} h-20 border-b border-gray-800 shrink-0`}>
                {isCollapsed ? (
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">A</div>
                ) : (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg text-white">A</div>
                        <h1 className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">Panel</span></h1>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 w-full text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all duration-200 group`}
                >
                    <LogOut className={`w-5 h-5 transition-colors ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
