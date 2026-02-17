import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, roles } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Fetch roles from DB if provided, otherwise default to 'User'
        // Ideally we should validate roles exist, but for now let's assume valid ObjectIds or handle strings if we had a name lookup
        // To simplify, let's assume roles are passed as array of role names or IDs. 
        // For this iteration, let's assume they might pass nothing and we want to assign a default 'User' role if we had one seeded.
        // But since we might not have seeds, let's just allow passing IDs.

        const user: IUser = await User.create({
            username,
            email,
            password,
            roles: roles || [] // Expecting Array of ObjectIds for now
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
                token: generateToken(user._id as unknown as string),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body; // email field here acts as a general identifier

    try {
        const user = await User.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        }).populate('roles');

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
                token: generateToken(user._id as unknown as string),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('roles');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
