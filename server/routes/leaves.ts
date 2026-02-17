import express, { Request, Response } from 'express';
import LeaveRequest from '../models/LeaveRequest';
import { protect, checkPermission } from '../middleware/auth';
import { RESOURCE_NAMES } from '../constants/resources';

const router = express.Router();

// Get all leave requests
router.get('/', protect, checkPermission(RESOURCE_NAMES.LEAVES, 'canView'), async (req: Request, res: Response) => {
    try {
        const { status, employeeId } = req.query;
        const query: any = {};

        if (status) query.status = status;
        if (employeeId) query.employee = employeeId;

        const requests = await LeaveRequest.find(query)
            .populate('employee', 'firstName lastName position')
            .populate('approvedBy', 'username')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit a leave request
router.post('/', protect, checkPermission(RESOURCE_NAMES.LEAVES, 'canSave'), async (req: Request, res: Response) => {
    try {
        const newRequest = await LeaveRequest.create({
            ...req.body,
            employee: (req as any).user._id, // Set by protect middleware
            status: 'Pending'
        });
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update leave status (Approve/Reject)
router.put('/:id/status', protect, checkPermission(RESOURCE_NAMES.LEAVES, 'canEdit'), async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const request = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            {
                status,
                approvedBy: (req as any).user._id
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a leave request
router.delete('/:id', protect, checkPermission(RESOURCE_NAMES.LEAVES, 'canDelete'), async (req: Request, res: Response) => {
    try {
        const request = await LeaveRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        res.json({ message: 'Leave request removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
