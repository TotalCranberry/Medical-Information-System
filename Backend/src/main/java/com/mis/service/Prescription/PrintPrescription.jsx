import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { getPrescriptionById } from '../../api/prescription';
import dayjs from 'dayjs';

// --- Styles ---
const colors = {
  primary: '#0C3C3C',
  gray: '#6C6B6B',
  white: '#ffffff',
  border: '#dee2e6',
};

const PrintPrescription = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!prescriptionId) {
      setError('No prescription ID provided.');
      setLoading(false);
      return;
    }

    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const response = await getPrescriptionById(prescriptionId);
        if (response) {
          setPrescription(response);
        } else {
          setError('Prescription not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch prescription data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Prescription-${prescription?.id || 'details'}`,
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!prescription) {
    return <Alert severity="warning" sx={{ m: 3 }}>No prescription data available.</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, backgroundColor: '#f4f6f8' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="contained" onClick={handlePrint}>
          Print Prescription
        </Button>
      </Box>

      <Paper ref={componentRef} sx={{ p: { xs: 2, sm: 4 }, '@media print': { boxShadow: 'none', margin: 0 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: colors.primary, fontWeight: 'bold' }}>
            Medical Prescription
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            University Health Center
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Patient and Doctor Info */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Patient Name:</Typography>
            <Typography variant="body1">{prescription.patientName}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Age:</Typography>
            <Typography variant="body1">{prescription.patientAge || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Gender:</Typography>
            <Typography variant="body1">{prescription.patientGender || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Prescribing Doctor:</Typography>
            <Typography variant="body1">{prescription.doctorName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
            <Typography variant="body1">
              {dayjs(prescription.prescriptionDate).format('MMMM D, YYYY')}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

        {/* Medications Table */}
        <Typography variant="h6" sx={{ mb: 2, color: colors.primary }}>Medications</Typography>
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Medicine</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Dosage</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Frequency</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Instructions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescription.medications.map((med, index) => (
                <TableRow key={index}>
                  <TableCell>{med.medicineName}</TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>{med.timesPerDay} time(s) a day</TableCell>
                  <TableCell>{med.durationDays} day(s)</TableCell>
                  <TableCell>{med.instructions || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* General Notes */}
        {prescription.generalNotes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>General Notes:</Typography>
            <Typography variant="body1">{prescription.generalNotes}</Typography>
          </Box>
        )}

        {/* Signature and Seal Section */}
        <Grid container spacing={4} sx={{ mt: 8, justifyContent: 'flex-end' }}>
          <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                height: '100px',
                borderBottom: `1px solid ${colors.gray}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              {prescription.doctorSignature ? (
                <img
                  src={prescription.doctorSignature}
                  alt="Doctor's Signature"
                  style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Signature not available
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Doctor's Signature
            </Typography>
          </Grid>

          <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              {prescription.doctorSeal ? (
                <img
                  src={prescription.doctorSeal}
                  alt="Doctor's Seal"
                  style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Seal not available
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Official Seal
            </Typography>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 6, pt: 2, borderTop: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            This is a computer-generated prescription and is valid only with the doctor's signature and seal.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PrintPrescription;