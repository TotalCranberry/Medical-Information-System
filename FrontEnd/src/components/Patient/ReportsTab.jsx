import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Link, Grid
} from "@mui/material";

const ReportsTab = ({ history, labs, prescriptions }) => (
  <Box>
    <Typography variant="h3" color="primary" fontWeight={700} mb={4} textAlign={{ xs: "center", md: "left" }}>
      Medical Reports
    </Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Medical History Summary</Typography>
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
                    <TableCell colSpan={3}>No history found</TableCell>
                  </TableRow>
                ) : (
                  history.map(item => (
                    <TableRow key={item.date}>
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
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Lab Results</Typography>
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
                    <TableCell colSpan={3}>No lab results</TableCell>
                  </TableRow>
                ) : (
                  labs.map(lab => (
                    <TableRow key={lab.type}>
                      <TableCell>{lab.type}</TableCell>
                      <TableCell>{lab.date}</TableCell>
                      <TableCell>
                        <Link href="#">View</Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Prescriptions</Typography>
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
                    <TableCell colSpan={3}>No prescriptions</TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map(rx => (
                    <TableRow key={rx.date}>
                      <TableCell>{rx.doctor}</TableCell>
                      <TableCell>{rx.date}</TableCell>
                      <TableCell>
                        <Link href="#">Download</Link>
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
