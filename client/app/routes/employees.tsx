import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Employees() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Calculate permissions
    const userRoles = user?.roles || [];
    const canView = userRoles.some((r: any) => r.resourcePermissions?.find((p: any) => p.resource === 'Employees')?.canView);
    const canEdit = userRoles.some((r: any) => r.resourcePermissions?.find((p: any) => p.resource === 'Employees')?.canEdit);
    const canDelete = userRoles.some((r: any) => r.resourcePermissions?.find((p: any) => p.resource === 'Employees')?.canDelete);
    const canSave = userRoles.some((r: any) => r.resourcePermissions?.find((p: any) => p.resource === 'Employees')?.canSave);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: '',
        role: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, roleRes, deptRes] = await Promise.all([
                axios.get('http://localhost:5000/api/employees', config),
                axios.get('http://localhost:5000/api/roles', config),
                axios.get('http://localhost:5000/api/departments', config),
            ]);
            setEmployees(empRes.data);
            setRoles(roleRes.data);
            setDepartments(deptRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/employees/${editingId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/employees', formData, config);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving employee', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/employees/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting employee', error);
            }
        }
    };

    const handleEdit = (employee: any) => {
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            position: employee.position,
            department: employee.department?._id || '',
            role: employee.role?._id || '',
        });
        setEditingId(employee._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            position: '',
            department: '',
            role: '',
        });
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Employees...</div>;

    if (!canView) {
        return <div className="p-8 text-center text-red-500 font-semibold">You do not have permission to view this page.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
                {canSave && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Employee
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Position & Role</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee: any) => (
                            <tr key={employee._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <div className="text-sm font-semibold text-gray-900">{employee.firstName} {employee.lastName}</div>
                                        <div className="text-xs text-gray-500">{employee.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-800 font-medium">{employee.position}</div>
                                    <div className="text-xs text-indigo-600 font-semibold">{employee.role?.name || 'No Role'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                                        {employee.department?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    {canEdit && <button onClick={() => handleEdit(employee)} className="text-indigo-600 hover:text-indigo-900 transition"><Edit className="w-5 h-5" /></button>}
                                    {canDelete && <button onClick={() => handleDelete(employee._id)} className="text-red-600 hover:text-red-900 transition"><Trash2 className="w-5 h-5" /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Job Position"
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Department</label>
                                    <select
                                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Access Role</label>
                                    <select
                                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map((role: any) => (
                                            <option key={role._id} value={role._id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                                    {editingId ? 'Save Changes' : 'Create Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
