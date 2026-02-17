import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
    employee: mongoose.Types.ObjectId;
    month: string;
    year: number;
    basicSalary: number;
    allowanceTotal: number;
    deductionTotal: number;
    netSalary: number;
    status: 'Draft' | 'Paid';
    details: {
        allowances: Array<{ name: string, amount: number }>;
        deductions: Array<{ name: string, amount: number }>;
    };
}

const PayrollSchema: Schema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowanceTotal: { type: Number, required: true },
    deductionTotal: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Paid'], default: 'Draft' },
    details: {
        allowances: [{ name: String, amount: Number }],
        deductions: [{ name: String, amount: Number }],
    }
}, { timestamps: true });

// Ensure unique payroll per employee per month/year
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);
