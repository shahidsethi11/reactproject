import express, { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';
import { protect, checkPermission } from '../middleware/auth';
import { RESOURCE_NAMES } from '../constants/resources';

const router = express.Router();

// Get all attendance logs
router.get('/', protect, checkPermission(RESOURCE_NAMES.ATTENDANCE, 'canView'), async (req: Request, res: Response) => {
    try {
        const { date, employeeId } = req.query;
        const query: any = {};

        if (date) {
            const startOfDay = new Date(date as string);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date as string);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (employeeId) {
            query.employee = employeeId;
        }

        const logs = await Attendance.find(query)
            .populate('employee', 'firstName lastName biometricId position')
            .sort({ date: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Simulate ZKTeco Sync
router.post('/sync', protect, checkPermission(RESOURCE_NAMES.ATTENDANCE, 'canSave'), async (req: Request, res: Response) => {
    try {
        // In a real scenario, this would connect to the ZKTeco device via SDK/Network
        // Here we simulate fetching logs for today for all employees with a biometricId
        const employees = await Employee.find({ biometricId: { $exists: true } });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const syncResults = [];

        for (const emp of employees) {
            // Simulate random check-in/out for the demo
            const checkIn = new Date(today);
            checkIn.setHours(8, Math.floor(Math.random() * 30), 0); // 8:00 - 8:30 AM

            const checkOut = new Date(today);
            checkOut.setHours(17, Math.floor(Math.random() * 45), 0); // 5:00 - 5:45 PM

            const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

            const attendanceLog = await Attendance.findOneAndUpdate(
                { employee: emp._id, date: today },
                {
                    employee: emp._id,
                    date: today,
                    checkIn,
                    checkOut,
                    status: 'Present',
                    workHours: parseFloat(workHours.toFixed(2)),
                    notes: 'Synced from ZKTeco Machine (Simulation)'
                },
                { upsert: true, new: true }
            );
            syncResults.push(attendanceLog);
        }

        res.json({ message: 'ZKTeco machine synced successfully', count: syncResults.length });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ message: 'Server error during sync' });
    }
});

// Manual Attendance Log (Edit or Create)
router.post('/manual', protect, checkPermission(RESOURCE_NAMES.ATTENDANCE, 'canEdit'), async (req: Request, res: Response) => {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    try {
        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        let workHours = 0;
        if (checkIn && checkOut) {
            workHours = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60);
        }

        const log = await Attendance.findOneAndUpdate(
            { employee: employeeId, date: logDate },
            {
                employee: employeeId,
                date: logDate,
                checkIn: checkIn ? new Date(checkIn) : undefined,
                checkOut: checkOut ? new Date(checkOut) : undefined,
                status,
                workHours: parseFloat(workHours.toFixed(2)),
                notes
            },
            { upsert: true, new: true }
        );

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
