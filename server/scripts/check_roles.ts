import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth';

const checkRoles = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        const roles = await Role.find({});
        console.log('Roles found:', JSON.stringify(roles, null, 2));

        process.exit();
    } catch (error) {
        console.error('Error checking roles:', error);
        process.exit(1);
    }
};

checkRoles();
