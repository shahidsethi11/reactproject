import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Check, X, Clock, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function LeaveManagement() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Permissions
    const checkPermission = (action: 'canView' | 'canSave' | 'canEdit') => {
        return user?.roles?.some((role: any) =>
            role.resourcePermissions?.find((p: any) => p.resource === 'Leaves')?.[action]
        );
    };

    const canRequest = checkPermission('canSave');
    const canApprove = checkPermission('canEdit');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/leaves', config);
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching leaves', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/leaves', formData, config);
            setShowModal(false);
            fetchRequests();
            setFormData({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
        } catch (error) {
            console.error('Error submitting leave', error);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/leaves/${id}/status`, { status }, config);
            fetchRequests();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
                        Leave Administration
                    </h1>
                    <p className="text-gray-500 font-medium ml-6 mt-1 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                        Time-Off Workflow Management
                    </p>
                </div>

                {canRequest && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full md:w-auto flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Initialize Request
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Synchronizing with Workforce API...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-200" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Queue Empty</p>
                            <p className="text-gray-400 text-xs mt-1">No pending or historical leave records found.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((req: any) => (
                            <div key={req._id} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100/30 border border-gray-100 flex flex-col hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg shadow-sm group-hover:rotate-6 transition-transform">
                                            {req.employee?.firstName?.[0]}{req.employee?.lastName?.[0]}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-black text-gray-900 text-base tracking-tight">{req.employee?.firstName} {req.employee?.lastName}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.employee?.position}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${getStatusStyles(req.status)}`}>
                                        {req.status}
                                    </span>
                                </div>

                                <div className="bg-gray-50/50 rounded-2xl p-5 mb-6 space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <span>Leave Classification</span>
                                        <span className="text-indigo-600 font-black">{req.leaveType}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</span>
                                            <div className="flex items-center text-xs font-black text-gray-700">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                                                {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-start">
                                            <FileText className="w-3.5 h-3.5 mr-2 text-gray-300 mt-0.5 shrink-0" />
                                            <p className="text-xs text-gray-500 font-medium italic line-clamp-2">"{req.reason}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    {canApprove && req.status === 'Pending' ? (
                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <button
                                                onClick={() => handleStatusUpdate(req._id, 'Approved')}
                                                className="flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                                            >
                                                <Check className="w-3 h-3 mr-2" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                                                className="flex items-center justify-center px-4 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                                            >
                                                <X className="w-3 h-3 mr-2" /> Decline
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pt-4 flex items-center justify-between">
                                            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <AlertCircle className="w-3 h-3 mr-2" />
                                                Audit Log Available
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                By: {req.approvedBy?.username || 'Auto-System'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Leave Request Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_32px_128px_-15px_rgba(0,0,0,0.3)] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Time-Off Proposal</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Official Resource Management</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:rotate-90 transition-all duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Leave Classification</label>
                                <select
                                    className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition bg-gray-50 font-black text-gray-700 text-sm appearance-none cursor-pointer"
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                >
                                    {['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid'].map(t => (
                                        <option key={t} value={t}>{t} Leave Protocol</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period Start</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition bg-gray-50 font-black text-gray-700 text-sm shadow-sm"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period Termination</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition bg-gray-50 font-black text-gray-700 text-sm shadow-sm"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Justification Brief</label>
                                <textarea
                                    required
                                    className="w-full border border-gray-100 rounded-2xl p-5 focus:ring-4 focus:ring-indigo-500/10 outline-none transition bg-gray-50 min-h-[140px] font-medium text-gray-600 text-sm shadow-sm resize-none"
                                    placeholder="Please provide the contextual rationale for this resource unavailability..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                                >
                                    Transmit Proposal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
