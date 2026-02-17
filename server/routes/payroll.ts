import express, { Request, Response } from 'express';
import Payroll from '../models/Payroll';
import Employee from '../models/Employee';
import { protect, checkPermission } from '../middleware/auth';
import { RESOURCE_NAMES } from '../constants/resources';
import { generateSalarySlip } from '../services/payrollService';

const router = express.Router();

// Get payroll records
router.get('/', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canView'), async (req: Request, res: Response) => {
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

// Download salary report PDF
router.get('/report/:id', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canView'), async (req: Request, res: Response) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate('employee');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        const employee = payroll.employee as any;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=salary-slip-${employee.firstName}-${payroll.month}-${payroll.year}.pdf`);

        generateSalarySlip(payroll, res);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating PDF report' });
    }
});

// Generate payroll
router.post('/generate', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canSave'), async (req: Request, res: Response) => {
    const { month, year } = req.body;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required' });
    }

    try {
        const employees = await Employee.find().populate({
            path: 'allowances.allowance deductions.deduction'
        });
        const payrollRecords = [];

        for (const emp of employees) {
            let allowanceTotal = 0;
            let deductionTotal = 0;
            const allowanceDetails = [];
            const deductionDetails = [];

            // Calculate Allowances
            for (const item of (emp.allowances as any)) {
                if (!item.allowance) continue;
                let amount = 0;
                if (item.allowance.type === 'Percentage') {
                    amount = (item.amount / 100) * emp.basicSalary;
                } else {
                    amount = item.amount;
                }
                allowanceTotal += amount;
                allowanceDetails.push({ name: item.allowance.name, amount });
            }

            // Calculate Deductions
            for (const item of (emp.deductions as any)) {
                if (!item.deduction) continue;
                let amount = 0;
                if (item.deduction.type === 'Percentage') {
                    amount = (item.amount / 100) * emp.basicSalary;
                } else {
                    amount = item.amount;
                }
                deductionTotal += amount;
                deductionDetails.push({ name: item.deduction.name, amount });
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
