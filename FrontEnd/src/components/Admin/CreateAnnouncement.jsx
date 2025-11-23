import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import apiFetch from '../../api/api';

const CreateAnnouncement = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetRole, setTargetRole] = useState('ALL');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/admin/announcements', 'POST', { title, content, targetRole }, true);

            setSnackbarMessage('Announcement created successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setTitle('');

            setContent('');
            setTargetRole('ALL');
        } catch (error) {
            console.error('Failed to create announcement', error);
            
            setSnackbarMessage('Failed to create announcement');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Create Announcement</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    label="Content"
                    fullWidth
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Target Audience</InputLabel>
                    <Select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        label="Target Audience"
                    >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="PATIENT">Patient</MenuItem>
                        <MenuItem value="DOCTOR">Doctor</MenuItem>
                        <MenuItem value="STAFF">Staff</MenuItem>
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="PHARMACIST">Pharmacist</MenuItem>
                        <MenuItem value="LABTECHNICIAN">Lab Technician</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    Create
                </Button>
            </form>
        </Box>
    );
};

export default CreateAnnouncement;