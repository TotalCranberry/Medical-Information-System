import apiFetch from "./api";

// ✅ Create a new prescription (Doctor only)
export const createPrescription = (prescriptionData) =>
    apiFetch("/prescriptions/create", "POST", prescriptionData, true);

// ✅ Get prescription by ID
export const getPrescriptionById = (prescriptionId) =>
    apiFetch(`/prescriptions/${prescriptionId}`, "GET", null, true);

// ✅ Get all prescriptions by current doctor
export const getMyPrescriptions = () =>
    apiFetch("/prescriptions/doctor/my-prescriptions", "GET", null, true);

// ✅ Get recent prescriptions by current doctor (last 30 days)
export const getRecentPrescriptions = () =>
    apiFetch("/prescriptions/doctor/recent", "GET", null, true);

// ✅ Get prescriptions by patient ID
export const getPrescriptionsByPatientId = (patientId) =>
    apiFetch(`/prescriptions/patient/${patientId}`, "GET", null, true);

// ✅ Get prescription by appointment ID
export const getPrescriptionByAppointmentId = (appointmentId) =>
    apiFetch(`/prescriptions/appointment/${appointmentId}`, "GET", null, true);

// ✅ Get prescriptions for pharmacy queue (Pharmacist only) - Updated to match backend
export const getPrescriptionsForPharmacy = () =>
    apiFetch("/prescriptions/pharmacist/queue", "GET", null, true);

// ✅ Get prescriptions by status with pagination (Pharmacist only)
export const getPrescriptionsByStatus = (status, page = 0, size = 10, sortBy = "requestDate") =>
    apiFetch(`/prescriptions/status/${status}?page=${page}&size=${size}&sortBy=${sortBy}`, "GET", null, true);

// ✅ Update prescription status (Pharmacist only)
export const updatePrescriptionStatus = (prescriptionId, statusData) =>
    apiFetch(`/prescriptions/${prescriptionId}/status`, "PUT", statusData, true);

// ✅ Search prescriptions by patient name
export const searchPrescriptionsByPatientName = (patientName) =>
    apiFetch(`/prescriptions/search?patientName=${encodeURIComponent(patientName)}`, "GET", null, true);

// ✅ Get doctor's prescription statistics - Updated to match backend
export const getDoctorPrescriptionStatistics = (doctorId) =>
    apiFetch(`/prescriptions/doctor/${doctorId}/statistics`, "GET", null, true);

// ✅ Get overall prescription statistics (Pharmacist only)
export const getOverallPrescriptionStatistics = () =>
    apiFetch("/prescriptions/statistics", "GET", null, true);

// ✅ Get overdue prescriptions (Pharmacist only) - This endpoint doesn't exist in your backend, but we'll keep it
export const getOverduePrescriptions = () =>
    apiFetch("/prescriptions/overdue", "GET", null, true);

// ✅ Delete prescription (Doctor only - soft delete)
export const deletePrescription = (prescriptionId) =>
    apiFetch(`/prescriptions/${prescriptionId}`, "DELETE", null, true);

// ✅ Get available prescription statuses - This endpoint doesn't exist in your backend
export const getPrescriptionStatuses = () =>
    apiFetch("/prescriptions/statuses", "GET", null, true);

// Helper functions for prescription management

// ✅ Format prescription data for submission (without quantity requirements)
export const formatPrescriptionForSubmission = (formData) => {
    // Filter out empty medications
    const validMedications = formData.medications.filter(med =>
        med.medicine.trim() && med.dosage.trim() && med.days.trim()
    );

    return {
        patientId: formData.patientId,
        patientName: formData.patientName,
        appointmentId: formData.appointmentId,
        generalNotes: formData.notes || "",
        medications: validMedications.map(med => ({
            medicineId: med.medicineId,
            medicineName: med.medicine,
            dosage: med.dosage,
            durationDays: parseInt(med.days),
            timings: {
                morning: med.timings?.morning || false,
                afternoon: med.timings?.afternoon || false,
                evening: med.timings?.evening || false,
                night: med.timings?.night || false
            },
            mealTiming: med.mealTiming || "",
            administrationMethod: med.method || "",
            remarks: med.remarks || "",
            // Remove quantityPrescribed from submission data since it's optional
            // quantityPrescribed: med.quantityPrescribed ? parseInt(med.quantityPrescribed) : null
        }))
    };
};

