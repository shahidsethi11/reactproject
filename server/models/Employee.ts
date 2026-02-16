import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: mongoose.Types.ObjectId;
    role: mongoose.Types.ObjectId;
    dateJoined: Date;
}

const EmployeeSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    dateJoined: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
