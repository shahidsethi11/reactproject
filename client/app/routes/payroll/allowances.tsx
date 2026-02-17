import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Banknote, Percent, CircleDollarSign } from 'lucide-react';

export default function Allowances() {
    const { user } = useAuth();
    const [allowances, setAllowances] = useState([]);
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
    const API_URL = 'http://localhost:5000/api/allowances';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL, config);
            setAllowances(res.data);
        } catch (error) {
            console.error('Error fetching allowances', error);
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
            console.error('Error saving allowance', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this allowance?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting allowance', error);
            }
        }
    };

    const handleEdit = (allowance: any) => {
        setFormData({
            name: allowance.name,
            type: allowance.type,
            value: allowance.value.toString(),
        });
        setEditingId(allowance._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'Amount', value: '' });
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Allowances...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
                        Allowance Protocols
                    </h1>
                    <p className="text-gray-500 font-medium ml-6 mt-1 flex items-center">
                        <Banknote className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                        Benefit Configuration Registry
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center justify-center px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100 group"
                >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                    New Definition
                </button>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-left border-b border-gray-50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Benefit Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Calculation Model</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Effective Value</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Administrative</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allowances.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="max-w-sm mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
                                                <Banknote className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Registry Empty</p>
                                                <p className="text-gray-400 text-xs mt-2">Initialize the benefit definitions to begin mapping.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                allowances.map((allowance: any) => (
                                    <tr key={allowance._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                                    <Banknote className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div className="ml-4 font-black text-gray-900 uppercase text-[11px] tracking-widest">{allowance.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ${allowance.type === 'Percentage'
                                                ? 'bg-purple-100 text-purple-700 ring-purple-200'
                                                : 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                                                }`}>
                                                {allowance.type === 'Percentage' ? <Percent className="w-3 h-3 mr-1 inline" /> : <CircleDollarSign className="w-3 h-3 mr-1 inline" />}
                                                {allowance.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-gray-900">
                                                {allowance.type === 'Percentage' ? `${allowance.value}%` : `$${allowance.value.toLocaleString()}`}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(allowance)} className="p-2.5 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(allowance._id)} className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg p-10 animate-in fade-in zoom-in duration-200">
                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center uppercase">
                                <span className="w-2 h-7 bg-indigo-600 rounded-full mr-3"></span>
                                {editingId ? 'Modify Schema' : 'Define Protocol'}
                            </h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-5">Benefit Structure Configuration</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. PERFORMANCE_STIMULUS"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-sm placeholder:text-gray-300"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Calculation Logic</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Amount' })}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all space-y-3 ${formData.type === 'Amount' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-gray-50 bg-gray-50/30 text-gray-400 hover:border-gray-100'}`}
                                    >
                                        <CircleDollarSign className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Fixed Sum</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Percentage' })}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all space-y-3 ${formData.type === 'Percentage' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-gray-50 bg-gray-50/30 text-gray-400 hover:border-gray-100'}`}
                                    >
                                        <Percent className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ratio based</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Magnitude Value</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-black text-lg pl-12"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                    />
                                    <div className="absolute left-4 top-4 text-indigo-400">
                                        {formData.type === 'Percentage' ? <Percent className="w-5 h-5" /> : <span className="font-black text-lg">$</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    {editingId ? 'Push Update' : 'Initialize'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
