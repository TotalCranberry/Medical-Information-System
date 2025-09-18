import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { History } from '@mui/icons-material';

export default function AuditLogPage() {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    System Audit Log
                </Typography>
                <Typography color="text.secondary">
                    Track critical user actions and system events for compliance and security monitoring.
                </Typography>
            </Box>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                 <Alert severity="info" icon={<History />}>
                    <strong>Coming Soon:</strong> This feature is pending backend implementation. Once the audit service and controller are complete, this section will display a log of all critical system activities.
                </Alert>
                {/* Placeholder for the future log table */}
            </div>
        </Box>
    );
}
