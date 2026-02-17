import express, { Request, Response } from 'express';
import Employee from '../models/Employee';
import User from '../models/User';
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
        const { password, ...employeeData } = req.body;

        // Create the employee
        const employee = await Employee.create(employeeData);

        // Create the linked user
        if (password) {
            await User.create({
                username: `${employee.firstName.toLowerCase()}${employee.lastName.toLowerCase()}`,
                email: employee.email,
                password,
                roles: employee.role ? [employee.role] : []
            });
        }

        res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an employee
router.put('/:id', protect, checkPermission(RESOURCE_NAMES.EMPLOYEES, 'canEdit'), async (req: Request, res: Response) => {
    try {
        const { password, ...employeeData } = req.body;
        const employee = await Employee.findByIdAndUpdate(req.params.id, employeeData, { new: true });

        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }

        // Synchronize with User model
        const user = await User.findOne({ email: employee.email });
        if (user) {
            if (password) user.password = password;
            user.username = `${employee.firstName.toLowerCase()}${employee.lastName.toLowerCase()}`;
            user.roles = employee.role ? [employee.role as any] : [];
            await user.save();
        } else if (password) {
            // Create user if it doesn't exist but password is provided
            await User.create({
                username: `${employee.firstName.toLowerCase()}${employee.lastName.toLowerCase()}`,
                email: employee.email,
                password,
                roles: employee.role ? [employee.role] : []
            });
        }

        res.json(employee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an employee
router.delete('/:id', protect, checkPermission(RESOURCE_NAMES.EMPLOYEES, 'canDelete'), async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            // Also delete the linked user
            await User.findOneAndDelete({ email: employee.email });
            await Employee.findByIdAndDelete(req.params.id);
        }
        res.json({ message: 'Employee and linked user removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
