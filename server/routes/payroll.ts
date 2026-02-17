import express, { Request, Response } from 'express';
import Payroll from '../models/Payroll';
import Employee from '../models/Employee';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Get payroll records
router.get('/', protect, checkPermission('Payroll', 'canView'), async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const query: any = {};
        if (month) query.month = month;
        if (year) query.year = Number(year);

        const payrolls = await Payroll.find(query).populate('employee').sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate payroll
router.post('/generate', protect, checkPermission('Payroll', 'canSave'), async (req: Request, res: Response) => {
    const { month, year } = req.body;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required' });
    }

    try {
        const employees = await Employee.find().populate('allowances deductions');
        const payrollRecords = [];

        for (const emp of employees) {
            let allowanceTotal = 0;
            let deductionTotal = 0;
            const allowanceDetails = [];
            const deductionDetails = [];

            // Calculate Allowances
            for (const allow of (emp.allowances as any)) {
                let amount = 0;
                if (allow.type === 'Percentage') {
                    amount = (allow.value / 100) * emp.basicSalary;
                } else {
                    amount = allow.value;
                }
                allowanceTotal += amount;
                allowanceDetails.push({ name: allow.name, amount });
            }

            // Calculate Deductions
            for (const ded of (emp.deductions as any)) {
                let amount = 0;
                if (ded.type === 'Percentage') {
                    amount = (ded.value / 100) * emp.basicSalary;
                } else {
                    amount = ded.value;
                }
                deductionTotal += amount;
                deductionDetails.push({ name: ded.name, amount });
            }

            const netSalary = emp.basicSalary + allowanceTotal - deductionTotal;

            const payrollData = {
                employee: emp._id,
                month,
                year,
                basicSalary: emp.basicSalary,
                allowanceTotal,
                deductionTotal,
                netSalary,
                details: {
                    allowances: allowanceDetails,
                    deductions: deductionDetails
                }
            };

            // Use findOneAndUpdate with upsert to avoid duplicates and update existing records
            const record = await Payroll.findOneAndUpdate(
                { employee: emp._id, month, year },
                payrollData,
                { upsert: true, new: true }
            );
            payrollRecords.push(record);
        }

        res.json({ message: 'Payroll generated successfully', count: payrollRecords.length });
    } catch (error) {
        console.error('Payroll generation error:', error);
        res.status(500).json({ message: 'Server error during payroll generation' });
    }
});

export default router;
