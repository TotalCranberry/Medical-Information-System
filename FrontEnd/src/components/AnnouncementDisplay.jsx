import React, { useState, useEffect } from 'react';
import { Alert, Typography } from '@mui/material';
import apiFetch from '../api/api';

const AnnouncementDisplay = () => {
    const [announcement, setAnnouncement] = useState(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const announcements = await apiFetch('/announcements', 'GET', null, true);
                if (announcements && announcements.length > 0) {
                    const sortedAnnouncements = announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setAnnouncement(sortedAnnouncements[0]);
                }
            } catch (error) {
                console.error('Failed to fetch announcements', error);
            }
        };

        fetchAnnouncements();
    }, []);

    if (!announcement) {
        return null;
    }

    return (
        <Alert
            severity="info"
            sx={{ mb: 3 }}
            onClose={async () => {
                try {
                    await apiFetch(`/announcements/${announcement.id}/acknowledge`, 'POST', null, true);
                    setAnnouncement(null);
                } catch (error) {
                    console.error('Failed to acknowledge announcement', error);
                }
            }}
        >
            <Typography variant="h6">{announcement.title}</Typography>
            <Typography>{announcement.content}</Typography>
            <Typography variant="caption" display="block" mt={1}>
                - {announcement.authorName} on {new Date(announcement.createdAt).toLocaleDateString()}
            </Typography>
        </Alert>
    );
};

export default AnnouncementDisplay;