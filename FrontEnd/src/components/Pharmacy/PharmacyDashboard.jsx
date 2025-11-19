import React, { useState, useEffect, useMemo } from "react";
import AnnouncementDisplay from "../AnnouncementDisplay";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Paper,
  Grid
} from "@mui/material";
import dayjs from "dayjs";
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
import {
  ErrorOutline,
  WarningAmber,
  Inventory,
  CheckCircleOutline
} from "@mui/icons-material";
import {
  getPrescriptionsForPharmacy,
  getCompletedPrescriptionsForPharmacy
} from "../../api/prescription";
// Assuming you have an API function to get all medicines
import { getAllMedicines } from "../../api/medicine";

const PharmacyDashboard = ({ user }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Build a nice display name from whatever fields you have
  const pharmacistName = useMemo(() => {
    const direct = (user?.name || user?.fullName || "").trim();
    const combo = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return direct || combo || user?.username || "Pharmacist";
  }, [user]);

  // Helper function to process completed prescriptions by weekday for current week
  const processWeeklyData = (completedPrescriptions) => {
    const now = dayjs();
    const startOfWeek = now.startOf('week'); // Monday
    const endOfWeek = now.endOf('week'); // Sunday

    const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

    completedPrescriptions.forEach(prescription => {
      // For completed prescriptions, the completion date is `updatedAt`
      const completionDate = dayjs(prescription.updatedAt);
      if (completionDate.isBetween(startOfWeek, endOfWeek, null, '[]')) {
        const dayName = completionDate.format('ddd');
        dayCounts[dayName]++;
      }
    });

    setWeeklyData(Object.entries(dayCounts).map(([day, count]) => ({ day, count })));
  };

  // Helper function to process daily pending and completed prescriptions
  const processDailyData = (pendingPrescriptions, completedPrescriptions) => {
    const today = dayjs().startOf('day');

    // Count pending prescriptions for today based on their creation date
    const pendingToday = pendingPrescriptions.filter(p => {
      const date = dayjs(p.prescriptionDate || p.createdAt);
      return date.isSame(today, 'day');
    }).length;

    // Count prescriptions completed today based on their update date
    const completedToday = completedPrescriptions.filter(p => {
      const date = dayjs(p.updatedAt);
      return date.isSame(today, 'day');
    }).length;

    setDailyData([
      { name: "Pending", value: pendingToday, color: "#FF6B35" },
      { name: "Completed", value: completedToday, color: "#4CAF50" }
    ]);
  };

  // Helper function to process medicine inventory for notifications
  const processMedicineData = (medicines) => {
    const alerts = [];
    const today = dayjs().startOf('day');

    medicines.forEach(med => {
      // Check for low stock
      if (med.stock != null && med.stock < (med.lowStockQuantity || 50)) {
        alerts.push({
          type: 'Low Stock',
          message: `${med.name} is low in stock (${med.stock} remaining).`,
          icon: <Inventory color="warning" />,
        });
      }
      
      // Only process expiry if the date exists
      if (med.expiry) {
        const expiryDate = dayjs(med.expiry);
        // Check for expired medicines
        if (expiryDate.isBefore(today, 'day')) {
          alerts.push({
            type: 'Expired',
            message: `${med.name} has expired on ${expiryDate.format('YYYY-MM-DD')}.`,
            icon: <ErrorOutline color="error" />,
          });
        } else if (expiryDate.diff(today, 'day') <= 30) { // Check if expiry is within 30 days from today
          const daysLeft = expiryDate.diff(today, 'day');
          alerts.push({
            type: 'Nearly Expired',
            message: `${med.name} will expire in ${daysLeft} day(s).`,
            icon: <WarningAmber sx={{ color: '#ED6C02' }} />,
          });
        }
      }
    });
    setNotifications(alerts);
  };

  // This function is no longer needed with the new logic
  /*
  const processDailyData_old = (prescriptions) => {
    const today = dayjs().startOf('day');

    const todayPrescriptions = prescriptions.filter(prescription => {
      const dateField = prescription.isActive ? (prescription.prescriptionDate || prescription.createdAt) : (prescription.updatedAt || prescription.prescriptionDate);
      const date = dayjs(dateField);
      return date.isSame(today, 'day');
    });

    let pending = 0;
    let completed = 0;

    todayPrescriptions.forEach(prescription => {
      if (prescription.isActive) {
        pending++;
      } else {
        completed++;
      }
    });

    setDailyData([
      { name: "Pending", value: pending, color: "#FF6B35" },
      { name: "Completed", value: completed, color: "#4CAF50" }
    ]);
  };
  */

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingResponse, completedResponse, medicineResponse] = await Promise.all([
          getPrescriptionsForPharmacy(),
          getCompletedPrescriptionsForPharmacy(),
          getAllMedicines() // Fetch medicine data
        ]);
        processWeeklyData(completedResponse || []);
        processDailyData(pendingResponse || [], completedResponse || []);
        processMedicineData(medicineResponse || []);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      }
    };

    fetchData();
  }, []);

  // Dynamic updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [pendingResponse, completedResponse, medicineResponse] = await Promise.all([
          getPrescriptionsForPharmacy(),
          getCompletedPrescriptionsForPharmacy(),
          getAllMedicines()
        ]);
        processWeeklyData(completedResponse || []);
        processDailyData(pendingResponse || [], completedResponse || []);
        processMedicineData(medicineResponse || []);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        py: { xs: 2, sm: 3, md: 3, lg: 4 },
        maxWidth: "1400px",
        mx: "auto"
      }}
    >
      <AnnouncementDisplay />
      <Typography
        variant="h4"
        sx={{
          color: "#0c3c3c",
          fontWeight: 800,
          textAlign: "left",
          mb: { xs: 3, md: 4 },
          fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem", lg: "3.2rem" },
          pl: { xs: 1, md: 2 }
        }}
      >
        Welcome, {pharmacistName}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              height: 300,
              background: '#f0f8ff', // Light blue, eye-friendly
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                textAlign: 'center',
                color: '#0c3c3c'
              }}
            >
              📊 Weekly Completed Prescriptions
            </Typography>
            <Box sx={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#FFA500" />
                      <stop offset="100%" stopColor="#FF8C00" />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#333' }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#333' }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: 8,
                      color: '#333'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[2, 2, 0, 0]}
                    filter="url(#shadow)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              height: 300,
              background: '#f0f8ff',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                textAlign: 'center',
                color: '#0c3c3c'
              }}
            >
              🥧 Daily Status (3D View)
            </Typography>
            <Box sx={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.2)" />
                    </filter>
                  </defs>
                  <Pie
                    data={dailyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    filter="url(#pieShadow)"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: 8,
                      color: '#333'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              height: 300,
              background: '#f0f8ff',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0c3c3c', mb: 1 }}>
              🔔 Notifications
            </Typography>
            <Box sx={{ overflowY: 'auto', width: '100%', flexGrow: 1 }}>
              {notifications.length > 0 ? (
                <List dense>
                  {notifications.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.type}
                          secondary={item.message}
                          primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: '#0c3c3c'
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 48, color: 'green', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    All Clear!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    No urgent notifications. Keep up the great work!
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PharmacyDashboard;
