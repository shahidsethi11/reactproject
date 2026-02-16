import mongoose, { Schema, Document } from 'mongoose';

export interface IResourcePermission {
    resource: string;
    canView: boolean;
    canSave: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export interface IRole extends Document {
    name: string;
    description: string;
    permissions: string[]; // Keep for legacy string-based checks if needed
    resourcePermissions: IResourcePermission[];
    // Global flags for general system access
    canDelete: boolean;
    canEdit: boolean;
    canSave: boolean;
    canView: boolean;
}

const ResourcePermissionSchema = new Schema({
    resource: { type: String, required: true },
    canView: { type: Boolean, default: false },
    canSave: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
});

const RoleSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }],
    resourcePermissions: [ResourcePermissionSchema],
    canDelete: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canSave: { type: Boolean, default: false },
    canView: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IRole>('Role', RoleSchema);
