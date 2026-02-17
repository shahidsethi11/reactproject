import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
    employee: mongoose.Types.ObjectId;
    leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Paternity' | 'Unpaid';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: mongoose.Types.ObjectId;
    appliedDate: Date;
}

const LeaveRequestSchema: Schema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: {
        type: String,
        enum: ['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
