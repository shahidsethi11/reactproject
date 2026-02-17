import mongoose, { Schema, Document } from 'mongoose';

export interface IDeduction extends Document {
    name: string;
    type: 'Amount' | 'Percentage';
    value: number;
}

const DeductionSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Amount', 'Percentage'], required: true },
    value: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IDeduction>('Deduction', DeductionSchema);
