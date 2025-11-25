import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getUnreadNotifications, markAsRead } from '../api/notifications';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getUnreadNotifications();
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); 

        return () => clearInterval(interval);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    return (
        <div>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {notifications.length === 0 ? (
                    <MenuItem onClick={handleClose}>
                        <Typography>No new notifications</Typography>
                    </MenuItem>
                ) : (
                    notifications.map(notification => (
                        <MenuItem key={notification.id} onClick={() => handleMarkAsRead(notification.id)}>
                            <Typography>{notification.message}</Typography>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </div>
    );
};

export default NotificationBell;