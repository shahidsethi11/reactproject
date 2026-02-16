import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Import Role first to ensure it's registered
import Role from '../models/Role';
import User from '../models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth';

const debugUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        // Log registered models
        console.log('Registered models:', mongoose.modelNames());

        const users = await User.find({}).populate('roles');
        console.log('Users found:', users.length);

        users.forEach(user => {
            console.log(`User: ${user.username} (${user.email})`);
            if (user.roles && user.roles.length > 0) {
                console.log('Roles:', user.roles.map((r: any) => r.name).join(', '));
            } else {
                console.log('Roles: None');
            }
            console.log('---');
        });

        process.exit();
    } catch (error) {
        console.error('Error debugging users:', error);
        process.exit(1);
    }
};

debugUsers();
