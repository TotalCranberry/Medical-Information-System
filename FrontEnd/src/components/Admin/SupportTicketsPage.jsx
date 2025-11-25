import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import apiFetch from '../../api/api';

const SupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        try {
            const params = filter === 'OPEN' ? '?status=OPEN' : '';
            const data = await apiFetch(`/admin/support-tickets${params}`, 'GET', null, true);
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch support tickets', error);
        }
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseDialog = () => {
        setSelectedTicket(null);
        setReply('');
    };

    const handleReplySubmit = async () => {
        if (!reply.trim()) return;
        try {
            await apiFetch(`/admin/support-tickets/${selectedTicket.id}/reply`, 'POST', { reply }, true);
            fetchTickets();
            setReply('');
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to submit reply', error);
        }
    };

    const handleCloseTicket = async () => {
        try {
            await apiFetch(`/admin/support-tickets/${selectedTicket.id}/close`, 'PUT', null, true);
            fetchTickets();
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to close ticket', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Support Tickets</Typography>
            <FormControl sx={{ mb: 2, minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Status">
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="OPEN">Open</MenuItem>
                </Select>
            </FormControl>
            <Paper>
                <List>
                    {tickets.map((ticket) => (
                        <ListItem button key={ticket.id} onClick={() => handleTicketClick(ticket)}>
                            <ListItemText
                                primary={ticket.message}
                                secondary={`Status: ${ticket.status} | User: ${ticket.submittedByUser.name}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Dialog open={!!selectedTicket} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>Support Ticket Details</DialogTitle>
                <DialogContent>
                    {selectedTicket && (
                        <>
                            <Typography variant="h6">Original Message:</Typography>
                            <Typography gutterBottom>{selectedTicket.message}</Typography>
                            {selectedTicket.reply && (
                                <>
                                    <Typography variant="h6">Reply:</Typography>
                                    <Typography gutterBottom>{selectedTicket.reply}</Typography>
                                </>
                            )}
                            <TextField
                                label="Reply"
                                fullWidth
                                multiline
                                rows={4}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                margin="normal"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleReplySubmit} variant="contained">Submit Reply</Button>
                    <Button onClick={handleCloseTicket} variant="contained" color="secondary">Close Ticket</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupportTicketsPage;