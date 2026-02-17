import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: mongoose.Types.ObjectId;
    role: mongoose.Types.ObjectId;
    dateJoined: Date;
    basicSalary: number;
    allowances: mongoose.Types.ObjectId[];
    deductions: mongoose.Types.ObjectId[];
    qualifications: Array<{ degree: string, institution: string, year: number }>;
    experience: Array<{ company: string, position: string, duration: string }>;
}

const EmployeeSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    dateJoined: { type: Date, default: Date.now },
    basicSalary: { type: Number, default: 0 },
    allowances: [{ type: Schema.Types.ObjectId, ref: 'Allowance' }],
    deductions: [{ type: Schema.Types.ObjectId, ref: 'Deduction' }],
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    experience: [{
        company: String,
        position: String,
        duration: String
    }]
}, { timestamps: true });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
