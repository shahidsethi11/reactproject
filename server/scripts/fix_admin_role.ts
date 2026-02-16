import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Role from '../models/Role';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth';

const fixAdminRole = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        const adminRole = await Role.findOne({ name: 'Admin' });
        if (!adminRole) {
            console.log('Admin role not found');
            process.exit(1);
        }

        const user = await User.findOne({ email: 'admin@local.com' }); // Correct email from seed
        if (!user) {
            console.log('Admin user not found, trying "admin" username');
            const userByName = await User.findOne({ username: 'admin' });
            if (!userByName) {
                console.log('Admin user (username: admin) not found either');
                process.exit(1);
            }
            if (!userByName.roles.includes(adminRole._id as any)) {
                userByName.roles.push(adminRole._id as any);
                await userByName.save();
                console.log(`Assigned Admin role to user ${userByName.username}`);
            } else {
                console.log(`User ${userByName.username} already has Admin role`);
            }
        } else {
            if (!user.roles.includes(adminRole._id as any)) {
                user.roles.push(adminRole._id as any);
                await user.save();
                console.log(`Assigned Admin role to user ${user.email}`);
            } else {
                console.log(`User ${user.email} already has Admin role`);
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error fixing admin role:', error);
        process.exit(1);
    }
};

fixAdminRole();
