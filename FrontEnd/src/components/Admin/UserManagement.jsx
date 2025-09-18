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
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  DoNotDisturb,
  PeopleAlt,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchUsers, approveUser } from '../../api/admin';

// Main User Management component
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('PENDING_APPROVAL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return { 
                    icon: <HourglassEmpty sx={{ color: '#ff9800' }} />, 
                    label: "Pending", 
                    chipColor: "warning" 
                };
            case 'ACTIVE':
                return { 
                    icon: <CheckCircle sx={{ color: '#4caf50' }} />, 
                    label: "Active", 
                    chipColor: "success" 
                };
            case 'DISABLED':
                return { 
                    icon: <DoNotDisturb sx={{ color: '#f44336' }} />, 
                    label: "Disabled", 
                    chipColor: "error" 
                };
            default:
                return { 
                    icon: null, 
                    label: "Unknown", 
                    chipColor: "default" 
                };
        }
    };

    // Slice the users array for pagination
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>Filter by status:</Typography>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filter || ''}
                                label="Status"
                                onChange={(e) => setFilter(e.target.value || null)}
                            >
                                <MenuItem value="">All Users</MenuItem>
                                <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="DISABLED">Disabled</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleRefresh} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.length > 0 ? (
                                        paginatedUsers.map((user) => {
                                            const statusInfo = getStatusInfo(user.status);
                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {user.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.role}
                                                            size="small"
                                                            sx={{ fontWeight: 'medium' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={statusInfo.icon}
                                                            label={statusInfo.label}
                                                            color={statusInfo.chipColor}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.status === 'PENDING_APPROVAL' && (
                                                            <Tooltip title="Approve User">
                                                                <IconButton
                                                                    color="success"
                                                                    onClick={() => handleApproveUser(user.id)}
                                                                >
                                                                    <CheckIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <PeopleAlt sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                                    No Users Found
                                                </Typography>
                                                <Typography color="text.secondary">
                                                    There are no users matching the current filter.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {users.length > 0 && (
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={users.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        )}
                    </>
                )}
            </Paper>
        </Box>
    );
}
