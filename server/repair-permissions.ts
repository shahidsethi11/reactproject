import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './models/Role';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth';

async function repair() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const adminRole = await Role.findOne({ name: 'Admin' });

        if (!adminRole) {
            console.log('Admin role not found. Please create it first.');
            process.exit(0);
        }

        const resources = ['Dashboard', 'Employees', 'Departments', 'Roles', 'Payroll'];

        let updated = false;

        for (const resourceName of resources) {
            const hasResource = adminRole.resourcePermissions.some(p => p.resource === resourceName);
            if (!hasResource) {
                console.log(`Adding missing resource: ${resourceName}`);
                adminRole.resourcePermissions.push({
                    resource: resourceName,
                    canView: true,
                    canSave: true,
                    canEdit: true,
                    canDelete: true
                });
                updated = true;
            } else {
                // Ensure all permissions are true for admin
                const perm = adminRole.resourcePermissions.find(p => p.resource === resourceName);
                if (perm && (!perm.canView || !perm.canSave || !perm.canEdit || !perm.canDelete)) {
                    console.log(`Fixing permissions for resource: ${resourceName}`);
                    perm.canView = true;
                    perm.canSave = true;
                    perm.canEdit = true;
                    perm.canDelete = true;
                    updated = true;
                }
            }
        }

        if (updated) {
            await adminRole.save();
            console.log('Admin permissions updated successfully!');
        } else {
            console.log('Admin permissions are already correct.');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error repairing permissions:', error);
        process.exit(1);
    }
}

repair();
