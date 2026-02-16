import express, { Request, Response } from 'express';
import Department from '../models/Department';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Get all departments
router.get('/', protect, checkPermission('Departments', 'canView'), async (req: Request, res: Response) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a department
router.post('/', protect, checkPermission('Departments', 'canSave'), async (req: Request, res: Response) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a department
router.put('/:id', protect, checkPermission('Departments', 'canEdit'), async (req: Request, res: Response) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a department
router.delete('/:id', protect, checkPermission('Departments', 'canDelete'), async (req: Request, res: Response) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Department removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
