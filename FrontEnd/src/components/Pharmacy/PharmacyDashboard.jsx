import React, { useState, useEffect } from "react";
import AnnouncementDisplay from "../AnnouncementDisplay";

// Material UI Components
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Stack,
  Paper,
  Fade
} from "@mui/material";

// Icons
import {
  ErrorOutline,
  WarningAmber,
  Inventory,
  CheckCircleOutline,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";

// Charting Library
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Date Management
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// API Functions
import {
  getPrescriptionsForPharmacy,
  getCompletedPrescriptionsForPharmacy
} from "../../api/prescription";
import { getAllMedicines } from "../../api/medicine";

// Enable dayjs plugin
dayjs.extend(isBetween);

// --- Simple Color Configuration ---
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  lightGray: "#F8F9FA",
  warning: "#FF9800",
  success: "#4CAF50",
  error: "#F44336"
};

const PharmacyDashboard = ({ user }) => {
  // --- State Variables ---
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // --- 1. Determine Name ---
  let pharmacistName = "Pharmacist";
  if (user) {
    if (user.name) pharmacistName = user.name;
    else if (user.fullName) pharmacistName = user.fullName;
    else if (user.firstName) pharmacistName = user.firstName + " " + (user.lastName || "");
  }

  // --- 2. Data Helpers ---

  // Prepare data for Weekly Bar Chart
  const processWeeklyData = (completedPrescriptions) => {
    const now = dayjs();
    const startOfWeek = now.startOf('week');
    const endOfWeek = now.endOf('week');
    
    // Initialize counts
    const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

    completedPrescriptions.forEach(prescription => {
      const completionDate = dayjs(prescription.updatedAt);
      
      // Check if date is within this week
      if (completionDate.isBetween(startOfWeek, endOfWeek, null, '[]')) {
        const dayName = completionDate.format('ddd'); // e.g. "Mon"
        if (dayCounts[dayName] !== undefined) {
          dayCounts[dayName] = dayCounts[dayName] + 1;
        }
      }
    });

    // Convert object to array for Recharts
    const chartData = Object.entries(dayCounts).map(([day, count]) => ({ day, count }));
    setWeeklyData(chartData);
  };

  // Prepare data for Daily Pie Chart
  const processDailyData = (pendingPrescriptions, completedPrescriptions) => {
    const today = dayjs().startOf('day');

    // Count Pending Today
    const pendingToday = pendingPrescriptions.filter(p => {
      const date = dayjs(p.prescriptionDate || p.createdAt);
      return date.isSame(today, 'day');
    }).length;

    // Count Completed Today
    const completedToday = completedPrescriptions.filter(p => {
      const date = dayjs(p.updatedAt);
      return date.isSame(today, 'day');
    }).length;

    setDailyData([
      { name: "Pending", value: pendingToday, color: "#FF6B35" },   // Orange
      { name: "Completed", value: completedToday, color: colors.success } // Green
    ]);
  };

  // Prepare Notifications (Low Stock / Expired)
  const processMedicineData = (medicines) => {
    const alerts = [];
    const today = dayjs().startOf('day');

    medicines.forEach(med => {
      // 1. Check Low Stock
      const limit = med.lowStockQuantity || 50;
      if (med.stock != null && med.stock < limit) {
        alerts.push({
          type: 'Low Stock',
          message: med.name + " is low in stock (" + med.stock + " remaining).",
          icon: <Inventory color="warning" />,
        });
      }

      // 2. Check Expiry
      if (med.expiry) {
        const expiryDate = dayjs(med.expiry);
        
        if (expiryDate.isBefore(today, 'day')) {
          // Already expired
          alerts.push({
            type: 'Expired',
            message: med.name + " expired on " + expiryDate.format('YYYY-MM-DD') + ".",
            icon: <ErrorOutline color="error" />,
          });
        } else if (expiryDate.diff(today, 'day') <= 30) {
          // Expiring soon (30 days)
          const daysLeft = expiryDate.diff(today, 'day');
          alerts.push({
            type: 'Nearly Expired',
            message: med.name + " will expire in " + daysLeft + " day(s).",
            icon: <WarningAmber sx={{ color: '#ED6C02' }} />,
          });
        }
      }
    });
    
    setNotifications(alerts);
  };

  // --- 3. Fetch Data Effect ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pending, completed, meds] = await Promise.all([
          getPrescriptionsForPharmacy(),
          getCompletedPrescriptionsForPharmacy(),
          getAllMedicines()
        ]);
        
        processWeeklyData(completed || []);
        processDailyData(pending || [], completed || []);
        processMedicineData(meds || []);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }
    };
    
    fetchData();

    // Optional: Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- 4. Render ---
  return (
    <Box sx={{ paddingBottom: 4, width: '100%' }}>
      <AnnouncementDisplay />
      
      
      <Fade in timeout={800}>
        <Paper 
          elevation={12} 
          sx={{ 
            padding: 4, 
            marginTop: 4,
            borderRadius: "0px", 
            background: `linear-gradient(135deg, ${colors.white} 0%, #fafffe 100%)`,
            border: "1px solid rgba(12, 60, 60, 0.08)"
          }}
        >
          
          {/* Header Section */}
          <Box display="flex" alignItems="center" marginBottom={4}>
            <Avatar 
              sx={{ 
                bgcolor: colors.primary, 
                marginRight: 2, 
                width: 56, 
                height: 56,
                boxShadow: "0 8px 25px rgba(12, 60, 60, 0.3)"
              }}
            >
              <DashboardIcon fontSize="large" />
            </Avatar>
            
            <Box>
              <Typography
                variant="h4"
                sx={{ 
                  color: colors.primary, 
                  fontWeight: 800,
                  lineHeight: 1.2
                }}
              >
                Welcome, {pharmacistName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                 Here is the pharmacy overview for today.
              </Typography>
            </Box>
          </Box>

          {/* Dashboard Grid */}
          {/* spacing={4} gives nice gaps between the 3 big cards */}
          <Grid container spacing={4} alignItems="stretch">
            
            {/* Card 1: Weekly Activity */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={4} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: "20px",
                  borderLeft: "6px solid " + colors.primary
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: colors.primary }}>
                      <BarChartIcon />
                    </Avatar>
                  }
                  title="Weekly Activity"
                  subheader="Completed Prescriptions"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFD700" />
                          <stop offset="50%" stopColor="#FFA500" />
                          <stop offset="100%" stopColor="#FF8C00" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Daily Status */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={4} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: "20px",
                  borderLeft: "6px solid " + colors.accent
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: colors.accent }}>
                      <PieChartIcon />
                    </Avatar>
                  }
                  title="Daily Status"
                  subheader="Pending vs Completed"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dailyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dailyData.map((entry, index) => (
                          <Cell key={"cell-" + index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3: Notifications */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={4} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  maxHeight: { md: 500 },
                  borderRadius: "20px",
                  borderLeft: "6px solid " + colors.warning
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: colors.warning }}>
                      <NotificationsIcon />
                    </Avatar>
                  }
                  title="Notifications"
                  subheader="Low Stock & Expiry Alerts"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                  {notifications.length > 0 ? (
                    <List>
                      {notifications.map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.type}
                              secondary={item.message}
                              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                              secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                          </ListItem>
                          {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, minHeight: 200 }}>
                      <CheckCircleOutline sx={{ fontSize: 48, color: 'success.light', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary">All Clear!</Typography>
                      <Typography variant="body2" color="text.disabled">No urgent alerts.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Paper>
      </Fade>
    </Box>
  );
};

export default PharmacyDashboard;