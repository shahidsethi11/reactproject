import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    employee: mongoose.Types.ObjectId;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';
    workHours: number;
    notes?: string;
}

const AttendanceSchema: Schema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent', 'Half Day', 'On Leave'],
        default: 'Absent'
    },
    workHours: { type: Number, default: 0 },
    notes: { type: String }
}, { timestamps: true });

// Ensure unique attendance per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
