import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/auth';
import roleRoutes from './routes/roles';
import employeeRoutes from './routes/employees';
import departmentRoutes from './routes/departments';
import allowanceRoutes from './routes/allowances';
import deductionRoutes from './routes/deductions';
import payrollRoutes from './routes/payroll';
import attendanceRoutes from './routes/attendance';
import leaveRoutes from './routes/leaves';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/allowances', allowanceRoutes);
app.use('/api/deductions', deductionRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log(err));
