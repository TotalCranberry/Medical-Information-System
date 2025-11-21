import React from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell,
  TableRow, TableContainer
} from '@mui/material';

// Helper component for creating a row
const DataRow = ({ label, value }) => (
  <TableRow>
    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>{label}</TableCell>
    <TableCell>{value && value !== "null" ? value : 'N/A'}</TableCell>
  </TableRow>
);

// Helper component for a section header
const SectionHeader = ({ title }) => (
  <TableRow>
    <TableCell colSpan={2} sx={{ bgcolor: 'grey.100', py: 1 }}>
      <Typography variant="body1" fontWeight={600} color="primary.main">
        {title}
      </Typography>
    </TableCell>
  </TableRow>
);

const ViewPatientMedicalRecord = ({ record }) => {
  // Debug log to see what data actually arrives
  console.log("DEBUG: ViewPatientMedicalRecord received:", record);

  if (!record) {
    return <Typography color="error">Error: Medical record data is empty.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
        Submitted Medical Record
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableBody>
            {/* Medical History */}
            <SectionHeader title="Medical History" />
            <DataRow label="Past Hospital Admissions" value={record.pastHospitalAdmissions} />
            <DataRow label="Chronic Illnesses" value={record.chronicIllnesses} />
            <DataRow label="Physical Disabilities" value={record.physicalDisabilities} />
            <DataRow label="Allergies" value={record.allergies} />

            {/* Emergency Contact */}
            <SectionHeader title="Emergency Contact" />
            <DataRow label="Name" value={record.emergencyContactName} />
            <DataRow label="Address" value={record.emergencyContactAddress} />
            <DataRow label="Phone" value={record.emergencyContactPhone} />

            {/* Eye Exam */}
            <SectionHeader title="Eye Exam" />
            <DataRow 
              label="Vision (No Glasses)" 
              value={record.visionWithoutGlasses ? `R: ${record.visionWithoutGlasses.right || '-'}, L: ${record.visionWithoutGlasses.left || '-'}` : 'N/A'} 
            />
            <DataRow 
              label="Vision (With Glasses)" 
              value={record.visionWithGlasses ? `R: ${record.visionWithGlasses.right || '-'}, L: ${record.visionWithGlasses.left || '-'}` : 'N/A'} 
            />
            <DataRow label="Color Vision" value={record.colorVision} />
            
            {/* Dental Exam */}
            <SectionHeader title="Dental Exam" />
            <DataRow label="Oral Health Condition" value={record.oralHealthCondition} />

            {/* Physical Exam */}
            <SectionHeader title="Physical Exam" />
            <DataRow label="Weight" value={record.weightKg ? `${record.weightKg} Kg` : 'N/A'} />
            <DataRow label="Height" value={record.heightCm ? `${record.heightCm} cm` : 'N/A'} />
            <DataRow label="BMI" value={record.bmi} />
            <DataRow label="Vaccination Status" value={record.vaccinationStatus} />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ViewPatientMedicalRecord;