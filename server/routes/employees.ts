import express, { Request, Response } from 'express';
import Employee from '../models/Employee';
import Department from '../models/Department';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Get all employees
router.get('/', protect, checkPermission('Employees', 'canView'), async (req: Request, res: Response) => {
    try {
        const employees = await Employee
            .find()
            .populate('role')
            .populate('department')
            .lean();

        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create an employee
router.post('/', protect, checkPermission('Employees', 'canSave'), async (req: Request, res: Response) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an employee
router.put('/:id', protect, checkPermission('Employees', 'canEdit'), async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an employee
router.delete('/:id', protect, checkPermission('Employees', 'canDelete'), async (req: Request, res: Response) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
