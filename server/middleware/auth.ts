import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            req.user = await User.findById(decoded.id).select('-password').populate('roles');

            if (!req.user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ message: 'Not authorized, roles missing' });
        }

        const userRoles = req.user.roles.map((role: any) => role.name);

        const hasRole = userRoles.some((role: string) => allowedRoles.includes(role));

        if (hasRole) {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized, insufficient permissions' });
        }
    }
};

export const checkPermission = (resource: string, action: 'canView' | 'canSave' | 'canEdit' | 'canDelete') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ message: 'Not authorized, user roles missing' });
        }

        // Check if any of the user's roles have the required permission for the resource
        const hasPermission = req.user.roles.some((role: any) => {
            const perm = role.resourcePermissions?.find((p: any) => p.resource === resource);
            return perm ? perm[action] : false;
        });

        if (hasPermission) {
            next();
        } else {
            res.status(403).json({ message: `Not authorized, insufficient permissions for ${action} on ${resource}` });
        }
    }
};
