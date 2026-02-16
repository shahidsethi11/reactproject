import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return user ? (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute;
