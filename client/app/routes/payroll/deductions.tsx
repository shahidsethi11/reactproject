import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Calculator, Percent, CircleDollarSign } from 'lucide-react';

export default function Deductions() {
    const { user } = useAuth();
    const [deductions, setDeductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Amount',
        value: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const API_URL = 'http://localhost:5000/api/deductions';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/deductions', config);
            setDeductions(res.data);
        } catch (error) {
            console.error('Error fetching deductions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData, config);
            } else {
                await axios.post(API_URL, formData, config);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving deduction', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this deduction?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting deduction', error);
            }
        }
    };

    const handleEdit = (deduction: any) => {
        setFormData({
            name: deduction.name,
            type: deduction.type,
            value: deduction.value.toString(),
        });
        setEditingId(deduction._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'Amount', value: '' });
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Deductions...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-600/10 rounded-xl">
                        <Calculator className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Deductions</h1>
                        <p className="text-gray-500 text-sm">Manage employee taxations and salary deductions.</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Deduction
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {deductions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    No deductions found. Click "Add Deduction" to create one.
                                </td>
                            </tr>
                        ) : (
                            deductions.map((deduction: any) => (
                                <tr key={deduction._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{deduction.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deduction.type === 'Percentage' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {deduction.type === 'Percentage' ? <Percent className="w-3 h-3 mr-1" /> : <CircleDollarSign className="w-3 h-3 mr-1" />}
                                            {deduction.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {deduction.type === 'Percentage' ? `${deduction.value}%` : `$${deduction.value.toLocaleString()}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => handleEdit(deduction)} className="text-indigo-600 hover:text-indigo-900 transition"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(deduction._id)} className="text-red-600 hover:text-red-900 transition"><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Deduction' : 'Add New Deduction'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deduction Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Income Tax"
                                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Calculation Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Amount' })}
                                        className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.type === 'Amount' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <CircleDollarSign className="w-5 h-5 mr-2" />
                                        Fixed Amount
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Percentage' })}
                                        className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.type === 'Percentage' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <Percent className="w-5 h-5 mr-2" />
                                        Percentage
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Value</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder={formData.type === 'Percentage' ? 'e.g. 5' : 'e.g. 500'}
                                        className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-10"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                    />
                                    <div className="absolute left-3 top-3.5 text-gray-400">
                                        {formData.type === 'Percentage' ? <Percent className="w-4 h-4" /> : <CircleDollarSign className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-500 hover:text-gray-700 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
                                >
                                    {editingId ? 'Save Changes' : 'Create Deduction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
