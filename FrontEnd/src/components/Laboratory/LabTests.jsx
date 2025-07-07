// import React, { useState } from "react";
// import {
//   Box, Typography, Grid, Card, CardContent,
//   ButtonGroup, Button, Table, TableHead, TableRow, TableCell, TableBody
// } from "@mui/material";

// const LabTestsTab = () => {
//   const [filter, setFilter] = useState("ordered");

//   const stats = {
//     ordered: 12,
//     inProgress: 10,
//     completed: 2,
//     declined: 1,
//   };

//   const patients = [
//     { name: "A.B.C. Dasanayaka", age: 44, gender: "Male", total: 1 },
//     { name: "B.C.D. Ekanayake", age: 22, gender: "Female", total: 2 },
//   ];

//   return (
//     <Box sx={{ maxWidth: 900, margin: "40px auto", p: 3 }}>
//       <Typography variant="h4" mb={3}>Lab Tests</Typography>

//       <Grid container spacing={2} sx={{ mb: 3 }}>
//         <Grid item xs={4}><StatCard title="Test Ordered" value={stats.ordered} /></Grid>
//         <Grid item xs={4}><StatCard title="Worklist" value={stats.inProgress} /></Grid>
//         <Grid item xs={4}><StatCard title="Results" value={stats.completed} /></Grid>
//       </Grid>

//       <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
//         <Button onClick={() => setFilter("ordered")} variant={filter === "ordered" ? "contained" : "outlined"}>Test Ordered</Button>
//         <Button onClick={() => setFilter("inProgress")} variant={filter === "inProgress" ? "contained" : "outlined"}>In Progress</Button>
//         <Button onClick={() => setFilter("completed")} variant={filter === "completed" ? "contained" : "outlined"}>Completed</Button>
//         <Button onClick={() => setFilter("declined")} variant={filter === "declined" ? "contained" : "outlined"}>Declined Tests</Button>
//       </ButtonGroup>

//       <Table size="small">
//         <TableHead>
//           <TableRow>
//             <TableCell>Patient</TableCell>
//             <TableCell>Age</TableCell>
//             <TableCell>Gender</TableCell>
//             <TableCell>Total Orders</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {patients.map((p, i) => (
//             <TableRow key={i}>
//               <TableCell>{p.name}</TableCell>
//               <TableCell>{p.age}</TableCell>
//               <TableCell>{p.gender}</TableCell>
//               <TableCell>{p.total}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </Box>
//   );
// };

// const StatCard = ({ title, value }) => (
//   <Card>
//     <CardContent>
//       <Typography variant="subtitle1">{title}</Typography>
//       <Typography variant="h3">{value}</Typography>
//     </CardContent>
//   </Card>
// );

// export default LabTestsTab;
import React, { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  ButtonGroup, Button, Table, TableHead, TableRow, TableCell, TableBody,
  useTheme, useMediaQuery, Stack
} from "@mui/material";

const LabTestsTab = () => {
  const [filter, setFilter] = useState("ordered");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const stats = {
    ordered: 12,
    inProgress: 10,
    completed: 2,
    declined: 1,
  };

  const patients = [
    { name: "A.B.C. Dasanayaka", age: 44, gender: "Male", total: 1 },
    { name: "B.C.D. Ekanayake", age: 22, gender: "Female", total: 2 },
  ];

  const filterButtons = [
    { key: "ordered", label: "Test Ordered" },
    { key: "inProgress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "declined", label: "Declined Tests" }
  ];

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: '100%', md: 900 }, 
      margin: { xs: "20px 16px", sm: "30px 24px", md: "40px auto" }, 
      p: { xs: 1, sm: 2, md: 3 } 
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        mb={3}
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      >
        Lab Tests
      </Typography>

      {/* Stats Cards - Responsive Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="Test Ordered" value={stats.ordered} isMobile={isMobile} />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="Worklist" value={stats.inProgress} isMobile={isMobile} />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="Results" value={stats.completed} isMobile={isMobile} />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="Declined" value={stats.declined} isMobile={isMobile} />
        </Grid>
      </Grid>

      {/* Filter Buttons - Responsive Layout */}
      {isMobile ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              variant={filter === btn.key ? "contained" : "outlined"}
              fullWidth
              size="small"
            >
              {btn.label}
            </Button>
          ))}
        </Stack>
      ) : (
        <ButtonGroup 
          variant="outlined" 
          sx={{ 
            mb: 2,
            flexWrap: 'wrap',
            '& .MuiButtonGroup-grouped': {
              minWidth: { xs: '120px', sm: '140px' }
            }
          }}
        >
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              variant={filter === btn.key ? "contained" : "outlined"}
              size={isTablet ? "small" : "medium"}
            >
              {btn.label}
            </Button>
          ))}
        </ButtonGroup>
      )}

      {/* Table - Responsive */}
      <Box sx={{ 
        overflowX: 'auto',
        '& .MuiTable-root': {
          minWidth: { xs: 400, sm: 500 }
        }
      }}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Orders</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p, i) => (
              <TableRow key={i}>
                <TableCell sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  maxWidth: { xs: '120px', sm: 'none' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {p.name}
                </TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.gender}</TableCell>
                <TableCell>{p.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

const StatCard = ({ title, value, isMobile }) => (
  <Card sx={{ 
    height: '100%',
    minHeight: { xs: '80px', sm: '100px' }
  }}>
    <CardContent sx={{ 
      p: { xs: 1, sm: 2 },
      '&:last-child': { pb: { xs: 1, sm: 2 } }
    }}>
      <Typography 
        variant={isMobile ? "caption" : "subtitle1"}
        sx={{ 
          fontSize: { xs: '0.75rem', sm: '1rem' },
          lineHeight: 1.2,
          mb: 0.5
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant={isMobile ? "h5" : "h3"}
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          fontWeight: 'bold'
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default LabTestsTab;