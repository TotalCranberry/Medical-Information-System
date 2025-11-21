import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Button
} from '@mui/material';
import { History } from '@mui/icons-material';
import { fetchAuditLogs } from '../../api/admin';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; 

export default function AuditLogPage() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            setError('');
            
            const data = await fetchAuditLogs(searchTerm, startDate, endDate);
            setAuditLogs(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch audit logs. Please try again.');
            showSnackbar('Failed to fetch audit logs. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, []); 

    const handleSearch = () => {
        loadAuditLogs();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate(null);
        setEndDate(null);
        setTimeout(() => {
             fetchAuditLogs('', null, null).then(setAuditLogs).catch(console.error);
        }, 0);
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    System Audit Log
                </Typography>
            </Box>

            <Paper elevation={2} sx={{ p: 3 }}>
                {/* Search and Filter Bar */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="Search by User Email"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 250 }}
                    />
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            inputFormat="dd/MM/yyyy"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <DatePicker
                            label="End Date"
                            inputFormat="dd/MM/yyyy"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>
                    
                    <Button 
                        variant="contained" 
                        onClick={handleSearch}
                        sx={{ height: 40 }}
                    >
                        Search
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={clearFilters}
                        sx={{ height: 40 }}
                    >
                        Clear Filters
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : auditLogs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <History sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            No Audit Logs Found
                        </Typography>
                        <Typography color="text.secondary">
                            Try adjusting your search filters to see more results.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {auditLogs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>{log.userEmail}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{log.details}</TableCell>
                                        <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}