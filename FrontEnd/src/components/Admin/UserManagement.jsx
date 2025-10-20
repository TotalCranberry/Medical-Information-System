import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  DoNotDisturb,
  PeopleAlt,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { fetchUsers, approveUser, editUserProfile, disableUser, resetPassword } from '../../api/admin';

// Main User Management component
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('PENDING_APPROVAL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', dateOfBirth: '' });

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

    const handleDisableUser = async (userId) => {
        if (window.confirm('Are you sure you want to disable this user account?')) {
            try {
                await disableUser(userId);
                setSuccess('User disabled successfully!');
                setTimeout(() => setSuccess(''), 3000);
                loadUsers();
            } catch (err) {
                setError('Failed to disable user.');
            }
        }
    };

    const handleResetPassword = async (user) => {
        if (window.confirm(`Are you sure you want to reset the password for ${user.name}? This action cannot be undone.`)) {
            try {
                const response = await resetPassword(user.id);
                setSuccess(response.message || 'Password reset successfully. Check logs for temp password.');
                setTimeout(() => setSuccess(''), 5000);
            } catch (err) {
                setError('Failed to reset password.');
            }
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRefresh = () => {
        loadUsers();
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name || '',
            dateOfBirth: user.dateOfBirth || ''
        });
    };

    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            await editUserProfile(editingUser.id, editFormData);
            setSuccess('User profile updated successfully!');
            setEditingUser(null);
            setTimeout(() => setSuccess(''), 3000);
            loadUsers();
        } catch (err) {
            setError('Failed to update user profile.');
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditFormData({ name: '', dateOfBirth: '' });
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return { icon: <HourglassEmpty />, label: "Pending", chipColor: "warning" };
            case 'ACTIVE':
                return { icon: <CheckCircle />, label: "Active", chipColor: "success" };
            case 'DISABLED':
                return { icon: <DoNotDisturb />, label: "Disabled", chipColor: "error" };
            default:
                return { icon: null, label: "Unknown", chipColor: "default" };
        }
    };

    const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    User Management
                </Typography>
                <Typography color="text.secondary">
                    Review pending account registrations and manage all users in the system.
                </Typography>
            </Box>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Status Filter</InputLabel>
                        <Select value={filter || ''} label="Status Filter" onChange={(e) => setFilter(e.target.value || null)}>
                            <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="DISABLED">Disabled</MenuItem>
                            <MenuItem value="">All Users</MenuItem>
                        </Select>
                    </FormControl>
                    <Tooltip title="Refresh Users">
                        <IconButton onClick={handleRefresh} color="primary"><RefreshIcon /></IconButton>
                    </Tooltip>
                </Box>

                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => {
                                    const statusInfo = getStatusInfo(user.status);
                                    return (
                                        <TableRow key={user.id} hover>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell><Chip component="div" label={user.role} size="small" /></TableCell>
                                            <TableCell><Chip component="div" icon={statusInfo.icon} label={statusInfo.label} color={statusInfo.chipColor} size="small" variant="outlined" /></TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0} justifyContent="center">
                                                    <Tooltip title="Edit Profile"><IconButton color="primary" onClick={() => handleEditUser(user)}><EditIcon /></IconButton></Tooltip>
                                                    {user.status === 'PENDING_APPROVAL' && (<Tooltip title="Approve User"><IconButton color="success" onClick={() => handleApproveUser(user.id)}><CheckIcon /></IconButton></Tooltip>)}
                                                    {user.status !== 'DISABLED' && (<Tooltip title="Disable User"><IconButton color="error" onClick={() => handleDisableUser(user.id)}><BlockIcon /></IconButton></Tooltip>)}
                                                    <Tooltip title="Reset Password"><span><IconButton color="secondary" onClick={() => handleResetPassword(user)} disabled={user.authMethod === 'GoogleAuth'}><VpnKeyIcon /></IconButton></span></Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <PeopleAlt sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                                        <Typography variant="h6" color="text.secondary">No Users Found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            
            <Dialog open={!!editingUser} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField label="Name" value={editFormData.name} onChange={(e) => handleEditFormChange('name', e.target.value)} fullWidth />
                        <TextField label="Date of Birth" type="date" value={editFormData.dateOfBirth} onChange={(e) => handleEditFormChange('dateOfBirth', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}