// ✅ Calculate total medications in a prescription
export const calculateTotalMedications = (prescription) => {
    return prescription.medications ? prescription.medications.length : 0;
};

// ✅ Get status color for UI
export const getPrescriptionStatusColor = (status) => {
    switch (status?.toUpperCase()) {
        case 'REQUESTED':
            return 'warning';
        case 'PENDING':
            return 'info';
        case 'IN_PROGRESS':
            return 'primary';
        case 'COMPLETED':
            return 'success';
        case 'CANCELLED':
            return 'default';
        case 'REJECTED':
            return 'error';
        default:
            return 'default';
    }
};

// ✅ Format prescription date for display
export const formatPrescriptionDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

// ✅ Format medication timing for display
export const formatMedicationTiming = (timings) => {
    if (!timings) return 'Not specified';

    const times = [];
    if (timings.morning) times.push('Morning');
    if (timings.afternoon) times.push('Afternoon');
    if (timings.evening) times.push('Evening');
    if (timings.night) times.push('Night');

    return times.length > 0 ? times.join(', ') : 'Not specified';
};

// ✅ Validate prescription form data (without quantity validation)
export const validatePrescriptionForm = (formData) => {
    const errors = {};

    // Validate patient name
    if (!formData.patientName?.trim()) {
        errors.patientName = 'Patient name is required';
    }

    // Validate medications
    if (!formData.medications || formData.medications.length === 0) {
        errors.medications = 'At least one medication is required';
    } else {
        const validMedications = formData.medications.filter(med =>
            med.medicine?.trim() && med.dosage?.trim() && med.days?.trim()
        );

        if (validMedications.length === 0) {
            errors.medications = 'At least one complete medication entry is required';
        }

        // Validate individual medications (without quantity validation)
        formData.medications.forEach((med, index) => {
            if (med.medicine?.trim() || med.dosage?.trim() || med.days?.trim()) {
                if (!med.medicine?.trim()) {
                    errors[`medication_${index}_medicine`] = 'Medicine name is required';
                }
                if (!med.dosage?.trim()) {
                    errors[`medication_${index}_dosage`] = 'Dosage is required';
                }
                if (!med.days?.trim()) {
                    errors[`medication_${index}_days`] = 'Duration is required';
                } else if (isNaN(parseInt(med.days)) || parseInt(med.days) <= 0) {
                    errors[`medication_${index}_days`] = 'Duration must be a positive number';
                }
            }
        });
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ✅ Create prescription summary for display
export const createPrescriptionSummary = (prescription) => {
    return {
        id: prescription.id,
        patientName: prescription.patientName,
        doctorName: prescription.doctorName,
        status: prescription.status,
        medicationCount: calculateTotalMedications(prescription),
        requestDate: formatPrescriptionDate(prescription.requestDate),
        completedDate: prescription.completedDate ?
            formatPrescriptionDate(prescription.completedDate) : null,
        isActive: prescription.isActive
    };
};

// ✅ Export default object with all functions
export default {
    // API calls
    createPrescription,
    getPrescriptionById,
    getMyPrescriptions,
    getRecentPrescriptions,
    getPrescriptionsByPatientId,
    getPrescriptionByAppointmentId,
    getPrescriptionsForPharmacy,
    getPrescriptionsByStatus,
    updatePrescriptionStatus,
    searchPrescriptionsByPatientName,
    getDoctorPrescriptionStatistics,
    getOverallPrescriptionStatistics,
    getOverduePrescriptions,
    deletePrescription,
    getPrescriptionStatuses,

    // Helper functions
    formatPrescriptionForSubmission,
    calculateTotalMedications,
    getPrescriptionStatusColor,
    formatPrescriptionDate,
    formatMedicationTiming,
    validatePrescriptionForm,
    createPrescriptionSummary
};