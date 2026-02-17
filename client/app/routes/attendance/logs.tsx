import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, UserCheck, Calendar, Filter, Save, AlertCircle } from 'lucide-react';

export default function AttendanceLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Permissions
    const checkPermission = (action: 'canView' | 'canSave' | 'canEdit') => {
        return user?.roles?.some((role: any) =>
            role.resourcePermissions?.find((p: any) => p.resource === 'Attendance')?.[action]
        );
    };

    const canSync = checkPermission('canSave');
    const canEdit = checkPermission('canEdit');

    useEffect(() => {
        fetchLogs();
    }, [selectedDate]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/attendance?date=${selectedDate}`, config);
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setMessage(null);
        try {
            const res = await axios.post('http://localhost:5000/api/attendance/sync', {}, config);
            setMessage({ type: 'success', text: res.data.message });
            fetchLogs();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to sync with machine' });
        } finally {
            setSyncing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-emerald-100 text-emerald-700';
            case 'Late': return 'bg-amber-100 text-amber-700';
            case 'Absent': return 'bg-rose-100 text-rose-700';
            case 'On Leave': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
                        Attendance Registry
                    </h1>
                    <p className="text-gray-500 font-medium ml-6 mt-1 flex items-center">
                        <RefreshCw className="w-3.5 h-3.5 mr-2 text-blue-400" />
                        Live Synchronized Records
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <input
                            type="date"
                            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-700"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    {canSync && (
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className={`flex items-center justify-center px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] shadow-2xl ${syncing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing Logs...' : 'Machine Sync'}
                        </button>
                    )}
                </div>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center animate-in slide-in-from-top-4 duration-300 border-l-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'bg-rose-50 text-rose-700 border-rose-500'
                    }`}>
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Employee Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Machine Reference</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp Session</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Outcome</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Observations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Polling Secure Server...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
                                                <Calendar className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase text-[10px] tracking-widest">No Activity Logged</p>
                                                <p className="text-gray-400 text-xs mt-1">No biometric signals detected for the selected period.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-sm mr-4 shadow-sm group-hover:scale-110 transition-transform">
                                                    {log.employee?.firstName?.[0]}{log.employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm tracking-tight">{log.employee?.firstName} {log.employee?.lastName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.employee?.position}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 tracking-wider">
                                                BIO: {log.employee?.biometricId || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                                        <span className="text-xs font-black text-gray-700">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
                                                        <span className="text-xs font-black text-gray-700">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                    Total: {log.workHours} Active Hours
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center text-xs text-gray-500 font-medium italic max-w-[180px]">
                                                <Filter className="w-3 h-3 mr-2 text-gray-300" />
                                                <span className="truncate">{log.notes || 'Routine Entry'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hardware Status Footer */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-200">
                <div className="p-5 bg-white/20 backdrop-blur-md rounded-[1.5rem] border border-white/30">
                    <RefreshCw className="w-8 h-8 animate-spin-slow text-white" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-black tracking-tight mb-2">Biometric Infrastructure Online</h3>
                    <p className="text-blue-100 font-medium text-sm leading-relaxed max-w-2xl">
                        Universal synchronization active. The ZKTeco BioStation 2 system is communicating securely at 192.168.1.150. All biometric authentication triggers are being captured in real-time.
                    </p>
                </div>
                <div className="ml-auto">
                    <div className="px-6 py-3 bg-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/40">
                        Stable Connection
                    </div>
                </div>
            </div>
        </div>
    );
}
