import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, GraduationCap, Briefcase, Minus } from 'lucide-react';

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
        allowances: [] as string[],
        deductions: [] as string[],
        qualifications: [] as Array<{ degree: string, institution: string, year: string }>,
        experience: [] as Array<{ company: string, position: string, duration: string }>,
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
            allowances: employee.allowances?.map((a: any) => typeof a === 'object' ? a._id : a) || [],
            deductions: employee.deductions?.map((d: any) => typeof d === 'object' ? d._id : d) || [],
            qualifications: employee.qualifications?.map((q: any) => ({ ...q, year: q.year?.toString() })) || [],
            experience: employee.experience || [],
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
            allowances: [],
            deductions: [],
            qualifications: [],
            experience: [],
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
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Salary</th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                    ${employee.basicSalary?.toLocaleString() || '0'}
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 my-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Basic Information</h3>
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
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                            </div>

                            {/* Organization & Salary */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Organization</h3>
                                    <div className="space-y-4">
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
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Payroll Settings</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Basic Salary</label>
                                        <input
                                            type="number"
                                            placeholder="Basic Salary"
                                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.basicSalary}
                                            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Allowances</label>
                                            <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-white">
                                                {availableAllowances.map((allow: any) => (
                                                    <label key={allow._id} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.allowances.includes(allow._id)}
                                                            onChange={(e) => {
                                                                const newAllowances = e.target.checked
                                                                    ? [...formData.allowances, allow._id]
                                                                    : formData.allowances.filter(id => id !== allow._id);
                                                                setFormData({ ...formData, allowances: newAllowances });
                                                            }}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>{allow.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Deductions</label>
                                            <div className="border rounded-lg p-2 max-h-32 overflow-y-auto bg-white">
                                                {availableDeductions.map((ded: any) => (
                                                    <label key={ded._id} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.deductions.includes(ded._id)}
                                                            onChange={(e) => {
                                                                const newDeductions = e.target.checked
                                                                    ? [...formData.deductions, ded._id]
                                                                    : formData.deductions.filter(id => id !== ded._id);
                                                                setFormData({ ...formData, deductions: newDeductions });
                                                            }}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>{ded.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Qualifications */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center">
                                        <GraduationCap className="w-4 h-4 mr-2" />
                                        Academic Qualifications
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addQualification}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add More
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.qualifications.map((q, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border">
                                            <div className="col-span-4">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Degree</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. BS Computer Science"
                                                    className="w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={q.degree}
                                                    onChange={(e) => {
                                                        const newQuals = [...formData.qualifications];
                                                        newQuals[idx].degree = e.target.value;
                                                        setFormData({ ...formData, qualifications: newQuals });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-5">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Institution</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Harvard University"
                                                    className="w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={q.institution}
                                                    onChange={(e) => {
                                                        const newQuals = [...formData.qualifications];
                                                        newQuals[idx].institution = e.target.value;
                                                        setFormData({ ...formData, qualifications: newQuals });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Year</label>
                                                <input
                                                    type="number"
                                                    placeholder="2020"
                                                    className="w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={q.year}
                                                    onChange={(e) => {
                                                        const newQuals = [...formData.qualifications];
                                                        newQuals[idx].year = e.target.value;
                                                        setFormData({ ...formData, qualifications: newQuals });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeQualification(idx)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.qualifications.length === 0 && (
                                        <p className="text-sm text-gray-400 italic text-center py-2">No qualifications added.</p>
                                    )}
                                </div>
                            </div>

                            {/* Job Experience */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        Job Experience
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addExperience}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add More
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.experience.map((exp, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border">
                                            <div className="col-span-4">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Google"
                                                    className="w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={exp.company}
                                                    onChange={(e) => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].company = e.target.value;
                                                        setFormData({ ...formData, experience: newExp });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Position</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Senior Developer"
                                                    className="w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={exp.position}
                                                    onChange={(e) => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].position = e.target.value;
                                                        setFormData({ ...formData, experience: newExp });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Duration</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 2 Years"
                                                    className="w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={exp.duration}
                                                    onChange={(e) => {
                                                        const newExp = [...formData.experience];
                                                        newExp[idx].duration = e.target.value;
                                                        setFormData({ ...formData, experience: newExp });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeExperience(idx)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.experience.length === 0 && (
                                        <p className="text-sm text-gray-400 italic text-center py-2">No experience added.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
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
