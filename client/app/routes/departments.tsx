import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

export default function Departments() {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Calculate permissions for 'Departments' resource
    const userRoles = user?.roles || [];
    const getPerm = (action: string) => userRoles.some((r: any) =>
        r.resourcePermissions?.find((p: any) => p.resource === 'Departments')?.[action]
    );

    const canView = getPerm('canView');
    const canEdit = getPerm('canEdit');
    const canDelete = getPerm('canDelete');
    const canSave = getPerm('canSave');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (canView) fetchData();
    }, [canView]);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/departments', config);
            setDepartments(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching departments', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/departments/${editingId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/departments', formData, config);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving department', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await axios.delete(`http://localhost:5000/api/departments/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting department', error);
            }
        }
    };

    const handleEdit = (dept: any) => {
        setFormData({
            name: dept.name,
            description: dept.description || '',
        });
        setEditingId(dept._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
        });
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Departments...</div>;

    if (!canView) {
        return <div className="p-8 text-center text-red-500 font-semibold">You do not have permission to view departments.</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center italic">
                        <span className="w-2 h-10 bg-blue-600 rounded-full mr-5 shadow-lg shadow-blue-100"></span>
                        Structural Units
                    </h1>
                    <p className="text-gray-500 font-bold ml-7 mt-1 tracking-wide flex items-center uppercase text-[10px]">
                        Corporate Ecosystem & Departmental Hierarchy
                    </p>
                </div>
                {canSave && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center justify-center px-12 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 transition-all active:scale-[0.98] shadow-2xl shadow-blue-100 group"
                    >
                        <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                        Establish Unit
                    </button>
                )}
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {departments.map((dept: any) => (
                    <div key={dept._id} className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>

                        <div className="relative flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                {canEdit && (
                                    <button onClick={() => handleEdit(dept)} className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={() => handleDelete(dept._id)} className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="relative space-y-3">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                            <div className="w-8 h-1 bg-gray-100 rounded-full group-hover:w-16 transition-all duration-500 group-hover:bg-blue-400"></div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3 italic">
                                {dept.description || 'This strategic unit facilitates operational excellence within the corporate framework.'}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">UNIT_AUTH_ID: {dept._id.slice(-6).toUpperCase()}</span>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xl overflow-y-auto h-full w-full flex items-center justify-center z-50 p-6 sm:p-12">
                    <div className="bg-white rounded-[3rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] w-full max-w-xl animate-in fade-in zoom-in duration-300">
                        <div className="p-10 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center">
                                <span className="w-2 h-7 bg-blue-600 rounded-full mr-3 shadow-lg shadow-blue-100"></span>
                                {editingId ? 'Modify Unit Parameters' : 'Establish New Architecture'}
                            </h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-5 leading-loose">Internal Organization Management Control</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Departmental Alias</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="e.g. CORE_ENGINEERING"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 pl-14 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-bold text-gray-800"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Mission Statement / Description</label>
                                <textarea
                                    placeholder="Define the strategic objectives for this structural unit..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-bold text-gray-800 min-h-[150px] resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-10 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-blue-600 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-700 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                                >
                                    {editingId ? 'Push Synchronization' : 'Commit Architecture'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
