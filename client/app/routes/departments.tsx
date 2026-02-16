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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
                </div>
                {canSave && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Department
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept: any) => (
                    <div key={dept._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-2">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                                {canEdit && (
                                    <button onClick={() => handleEdit(dept)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={() => handleDelete(dept._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{dept.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{dept.description || 'No description provided.'}</p>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Department' : 'Add Department'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Department Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Engineering"
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description</label>
                                <textarea
                                    placeholder="Brief description of the department..."
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-200"
                                >
                                    {editingId ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
