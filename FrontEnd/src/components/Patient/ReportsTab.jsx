import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Link
} from "@mui/material";

const ReportsTab = ({ history, labs, prescriptions }) => (
  <Box sx={{ maxWidth: 900, margin: "40px auto", p: 3 }}>
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" mb={1}>Medical History Summary</Typography>
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
                <TableRow key={item.id}>
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
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" mb={1}>Lab Results</Typography>
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
                <TableRow key={lab.id}>
                  <TableCell>{lab.type}</TableCell>
                  <TableCell>{lab.date}</TableCell>
                  <TableCell>
                    <Link href={lab.link} target="_blank" rel="noopener">View</Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={1}>Prescriptions</Typography>
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
                <TableRow key={rx.id}>
                  <TableCell>{rx.doctor}</TableCell>
                  <TableCell>{rx.date}</TableCell>
                  <TableCell>
                    <Link href={rx.link} target="_blank" rel="noopener">Download</Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Box>
);

export default ReportsTab;
