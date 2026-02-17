import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users, Lock } from 'lucide-react';

const ACTIONS = [
    { id: 'canView', label: 'View' },
    { id: 'canSave', label: 'Save' },
    { id: 'canEdit', label: 'Edit' },
    { id: 'canDelete', label: 'Delete' },
];

export default function Roles() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [availableResources, setAvailableResources] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        resourcePermissions: [] as any[]
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (user && !user.roles.some((r: any) => r.name === 'Admin')) {
            navigate('/dashboard');
        } else {
            fetchData();
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [roleRes, resRes] = await Promise.all([
                axios.get('http://localhost:5000/api/roles', config),
                axios.get('http://localhost:5000/api/roles/resources', config)
            ]);
            setRoles(roleRes.data);
            setAvailableResources(resRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/roles/${editingId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/roles', formData, config);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving role', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/roles/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting role', error);
            }
        }
    };

    const handleEdit = (role: any) => {
        // Map existing permissions or initialize with defaults from dynamic availableResources
        const resourcePermissions = availableResources.map(res => {
            const existing = role.resourcePermissions?.find((p: any) => p.resource === res);
            return existing || { resource: res, canView: false, canSave: false, canEdit: false, canDelete: false };
        });

        setFormData({
            name: role.name,
            description: role.description,
            resourcePermissions
        });
        setEditingId(role._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            resourcePermissions: availableResources.map(res => ({
                resource: res,
                canView: false,
                canSave: false,
                canEdit: false,
                canDelete: false
            }))
        });
        setEditingId(null);
    };

    const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            resourcePermissions: prev.resourcePermissions.map(p =>
                p.resource === resource ? { ...p, [action]: checked } : p
            )
        }));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Roles & Permissions...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
                        <span className="w-2 h-10 bg-indigo-600 rounded-full mr-5"></span>
                        Access Protocols
                    </h1>
                    <p className="text-gray-500 font-bold ml-7 mt-1 tracking-wide flex items-center uppercase text-[10px]">
                        Corporate Authority & Role Definitions
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center justify-center px-12 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100 group"
                >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                    Forge Identity
                </button>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-left border-b border-gray-50">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Credential Group</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Strategic Scope</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Permission Matrix</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {roles.map((role: any) => (
                                <tr key={role._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
                                                <Users className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div className="ml-5">
                                                <div className="font-black text-gray-900 uppercase text-xs tracking-widest">{role.name}</div>
                                                <div className="text-[10px] text-indigo-400 font-bold mt-0.5">AUTH_ID: {role._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs">{role.description || 'No strategic description provided for this profile.'}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-wrap gap-2">
                                            {role.resourcePermissions?.filter((p: any) => p.canView || p.canSave || p.canEdit || p.canDelete).slice(0, 3).map((rp: any) => (
                                                <div key={rp.resource} className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center space-x-2">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">{rp.resource}</span>
                                                    <div className="flex gap-0.5">
                                                        {rp.canView && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                                        {rp.canSave && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                                        {rp.canEdit && <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>}
                                                        {rp.canDelete && <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
                                                    </div>
                                                </div>
                                            ))}
                                            {role.resourcePermissions?.length > 3 && (
                                                <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-[9px] font-black text-gray-400 uppercase">+{role.resourcePermissions.length - 3} More</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right space-x-3">
                                        <button onClick={() => handleEdit(role)} className="p-3 rounded-2xl text-indigo-600 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all group/btn active:scale-95">
                                            <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                        <button onClick={() => handleDelete(role._id)} className="p-3 rounded-2xl text-rose-500 hover:bg-white hover:shadow-xl hover:shadow-rose-50 transition-all group/btn active:scale-95">
                                            <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xl overflow-y-auto h-full w-full flex items-center justify-center z-50 p-6 sm:p-12">
                    <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center">
                                    <span className="w-2 h-7 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-100"></span>
                                    {editingId ? 'Modify Access Schema' : 'Forge System Identity'}
                                </h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-5">Security Level Configuration Control</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl text-gray-400">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-10 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Codename</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. SYSTEM_OVERLORD"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Brief</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-200 transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Full system administrative traversal"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-indigo-600" />
                                        Permission Logic Matrix
                                    </label>
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Secure Auth Node</span>
                                </div>

                                <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-100/30">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Source Cluster</th>
                                                {ACTIONS.map(action => (
                                                    <th key={action.id} className="px-6 py-5 text-center text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{action.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 bg-white">
                                            {formData.resourcePermissions.map((rp) => (
                                                <tr key={rp.resource} className="group hover:bg-indigo-50/20 transition-all duration-300">
                                                    <td className="px-8 py-5">
                                                        <div className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center">
                                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            {rp.resource}
                                                        </div>
                                                    </td>
                                                    {ACTIONS.map(action => (
                                                        <td key={action.id} className="px-6 py-5">
                                                            <div className="flex justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only peer"
                                                                        checked={rp[action.id as keyof typeof rp] as boolean}
                                                                        onChange={(e) => handlePermissionChange(rp.resource, action.id, e.target.checked)}
                                                                    />
                                                                    <div className="w-12 h-6 bg-gray-100 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-300 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-6 peer-hover:ring-4 peer-hover:ring-indigo-100"></div>
                                                                </label>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mt-16 pt-10 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-indigo-600 transition-all active:scale-95"
                                >
                                    Cancel Protocol
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-16 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] transition-all active:scale-95 hover:-translate-y-1"
                                >
                                    {editingId ? 'Execute Schema Update' : 'Initialize Authority Identity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
