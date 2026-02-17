import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Wallet, RefreshCcw, CheckCircle2, AlertCircle, ChevronDown, Receipt } from 'lucide-react';

export default function EmployeePayroll() {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchPayrolls();
    }, [selectedMonth, selectedYear]);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/payroll?month=${selectedMonth}&year=${selectedYear}`, config);
            setPayrolls(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payrolls', error);
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await axios.post('http://localhost:5000/api/payroll/generate', {
                month: selectedMonth,
                year: selectedYear
            }, config);
            fetchPayrolls();
            alert('Payroll generated successfully!');
        } catch (error) {
            console.error('Error generating payroll', error);
            alert('Failed to generate payroll.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <span className="w-2 h-8 bg-emerald-600 rounded-full mr-4"></span>
                        Payroll Operations
                    </h1>
                    <p className="text-gray-500 font-medium ml-6 mt-1 flex items-center">
                        <Wallet className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                        Salary Disbursement Engine
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-6 py-3 shadow-xl shadow-gray-100/50 flex-1 lg:flex-none justify-center">
                        <select
                            className="bg-transparent outline-none text-xs font-black uppercase tracking-widest text-gray-700 pr-4 cursor-pointer"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="w-px h-6 bg-gray-100 mx-4"></span>
                        <select
                            className="bg-transparent outline-none text-xs font-black uppercase tracking-widest text-gray-700 cursor-pointer"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className={`flex-1 lg:flex-none flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] shadow-2xl ${generating
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                            }`}
                    >
                        {generating ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Receipt className="w-4 h-4 mr-2" />}
                        {generating ? 'Processing Engine...' : 'Execute Payroll'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-left border-b border-gray-50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Employee Reference</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financial Core</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Outcome Calculation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Registry Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="max-w-sm mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
                                                <Wallet className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">No Ledger Entries</p>
                                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                                                    Disbursement for <span className="text-emerald-600 font-bold">{selectedMonth} {selectedYear}</span> has not been initialized.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payrolls.map((p: any) => (
                                    <tr key={p._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-base shadow-sm group-hover:scale-105 transition-transform">
                                                    {p.employee?.firstName?.[0]}{p.employee?.lastName?.[0]}
                                                </div>
                                                <div className="ml-5">
                                                    <p className="font-black text-gray-900 text-sm tracking-tight">{p.employee?.firstName} {p.employee?.lastName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.employee?.position}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between min-w-[180px]">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base Rate</span>
                                                    <span className="text-xs font-black text-gray-700">${p.basicSalary.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Allowances</span>
                                                    <span className="text-xs font-black text-emerald-600">+${p.allowanceTotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Deductions</span>
                                                    <span className="text-xs font-black text-rose-600">-${p.deductionTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-block bg-emerald-50 px-6 py-2.5 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mr-2 opacity-50">Net</span>
                                                <span className="text-sm font-black tracking-tight">${p.netSalary.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ${p.status === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                                                : 'bg-amber-100 text-amber-700 ring-amber-200'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Operations Summary */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Wallet className="w-64 h-64 -mr-16 -mt-16" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
                            </span>
                            <h3 className="text-xl font-black tracking-tight">Financial Disbursement Intelligence</h3>
                        </div>
                        <p className="text-emerald-50/80 text-sm font-medium leading-relaxed">
                            The automated calculation engine is now cross-referencing biometric attendance patterns with contract protocols.
                            Manual overrides are restricted to administrative authorization only.
                        </p>
                    </div>
                    <div className="flex gap-6 shrink-0">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center min-w-[140px]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200 mb-1">Total Payload</p>
                            <p className="text-2xl font-black tracking-tight font-mono">${payrolls.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center min-w-[140px]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200 mb-1">Processed</p>
                            <p className="text-2xl font-black tracking-tight font-mono">{payrolls.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
