import express, { Request, Response } from 'express';
import Employee from '../models/Employee';
import Department from '../models/Department';
import { protect, checkPermission } from '../middleware/auth';
import { RESOURCE_NAMES } from '../constants/resources';

const router = express.Router();

// Get all employees
router.get('/', protect, checkPermission(RESOURCE_NAMES.EMPLOYEES, 'canView'), async (req: Request, res: Response) => {
    try {
        const employees = await Employee
            .find()
            .populate('role')
            .populate('department')
            .populate('allowances.allowance')
            .populate('deductions.deduction')
            .lean();

        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create an employee
router.post('/', protect, checkPermission(RESOURCE_NAMES.EMPLOYEES, 'canSave'), async (req: Request, res: Response) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an employee
router.put('/:id', protect, checkPermission(RESOURCE_NAMES.EMPLOYEES, 'canEdit'), async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an employee
router.delete('/:id', protect, checkPermission(RESOURCE_NAMES.EMPLOYEES, 'canDelete'), async (req: Request, res: Response) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
