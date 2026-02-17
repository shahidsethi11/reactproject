import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Wallet, RefreshCcw, CheckCircle2, AlertCircle, ChevronDown, Receipt } from 'lucide-react';

export default function EmployeePayroll() {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-600/10 rounded-xl">
                        <Wallet className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Employee Payroll</h1>
                        <p className="text-gray-500 text-sm">Process and manage monthly salary disbursements.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <select
                            className="bg-transparent outline-none text-sm font-semibold text-gray-700 pr-2 cursor-pointer"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="w-px h-4 bg-gray-200 mx-2"></span>
                        <select
                            className="bg-transparent outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition shadow-lg ${generating
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {generating ? <RefreshCcw className="w-5 h-5 mr-2 animate-spin" /> : <Receipt className="w-5 h-5 mr-2" />}
                        {generating ? 'Processing...' : 'Generate Payroll'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Salary</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Allowances</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Deductions</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Net Salary</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading payroll data...</td>
                            </tr>
                        ) : payrolls.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    No payroll records found for {selectedMonth} {selectedYear}. Use "Generate Payroll" to process it.
                                </td>
                            </tr>
                        ) : (
                            payrolls.map((p: any) => (
                                <tr key={p._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold text-gray-900">{p.employee?.firstName} {p.employee?.lastName}</div>
                                            <div className="text-xs text-gray-500">{p.employee?.position}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                        ${p.basicSalary.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium font-semibold">
                                        +${p.allowanceTotal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium font-semibold">
                                        -${p.deductionTotal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                                            ${p.netSalary.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {p.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
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
    );
}
