import express, { Request, Response } from 'express';
import Allowance from '../models/Allowance';
import { protect, checkPermission } from '../middleware/auth';
import { RESOURCE_NAMES } from '../constants/resources';

const router = express.Router();

// Get all allowances
router.get('/', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canView'), async (req: Request, res: Response) => {
    try {
        const allowances = await Allowance.find().sort({ createdAt: -1 });
        res.json(allowances);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create an allowance
router.post('/', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canSave'), async (req: Request, res: Response) => {
    try {
        const allowance = await Allowance.create(req.body);
        res.status(201).json(allowance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an allowance
router.put('/:id', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canEdit'), async (req: Request, res: Response) => {
    try {
        const allowance = await Allowance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(allowance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an allowance
router.delete('/:id', protect, checkPermission(RESOURCE_NAMES.PAYROLL, 'canDelete'), async (req: Request, res: Response) => {
    try {
        await Allowance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Allowance removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
