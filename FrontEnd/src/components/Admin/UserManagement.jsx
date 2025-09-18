import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { CheckCircle, HourglassEmpty, DoNotDisturb, PeopleAlt } from '@mui/icons-material';
import { fetchUsers, approveUser } from '../api/admin';

// A single user card component
const UserCard = ({ user, onApprove }) => {
    const handleApprove = () => {
        if (window.confirm(`Are you sure you want to approve the account for ${user.name}?`)) {
            onApprove(user.id);
        }
    };

    const statusInfo = {
        PENDING_APPROVAL: { icon: <HourglassEmpty className="text-yellow-500" />, label: "Pending", chipColor: "warning" },
        ACTIVE: { icon: <CheckCircle className="text-green-500" />, label: "Active", chipColor: "success" },
        DISABLED: { icon: <DoNotDisturb className="text-red-500" />, label: "Disabled", chipColor: "error" },
    };
    
    const currentStatus = statusInfo[user.status] || { label: "Unknown" };

    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
                <Typography variant="h6" sx={{fontWeight: '600', color: '#2c3e50' }}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                <div className="mt-2 flex items-center gap-4">
                    <Chip label={user.role} size="small" sx={{fontWeight: 'medium'}} />
                    <Chip icon={currentStatus.icon} label={currentStatus.label} color={currentStatus.chipColor} size="small" variant="outlined" />
                </div>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                {user.status === 'PENDING_APPROVAL' && (
                    <button
                        onClick={handleApprove}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Approve
                    </button>
                )}
            </div>
        </div>
    );
};

// Main User Management component
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('PENDING_APPROVAL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchUsers(filter);
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleApproveUser = async (userId) => {
        try {
            await approveUser(userId);
            setSuccess('User approved successfully!');
            setTimeout(() => setSuccess(''), 3000);
            loadUsers();
        } catch (err) {
            setError('Failed to approve user.');
        }
    };
    
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    User Management
                </Typography>
                <Typography color="text.secondary">
                    Review pending account registrations and manage all users in the system.
                </Typography>
            </Box>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body1" sx={{fontWeight: 'medium'}}>Filter by status:</Typography>
                    <button onClick={() => setFilter('PENDING_APPROVAL')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'PENDING_APPROVAL' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                        Pending Approval
                    </button>
                    <button onClick={() => setFilter(null)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!filter ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                        All Users
                    </button>
                </Box>
            </div>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
                <div className="space-y-4">
                    {users.length > 0 ? (
                        users.map(user => <UserCard key={user.id} user={user} onApprove={handleApproveUser} />)
                    ) : (
                        <div className="text-center p-6 bg-white rounded-lg shadow border border-gray-200">
                            <PeopleAlt sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No Users Found</Typography>
                            <Typography color="text.secondary">There are no users matching the current filter.</Typography>
                        </div>
                    )}
                </div>
            )}
        </Box>
    );
}

