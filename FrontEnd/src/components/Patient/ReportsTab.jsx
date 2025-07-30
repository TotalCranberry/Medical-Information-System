import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Link, Grid, Divider
} from "@mui/material";

const ReportsTab = ({ history = [], labs = [], prescriptions = [] }) => (
  <Box>
    <Typography variant="h4" color="primary" fontWeight={700} mb={4} textAlign={{ xs: "center", md: "left" }}>
      Medical Reports
    </Typography>
    <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Medical History Summary</Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Doctor Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No history found</TableCell>
                  </TableRow>
                ) : (
                  history.map(item => (
                    <TableRow key={item.id || item.date}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.diagnosis}</TableCell>
                      <TableCell>{item.doctor}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Lab Results</Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>View/Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No lab results</TableCell>
                  </TableRow>
                ) : (
                  labs.map(lab => (
                    <TableRow key={lab.id || lab.type}>
                      <TableCell>{lab.type}</TableCell>
                      <TableCell>{lab.date}</TableCell>
                      <TableCell>
                        <Link href="#" sx={{ color: 'secondary.main' }}>View</Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Prescriptions</Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Issued By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>View/Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No prescriptions</TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map(rx => (
                    <TableRow key={rx.id || rx.date}>
                      <TableCell>{rx.doctor}</TableCell>
                      <TableCell>{rx.date}</TableCell>
                      <TableCell>
                        <Link href="#" sx={{ color: 'secondary.main' }}>Download</Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

export default ReportsTab;
