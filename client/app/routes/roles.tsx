import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const RESOURCES = ['Employees', 'Users', 'Roles', 'Dashboard', 'Departments'];
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
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        resourcePermissions: RESOURCES.map(res => ({
            resource: res,
            canView: false,
            canSave: false,
            canEdit: false,
            canDelete: false
        }))
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
            const { data } = await axios.get('http://localhost:5000/api/roles', config);
            setRoles(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching roles', error);
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
        // Map existing permissions or initialize with defaults
        const resourcePermissions = RESOURCES.map(res => {
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
            resourcePermissions: RESOURCES.map(res => ({
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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Roles</h1>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Role
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Permissions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role: any) => (
                            <tr key={role._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-col gap-2">
                                        {role.resourcePermissions?.map((rp: any) => (
                                            <div key={rp.resource} className="flex items-center gap-2">
                                                <span className="w-24 font-medium text-gray-700">{rp.resource}:</span>
                                                <div className="flex gap-1">
                                                    {rp.canView && <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-800 rounded">View</span>}
                                                    {rp.canSave && <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded">Save</span>}
                                                    {rp.canEdit && <span className="px-2 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded">Edit</span>}
                                                    {rp.canDelete && <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-800 rounded">Delete</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-3">
                                    <button onClick={() => handleEdit(role)} className="text-indigo-600 hover:text-indigo-900 transition"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(role._id)} className="text-red-600 hover:text-red-900 transition"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Role' : 'Add Role'}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role Name</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Sales Manager"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief role description"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Permissions Matrix</label>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Resource</th>
                                                {ACTIONS.map(action => (
                                                    <th key={action.id} className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">{action.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {formData.resourcePermissions.map((rp) => (
                                                <tr key={rp.resource}>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{rp.resource}</td>
                                                    {ACTIONS.map(action => (
                                                        <td key={action.id} className="px-4 py-3 text-center">
                                                            <div className="flex justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only peer"
                                                                        checked={rp[action.id as keyof typeof rp] as boolean}
                                                                        onChange={(e) => handlePermissionChange(rp.resource, action.id, e.target.checked)}
                                                                    />
                                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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

                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                                >
                                    {editingId ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
