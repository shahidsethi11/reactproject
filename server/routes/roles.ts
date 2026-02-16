import express, { Request, Response } from 'express';
import Role from '../models/Role';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Get all roles
router.get('/', protect, checkPermission('Roles', 'canView'), async (req: Request, res: Response) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a role
router.post('/', protect, checkPermission('Roles', 'canSave'), async (req: Request, res: Response) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a role
router.put('/:id', protect, checkPermission('Roles', 'canEdit'), async (req: Request, res: Response) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a role
router.delete('/:id', protect, checkPermission('Roles', 'canDelete'), async (req: Request, res: Response) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
