import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router';

interface User {
    _id: string;
    username: string;
    email: string;
    roles: any[]; // Using any[] for now to match backend response which sends populated roles
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    register: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Refresh profile from backend to get latest roles/permissions
            axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${parsedUser.token}` }
            }).then(res => {
                const updatedUser = { ...res.data, token: parsedUser.token };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }).catch(err => {
                console.error('Failed to refresh user profile', err);
                if (err.response?.status === 401) {
                    logout();
                }
            });
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
    };

    const register = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
