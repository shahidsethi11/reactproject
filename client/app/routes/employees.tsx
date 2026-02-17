import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, GraduationCap, Briefcase, Minus, Banknote, Calculator, Building2, Wallet, Users, Lock } from 'lucide-react';

export default function Employees() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [availableAllowances, setAvailableAllowances] = useState([]);
    const [availableDeductions, setAvailableDeductions] = useState([]);
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
        basicSalary: '',
        biometricId: '',
        allowances: [] as Array<{ id: string, amount: string }>,
        deductions: [] as Array<{ id: string, amount: string }>,
        qualifications: [] as Array<{ degree: string, institution: string, year: string }>,
        experience: [] as Array<{ company: string, position: string, duration: string }>,
        password: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, roleRes, deptRes, allowRes, dedRes] = await Promise.all([
                axios.get('http://localhost:5000/api/employees', config).catch(err => ({ data: [] })),
                axios.get('http://localhost:5000/api/roles', config).catch(err => ({ data: [] })),
                axios.get('http://localhost:5000/api/departments', config).catch(err => ({ data: [] })),
                axios.get('http://localhost:5000/api/allowances', config).catch(err => ({ data: [] })),
                axios.get('http://localhost:5000/api/deductions', config).catch(err => ({ data: [] })),
            ]);
            setEmployees(empRes.data || []);
            setRoles(roleRes.data || []);
            setDepartments(deptRes.data || []);
            setAvailableAllowances(allowRes.data || []);
            setAvailableDeductions(dedRes.data || []);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                basicSalary: Number(formData.basicSalary),
                allowances: formData.allowances.map(a => ({ allowance: a.id, amount: Number(a.amount) })),
                deductions: formData.deductions.map(d => ({ deduction: d.id, amount: Number(d.amount) })),
                qualifications: formData.qualifications.map(q => ({ ...q, year: Number(q.year) }))
            };
            if (editingId) {
                await axios.put(`http://localhost:5000/api/employees/${editingId}`, dataToSave, config);
            } else {
                await axios.post('http://localhost:5000/api/employees', dataToSave, config);
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
            basicSalary: employee.basicSalary?.toString() || '0',
            biometricId: employee.biometricId || '',
            allowances: employee.allowances?.map((a: any) => {
                const id = a.allowance?._id || a.allowance || a;
                return { id: typeof id === 'object' ? id.toString() : id, amount: a.amount?.toString() || '0' };
            }) || [],
            deductions: employee.deductions?.map((d: any) => {
                const id = d.deduction?._id || d.deduction || d;
                return { id: typeof id === 'object' ? id.toString() : id, amount: d.amount?.toString() || '0' };
            }) || [],
            qualifications: employee.qualifications?.map((q: any) => ({ ...q, year: q.year?.toString() })) || [],
            experience: employee.experience || [],
            password: '',
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
            basicSalary: '',
            biometricId: '',
            allowances: [],
            deductions: [],
            qualifications: [],
            experience: [],
            password: '',
        });
        setEditingId(null);
    };

    const addQualification = () => {
        setFormData({
            ...formData,
            qualifications: [...formData.qualifications, { degree: '', institution: '', year: '' }]
        });
    };

    const removeQualification = (index: number) => {
        const newQuals = [...formData.qualifications];
        newQuals.splice(index, 1);
        setFormData({ ...formData, qualifications: newQuals });
    };

    const addExperience = () => {
        setFormData({
            ...formData,
            experience: [...formData.experience, { company: '', position: '', duration: '' }]
        });
    };

    const removeExperience = (index: number) => {
        const newExp = [...formData.experience];
        newExp.splice(index, 1);
        setFormData({ ...formData, experience: newExp });
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
                                        {employee.biometricId && <div className="text-[10px] font-bold text-blue-600">ID: {employee.biometricId}</div>}
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
                <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-start justify-center z-50 p-4 sm:p-6 md:p-8">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-auto animate-in fade-in zoom-in duration-200">
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
                                <span className={`w-2 h-8 rounded-full mr-3 ${editingId ? 'bg-indigo-600' : 'bg-blue-600'}`}></span>
                                {editingId ? 'Update Employee Record' : 'Onboard New Employee'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="bg-gray-50/50 p-5 sm:p-7 rounded-3xl space-y-5 border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                        <Users className="w-3.5 h-3.5 mr-2 text-indigo-500" /> Identity & Contact
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">First Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. John"
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition shadow-sm"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Last Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Doe"
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition shadow-sm"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Work Email</label>
                                            <input
                                                type="email"
                                                placeholder="john.doe@company.com"
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition shadow-sm"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Job Designation</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Product Designer"
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition shadow-sm"
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase flex items-center">
                                                <Lock className="w-3 h-3 mr-1 text-indigo-400" />
                                                {editingId ? 'New Security Password' : 'Initial Credential Password'}
                                            </label>
                                            <input
                                                type="password"
                                                placeholder={editingId ? 'Leave blank to retain current' : 'Define secure password'}
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition shadow-sm"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required={!editingId}
                                            />
                                        </div>
                                        <div className="space-y-1 self-end">
                                            <p className="text-[10px] text-gray-400 font-medium italic mb-2 leading-relaxed">
                                                {editingId
                                                    ? "Modifying this field will synchronize the authentication credentials for this professional profile immediately."
                                                    : "Creating this profile will automatically generate a corresponding authentication identity based on the name and email."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Organization */}
                                <div className="bg-gray-50/50 p-5 sm:p-7 rounded-3xl space-y-5 border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                        <Building2 className="w-3.5 h-3.5 mr-2 text-blue-500" /> Structure & Permissions
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Department</label>
                                            <select
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition cursor-pointer shadow-sm appearance-none"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Assignment</option>
                                                {departments.map((dept: any) => (
                                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">System Access Level</label>
                                            <select
                                                className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition cursor-pointer shadow-sm appearance-none"
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
                                </div>

                                {/* Payroll Section */}
                                <div className="bg-gray-50/50 p-5 sm:p-7 rounded-3xl space-y-7 border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                                        <Wallet className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Financial Settings
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="space-y-5">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Basic Monthly Salary</label>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black group-focus-within:text-emerald-500 transition-colors">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full border border-gray-200 rounded-2xl p-3.5 pl-10 outline-none focus:ring-2 focus:ring-emerald-500 font-black text-gray-700 bg-white transition shadow-sm"
                                                        value={formData.basicSalary}
                                                        onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Machine Biometric ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="Input ID from Device"
                                                    className="w-full border border-gray-200 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition shadow-sm"
                                                    value={formData.biometricId}
                                                    onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-emerald-600 uppercase ml-1 flex items-center">
                                                <Banknote className="w-3 h-3 mr-1.5" /> Allowances
                                            </label>
                                            <div className="border border-gray-100 rounded-3xl p-3.5 max-h-72 overflow-y-auto bg-white/50 backdrop-blur-sm shadow-inner space-y-3">
                                                {availableAllowances.length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic text-center py-8">No templates available</p>
                                                ) : availableAllowances.map((allow: any) => {
                                                    const isChecked = formData.allowances.some(a => a.id === allow._id);
                                                    const allowanceData = formData.allowances.find(a => a.id === allow._id);
                                                    return (
                                                        <div key={allow._id} className={`p-3.5 rounded-2xl border transition-all duration-300 ${isChecked ? 'bg-emerald-50/50 border-emerald-200 shadow-sm ring-1 ring-emerald-100' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'}`}>
                                                            <label className="flex items-center space-x-3 cursor-pointer mb-2.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const newAllowances = e.target.checked
                                                                            ? [...formData.allowances, { id: allow._id, amount: allow.value.toString() }]
                                                                            : formData.allowances.filter(a => a.id !== allow._id);
                                                                        setFormData({ ...formData, allowances: newAllowances });
                                                                    }}
                                                                    className="rounded-lg text-emerald-600 focus:ring-emerald-500 w-5 h-5 transition-transform active:scale-90"
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-800 text-xs leading-none">{allow.name}</span>
                                                                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5">{allow.type === 'Percentage' ? `${allow.value}% Basic` : `$${allow.value} Fixed`}</span>
                                                                </div>
                                                            </label>
                                                            {isChecked && (
                                                                <div className="relative mt-2 animate-in slide-in-from-top-2 duration-200">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600/50">{allow.type === 'Percentage' ? '%' : '$'}</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-white border border-emerald-200 rounded-xl p-2 pl-7 text-xs font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                                        value={allowanceData?.amount || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = formData.allowances.map(a => a.id === allow._id ? { ...a, amount: e.target.value } : a);
                                                                            setFormData({ ...formData, allowances: newVal });
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-rose-600 uppercase ml-1 flex items-center">
                                                <Calculator className="w-3 h-3 mr-1.5" /> Deductions
                                            </label>
                                            <div className="border border-gray-100 rounded-3xl p-3.5 max-h-72 overflow-y-auto bg-white/50 backdrop-blur-sm shadow-inner space-y-3">
                                                {availableDeductions.length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic text-center py-8">No templates available</p>
                                                ) : availableDeductions.map((ded: any) => {
                                                    const isChecked = formData.deductions.some(d => d.id === ded._id);
                                                    const deductionData = formData.deductions.find(d => d.id === ded._id);
                                                    return (
                                                        <div key={ded._id} className={`p-3.5 rounded-2xl border transition-all duration-300 ${isChecked ? 'bg-rose-50/50 border-rose-200 shadow-sm ring-1 ring-rose-100' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'}`}>
                                                            <label className="flex items-center space-x-3 cursor-pointer mb-2.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const newDeds = e.target.checked
                                                                            ? [...formData.deductions, { id: ded._id, amount: ded.value.toString() }]
                                                                            : formData.deductions.filter(d => d.id !== ded._id);
                                                                        setFormData({ ...formData, deductions: newDeds });
                                                                    }}
                                                                    className="rounded-lg text-rose-600 focus:ring-rose-500 w-5 h-5 transition-transform active:scale-90"
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-800 text-xs leading-none">{ded.name}</span>
                                                                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5">{ded.type === 'Percentage' ? `${ded.value}% Basic` : `$${ded.value} Fixed`}</span>
                                                                </div>
                                                            </label>
                                                            {isChecked && (
                                                                <div className="relative mt-2 animate-in slide-in-from-top-2 duration-200">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-600/50">{ded.type === 'Percentage' ? '%' : '$'}</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-white border border-rose-200 rounded-xl p-2 pl-7 text-xs font-black text-rose-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                                                                        value={deductionData?.amount || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = formData.deductions.map(d => d.id === ded._id ? { ...d, amount: e.target.value } : d);
                                                                            setFormData({ ...formData, deductions: newVal });
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Sections */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-gray-50/50 p-6 rounded-3xl space-y-5 border border-gray-100">
                                        <div className="flex justify-between items-center px-1">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                                                <GraduationCap className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Education
                                            </h3>
                                            <button type="button" onClick={addQualification} className="bg-indigo-600 text-white p-1 rounded-lg hover:bg-indigo-700 transition active:scale-95 shadow-lg shadow-indigo-100">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {formData.qualifications.length === 0 ? (
                                                <div className="text-center py-6 text-gray-400 italic text-[10px] uppercase font-bold tracking-widest bg-white/30 rounded-2xl border border-dashed">No Records</div>
                                            ) : formData.qualifications.map((q, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 relative group">
                                                    <button type="button" onClick={() => removeQualification(idx)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
                                                        <Minus className="w-2.5 h-2.5" />
                                                    </button>
                                                    <div className="space-y-3">
                                                        <input type="text" placeholder="Degree / Certificate" className="w-full border-b border-gray-100 pb-2 text-sm font-black text-gray-800 outline-none focus:border-indigo-500 transition-colors" value={q.degree} onChange={(e) => { const n = [...formData.qualifications]; n[idx].degree = e.target.value; setFormData({ ...formData, qualifications: n }); }} />
                                                        <div className="flex gap-4">
                                                            <input type="text" placeholder="Institution Name" className="flex-1 bg-gray-50 rounded-xl p-2 text-xs font-bold text-gray-500 outline-none" value={q.institution} onChange={(e) => { const n = [...formData.qualifications]; n[idx].institution = e.target.value; setFormData({ ...formData, qualifications: n }); }} />
                                                            <input type="number" placeholder="Year" className="w-20 bg-gray-50 rounded-xl p-2 text-xs font-black text-indigo-600 text-center outline-none" value={q.year} onChange={(e) => { const n = [...formData.qualifications]; n[idx].year = e.target.value; setFormData({ ...formData, qualifications: n }); }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-6 rounded-3xl space-y-5 border border-gray-100">
                                        <div className="flex justify-between items-center px-1">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                                                <Briefcase className="w-3.5 h-3.5 mr-2 text-blue-400" /> Career History
                                            </h3>
                                            <button type="button" onClick={addExperience} className="bg-blue-600 text-white p-1 rounded-lg hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {formData.experience.length === 0 ? (
                                                <div className="text-center py-6 text-gray-400 italic text-[10px] uppercase font-bold tracking-widest bg-white/30 rounded-2xl border border-dashed">No Records</div>
                                            ) : formData.experience.map((exp, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 relative group">
                                                    <button type="button" onClick={() => removeExperience(idx)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
                                                        <Minus className="w-2.5 h-2.5" />
                                                    </button>
                                                    <div className="space-y-3">
                                                        <input type="text" placeholder="Position / Role" className="w-full border-b border-gray-100 pb-2 text-sm font-black text-gray-800 outline-none focus:border-blue-500 transition-colors" value={exp.position} onChange={(e) => { const n = [...formData.experience]; n[idx].position = e.target.value; setFormData({ ...formData, experience: n }); }} />
                                                        <div className="flex gap-4">
                                                            <input type="text" placeholder="Previous Company" className="flex-1 bg-gray-50 rounded-xl p-2 text-xs font-bold text-gray-500 outline-none" value={exp.company} onChange={(e) => { const n = [...formData.experience]; n[idx].company = e.target.value; setFormData({ ...formData, experience: n }); }} />
                                                            <input type="text" placeholder="Duration" className="w-24 bg-gray-50 rounded-xl p-2 text-xs font-black text-blue-600 text-center outline-none" value={exp.duration} onChange={(e) => { const n = [...formData.experience]; n[idx].duration = e.target.value; setFormData({ ...formData, experience: n }); }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Toolbar */}
                                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-gray-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-95"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        className={`w-full sm:w-auto px-16 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white transition-all shadow-2xl active:scale-[0.98] ${editingId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                    >
                                        {editingId ? 'Push Updates' : 'Authorize Onboarding'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
