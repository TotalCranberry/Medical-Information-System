import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Paper, Button } from '@mui/material';
import { CheckCircle, HourglassEmpty, DoNotDisturb, PeopleAlt } from '@mui/icons-material';
import { fetchUsers, approveUser } from '../../api/admin';

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
        <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {user.email}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip label={user.role} size="small" sx={{ fontWeight: 'medium' }} />
                        <Chip
                            icon={currentStatus.icon}
                            label={currentStatus.label}
                            color={currentStatus.chipColor}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                </Box>
                {user.status === 'PENDING_APPROVAL' && (
                    <Box sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleApprove}
                            sx={{
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: 2,
                                '&:hover': {
                                    boxShadow: 4,
                                    backgroundColor: 'success.dark'
                                }
                            }}
                        >
                            Approve
                        </Button>
                    </Box>
                )}
            </Box>
        </Paper>
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

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>Filter by status:</Typography>
                    <Button
                        variant={filter === 'PENDING_APPROVAL' ? 'contained' : 'outlined'}
                        onClick={() => setFilter('PENDING_APPROVAL')}
                        sx={{
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 50,
                            minWidth: 120
                        }}
                    >
                        Pending Approval
                    </Button>
                    <Button
                        variant={!filter ? 'contained' : 'outlined'}
                        onClick={() => setFilter(null)}
                        sx={{
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 50,
                            minWidth: 120
                        }}
                    >
                        All Users
                    </Button>
                </Box>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
                <div className="space-y-4">
                    {users.length > 0 ? (
                        users.map(user => <UserCard key={user.id} user={user} onApprove={handleApproveUser} />)
                    ) : (
                        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                            <PeopleAlt sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Users Found</Typography>
                            <Typography color="text.secondary">There are no users matching the current filter.</Typography>
                        </Paper>
                    )}
                </div>
            )}
        </Box>
    );
}

