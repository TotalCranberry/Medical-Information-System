import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Grid, TextField, CircularProgress, Alert } from '@mui/material';
import { submitMedicalForm } from '../../api/patient';

const MedicalForm = ({ onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        medicalHistory: {
            pastHospitalAdmissions: '',
            chronicIllnesses: '',
            physicalDisabilities: '',
            allergies: ''
        },
        emergencyContact: {
            name: '',
            address: '',
            phone: ''
        },
        eyeExam: {
            visionWithoutGlasses: { right: '', left: '' },
            visionWithGlasses: { right: '', left: '' },
            colorVision: ''
        },
        dentalExam: {
            oralHealthCondition: ''
        },
        physicalExam: {
            weightKg: '',
            heightCm: '',
            bmi: '',
            vaccinationStatus: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        setFormData(prevData => {
            let data = { ...prevData };
            let temp = data;
            for (let i = 0; i < keys.length - 1; i++) {
                temp = temp[keys[i]];
            }
            temp[keys[keys.length - 1]] = value;
            return data;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await submitMedicalForm(formData);
            setSuccess(true);
            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } catch (err) {
            setError(err.message || 'An error occurred while submitting the form.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Medical Information Form</Typography>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                Please fill out this form carefully by looking at the medical form provided to you from a government hospital.
            </Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom>Medical History</Typography>
                    <TextField name="medicalHistory.pastHospitalAdmissions" label="Past Hospital Admissions" fullWidth onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="medicalHistory.chronicIllnesses" label="Chronic Illnesses" fullWidth onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="medicalHistory.physicalDisabilities" label="Physical Disabilities" fullWidth onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="medicalHistory.allergies" label="Allergies" fullWidth onChange={handleChange} />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Emergency Contact</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField name="emergencyContact.name" label="Name" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="emergencyContact.phone" label="Phone" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="emergencyContact.address" label="Address" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Eye Exam</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField name="eyeExam.visionWithoutGlasses.right" label="Vision (Without Glasses) - Right" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="eyeExam.visionWithoutGlasses.left" label="Vision (Without Glasses) - Left" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="eyeExam.visionWithGlasses.right" label="Vision (With Glasses) - Right" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="eyeExam.visionWithGlasses.left" label="Vision (With Glasses) - Left" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField name="eyeExam.colorVision" label="Color Vision" fullWidth onChange={handleChange} /></Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Dental Exam</Typography>
                    <TextField name="dentalExam.oralHealthCondition" label="Oral Health Condition" fullWidth onChange={handleChange} />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Physical Exam</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField name="physicalExam.weightKg" label="Weight (Kg)" type="number" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="physicalExam.heightCm" label="Height (cm)" type="number" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="physicalExam.bmi" label="BMI" type="number" fullWidth onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="physicalExam.vaccinationStatus" label="Vaccination Status" fullWidth onChange={handleChange} /></Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </Box>
                </form>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>Medical form submitted successfully!</Alert>}
            </Paper>
        </Box>
    );
};

export default MedicalForm;