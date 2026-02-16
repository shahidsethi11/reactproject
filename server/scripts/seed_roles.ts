import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth';

const seedRoles = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        const roles = [
            {
                name: 'Admin',
                description: 'Administrator with full access',
                permissions: ['read:users', 'write:users', 'read:roles', 'write:roles'],
                resourcePermissions: [
                    { resource: 'Employees', canView: true, canSave: true, canEdit: true, canDelete: true },
                    { resource: 'Users', canView: true, canSave: true, canEdit: true, canDelete: true },
                    { resource: 'Roles', canView: true, canSave: true, canEdit: true, canDelete: true },
                    { resource: 'Dashboard', canView: true, canSave: true, canEdit: true, canDelete: true },
                    { resource: 'Departments', canView: true, canSave: true, canEdit: true, canDelete: true }
                ],
                canDelete: true,
                canEdit: true,
                canSave: true,
                canView: true
            },
            {
                name: 'User',
                description: 'Standard user',
                permissions: ['read:profile'],
                resourcePermissions: [
                    { resource: 'Employees', canView: true, canSave: false, canEdit: false, canDelete: false },
                    { resource: 'Users', canView: false, canSave: false, canEdit: false, canDelete: false },
                    { resource: 'Roles', canView: false, canSave: false, canEdit: false, canDelete: false },
                    { resource: 'Dashboard', canView: true, canSave: false, canEdit: false, canDelete: false },
                    { resource: 'Departments', canView: true, canSave: false, canEdit: false, canDelete: false }
                ],
                canDelete: false,
                canEdit: false,
                canSave: false,
                canView: true
            }
        ];

        for (const roleData of roles) {
            await Role.findOneAndUpdate(
                { name: roleData.name },
                roleData,
                { upsert: true, new: true }
            );
            console.log(`Role ${roleData.name} seeded/updated`);
        }

        console.log('Roles seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding roles:', error);
        process.exit(1);
    }
};

seedRoles();
