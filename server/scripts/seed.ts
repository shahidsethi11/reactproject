import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role';
import User from '../models/User';
import Employee from '../models/Employee';
import Department from '../models/Department';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB Connected');

        // Clear existing data
        await Role.deleteMany({});
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Department.deleteMany({});
        console.log('Data cleared');

        // Create Departments
        const engineering = await Department.create({ name: 'Engineering', description: 'Software and Hardware engineering' });
        const product = await Department.create({ name: 'Product', description: 'Product management and strategy' });
        const design = await Department.create({ name: 'Design', description: 'UI/UX and Graphic design' });
        console.log('Departments created');

        // Create Roles
        const adminRole = await Role.create({
            name: 'Admin',
            description: 'Full access to all resources',
            permissions: ['view_dashboard', 'manage_employees', 'manage_roles', 'view_reports'],
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
        });

        const employeeRole = await Role.create({
            name: 'Employee',
            description: 'Standard employee access',
            permissions: ['view_dashboard'],
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
        });

        console.log('Roles created');

        // Create Admin User
        // Note: Password hashing is handled in User model pre-save hook
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@local.com',
            password: 'adminpassword',
            roles: [adminRole._id]
        });

        console.log('Admin User created: admin@local.com / adminpassword');

        // Create Dummy Employees
        await Employee.create([
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@local.com',
                position: 'Software Engineer',
                department: engineering._id,
                role: employeeRole._id,
                dateJoined: new Date('2024-01-15'),
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@local.com',
                position: 'Product Manager',
                department: product._id,
                role: adminRole._id, // Assigning admin role just for variety
                dateJoined: new Date('2023-11-20'),
            },
            {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice.j@local.com',
                position: 'Designer',
                department: design._id,
                role: employeeRole._id,
                dateJoined: new Date('2024-03-01'),
            },
        ]);

        console.log('Dummy Employees created');

        process.exit();
    } catch (error) {
        console.error('Error with data seeding', error);
        process.exit(1);
    }
};

seedData();
