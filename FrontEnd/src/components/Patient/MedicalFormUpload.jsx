import React, { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { uploadMedicalForm } from '../../api/patient';

const MedicalFormUpload = ({ onProfileUpdate }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError(null);
        setExtractedData(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await uploadMedicalForm(formData);
            setExtractedData(response);
            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } catch (err) {
            setError(err.message || 'An error occurred while uploading the form.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Upload Medical Form</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Instructions</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleOutline />
                        </ListItemIcon>
                        <ListItemText primary="Please upload a clear, scanned copy of your 'University of Peradeniya Student Medical Examination Report'." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleOutline />
                        </ListItemIcon>
                        <ListItemText primary="The document must be in PDF format and under 10MB." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleOutline />
                        </ListItemIcon>
                        <ListItemText primary="Ensure all sections of the form are filled out clearly." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckCircleOutline />
                        </ListItemIcon>
                        <ListItemText primary="After uploading, please review the extracted information for accuracy." />
                    </ListItem>
                </List>
            </Paper>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        Select PDF
                        <input
                            type="file"
                            hidden
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={loading}
                        sx={{ ml: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Upload and Process'}
                    </Button>
                </Box>
                {selectedFile && <Typography sx={{ mt: 2 }}>Selected file: {selectedFile.name}</Typography>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {extractedData && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>Extracted Information</Typography>
                        <Paper sx={{ p: 3, mt: 2 }}>
                            <Typography variant="h6" gutterBottom>Personal Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><Typography><b>Name:</b> {extractedData.personalInfo.name}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Enrolment Number:</b> {extractedData.personalInfo.enrolmentNumber}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>NIC:</b> {extractedData.personalInfo.nic}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Date of Birth:</b> {extractedData.personalInfo.dateOfBirth}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Sex:</b> {extractedData.personalInfo.sex}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Nationality:</b> {extractedData.personalInfo.nationality}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Religion:</b> {extractedData.personalInfo.religion}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Marital Status:</b> {extractedData.personalInfo.maritalStatus}</Typography></Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Medical History</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><Typography><b>Past Hospital Admissions:</b> {extractedData.medicalHistory.pastHospitalAdmissions}</Typography></Grid>
                                <Grid item xs={12}><Typography><b>Chronic Illnesses:</b> {extractedData.medicalHistory.chronicIllnesses}</Typography></Grid>
                                <Grid item xs={12}><Typography><b>Physical Disabilities:</b> {extractedData.medicalHistory.physicalDisabilities}</Typography></Grid>
                                <Grid item xs={12}><Typography><b>Allergies:</b> {extractedData.medicalHistory.allergies}</Typography></Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Emergency Contact</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><Typography><b>Name:</b> {extractedData.emergencyContact.name}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Phone:</b> {extractedData.emergencyContact.phone}</Typography></Grid>
                                <Grid item xs={12}><Typography><b>Address:</b> {extractedData.emergencyContact.address}</Typography></Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Eye Exam</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><Typography><b>Vision (Without Glasses):</b> Right: {extractedData.eyeExam.visionWithoutGlasses.right}, Left: {extractedData.eyeExam.visionWithoutGlasses.left}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Vision (With Glasses):</b> Right: {extractedData.eyeExam.visionWithGlasses.right}, Left: {extractedData.eyeExam.visionWithGlasses.left}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Color Vision:</b> {extractedData.eyeExam.colorVision}</Typography></Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Dental Exam</Typography>
                            <Typography><b>Oral Health Condition:</b> {extractedData.dentalExam.oralHealthCondition}</Typography>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Physical Exam</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><Typography><b>Weight:</b> {extractedData.physicalExam.weightKg} kg</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Height:</b> {extractedData.physicalExam.heightCm} cm</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>BMI:</b> {extractedData.physicalExam.bmi}</Typography></Grid>
                                <Grid item xs={12} sm={6}><Typography><b>Vaccination Status:</b> {extractedData.physicalExam.vaccinationStatus}</Typography></Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default MedicalFormUpload;