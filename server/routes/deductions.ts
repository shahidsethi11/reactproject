import express, { Request, Response } from 'express';
import Deduction from '../models/Deduction';
import { protect, checkPermission } from '../middleware/auth';
import { RESOURCE_NAMES } from '../constants/resources';

const router = express.Router();

// Get all deductions
router.get('/', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canView'), async (req: Request, res: Response) => {
    try {
        const deductions = await Deduction.find().sort({ createdAt: -1 });
        res.json(deductions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a deduction
router.post('/', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canSave'), async (req: Request, res: Response) => {
    try {
        const deduction = await Deduction.create(req.body);
        res.status(201).json(deduction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a deduction
router.put('/:id', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canEdit'), async (req: Request, res: Response) => {
    try {
        const deduction = await Deduction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(deduction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a deduction
router.delete('/:id', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canDelete'), async (req: Request, res: Response) => {
    try {
        await Deduction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deduction removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
