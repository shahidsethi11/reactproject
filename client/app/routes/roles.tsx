import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Roles & Permissions</h1>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Role
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Permissions Overview</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {roles.map((role: any) => (
                            <tr key={role._id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-3 max-w-md">
                                        {role.resourcePermissions?.filter((p: any) => p.canView || p.canSave || p.canEdit || p.canDelete).map((rp: any) => (
                                            <div key={rp.resource} className="flex flex-col bg-gray-50 p-2 rounded-lg border border-gray-100 min-w-[120px]">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">{rp.resource}</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {rp.canView && <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-700 rounded font-bold uppercase">View</span>}
                                                    {rp.canSave && <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-700 rounded font-bold uppercase">Save</span>}
                                                    {rp.canEdit && <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-700 rounded font-bold uppercase">Edit</span>}
                                                    {rp.canDelete && <span className="px-1.5 py-0.5 text-[9px] bg-rose-100 text-rose-700 rounded font-bold uppercase">Delete</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                    <button onClick={() => handleEdit(role)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(role._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Role Configuration' : 'Create New Role'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition text-2xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Role Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Senior Administrator"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What can this role do?"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-gray-700">Access Control Matrix</label>
                                    <span className="text-xs text-gray-500 italic">Toggle permissions for each system resource</span>
                                </div>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                                                {ACTIONS.map(action => (
                                                    <th key={action.id} className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{action.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {formData.resourcePermissions.map((rp) => (
                                                <tr key={rp.resource} className="hover:bg-gray-50/30 transition">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{rp.resource}</td>
                                                    {ACTIONS.map(action => (
                                                        <td key={action.id} className="px-4 py-3 text-center">
                                                            <div className="flex justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only peer"
                                                                        checked={rp[action.id as keyof typeof rp] as boolean}
                                                                        onChange={(e) => handlePermissionChange(rp.resource, action.id, e.target.checked)}
                                                                    />
                                                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
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

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition"
                                >
                                    {editingId ? 'Save Configuration' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
