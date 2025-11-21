import apiFetch from "./api";

/* -------------------- Doctor & Common -------------------- */

// Create a new prescription (Doctor only)
export const createPrescription = (prescriptionData) =>
  apiFetch("/prescriptions/create", "POST", prescriptionData, true);

// Get prescription by ID (also used by Pharmacy “View”)
export const getPrescriptionById = (prescriptionId) =>
  apiFetch(`/prescriptions/${prescriptionId}`, "GET", null, true);

// Get all prescriptions by current doctor
export const getMyPrescriptions = () =>
  apiFetch("/prescriptions/doctor/my-prescriptions", "GET", null, true);

// Get recent prescriptions by current doctor (last 30 days)
export const getRecentPrescriptions = () =>
  apiFetch("/prescriptions/doctor/recent", "GET", null, true);

// Get prescriptions by patient ID
export const getPrescriptionsByPatientId = (patientId) =>
  apiFetch(`/prescriptions/patient/${patientId}`, "GET", null, true);

// Get prescription by appointment ID
export const getPrescriptionByAppointmentId = (appointmentId) =>
  apiFetch(`/prescriptions/appointment/${appointmentId}`, "GET", null, true);

/* -------------------- Pharmacy (Queue / Dispense) -------------------- */

// ✅ PENDING QUEUE (Pharmacist only) — matches backend: GET /api/prescriptions/pharmacy/pending
export const getPrescriptionsForPharmacy = () =>
  apiFetch("/prescriptions/pharmacy/pending", "GET", null, true);

// ✅ COMPLETED PRESCRIPTIONS (Pharmacist only) — matches backend: GET /api/prescriptions/pharmacy/completed
export const getCompletedPrescriptionsForPharmacy = () =>
  apiFetch("/prescriptions/pharmacy/completed", "GET", null, true);
// ✅ DISPENSE (auto-decrement inventory + mark inactive)
export const dispensePrescription = (prescriptionId) =>
  apiFetch(`/prescriptions/${prescriptionId}/dispense`, "POST", null, true);

/* -------------------- Optional / Legacy (only if endpoints exist) -------------------- */

// These require matching endpoints on the backend. Keep if you plan to add them.
// Get prescriptions by status with pagination (Pharmacist only)
export const getPrescriptionsByStatus = (
  status,
  page = 0,
  size = 10,
  sortBy = "requestDate"
) =>
  apiFetch(
    `/prescriptions/status/${status}?page=${page}&size=${size}&sortBy=${sortBy}`,
    "GET",
    null,
    true
  );

// Update prescription status (Pharmacist only)
export const updatePrescriptionStatus = (prescriptionId, statusData) =>
  apiFetch(`/prescriptions/${prescriptionId}/status`, "PUT", statusData, true);

// Search prescriptions by patient name
export const searchPrescriptionsByPatientName = (patientName) =>
  apiFetch(
    `/prescriptions/search?patientName=${encodeURIComponent(patientName)}`,
    "GET",
    null,
    true
  );

// Doctor’s prescription statistics (if implemented)
export const getDoctorPrescriptionStatistics = (doctorId) =>
  apiFetch(`/prescriptions/doctor/${doctorId}/statistics`, "GET", null, true);

// Overall prescription statistics (Pharmacist only; if implemented)
export const getOverallPrescriptionStatistics = () =>
  apiFetch("/prescriptions/statistics", "GET", null, true);

// Overdue prescriptions (if implemented)
export const getOverduePrescriptions = () =>
  apiFetch("/prescriptions/overdue", "GET", null, true);

// Delete prescription (Doctor only - soft delete, if implemented)
export const deletePrescription = (prescriptionId) =>
  apiFetch(`/prescriptions/${prescriptionId}`, "DELETE", null, true);

// Available statuses (if implemented)
export const getPrescriptionStatuses = () =>
  apiFetch("/prescriptions/statuses", "GET", null, true);

/* -------------------- Helpers -------------------- */

// Format payload for POST /prescriptions/create
export const formatPrescriptionForSubmission = (formData) => {
  const validMedications = (formData.medications || []).filter(
    (med) => med.medicine?.trim() && med.dosage?.trim() && med.days?.trim()
  );

  return {
    patientId: formData.patientId,
    patientName: formData.patientName,
    appointmentId: formData.appointmentId,
    generalNotes: formData.notes || "",
    medications: validMedications.map((med) => {
      // Convert UI timings object -> enum array
      const timeOfDay = [];
      if (med.timings?.morning) timeOfDay.push("MORNING");
      if (med.timings?.afternoon) timeOfDay.push("AFTERNOON");
      if (med.timings?.evening) timeOfDay.push("EVENING");
      if (med.timings?.night) timeOfDay.push("NIGHT");

      // Map method -> RouteOfAdministration enum
      let route = "ORAL"; // Default to ORAL for most medications
      if (med.method) {
        switch (med.method.toUpperCase()) {
          case "ORAL":
          case "BY MOUTH":
            route = "ORAL";
            break;
          case "INTRAVENOUS":
          case "IV":
            route = "INTRAVENOUS";
            break;
          case "INTRAMUSCULAR":
          case "IM":
            route = "INTRAMUSCULAR";
            break;
          case "SUBCUTANEOUS":
          case "SUBCUT":
            route = "SUBCUTANEOUS";
            break;
          case "TOPICAL":
            route = "TOPICAL";
            break;
          case "INHALATION":
          case "INHALER":
            route = "INHALATION";
            break;
          case "RECTAL":
            route = "RECTAL";
            break;
          case "VAGINAL":
            route = "VAGINAL";
            break;
          case "OPHTHALMIC":
          case "EYE":
            route = "OPHTHALMIC";
            break;
          case "OTIC":
          case "EAR":
            route = "OTIC";
            break;
          default:
            route = "ORAL";
        }
      }

      return {
        medicineId: med.medicineId,
        medicineName: med.medicine,
        dosage: med.dosage,
        timesPerDay: med.timesPerDay || "1",
        durationDays: med.days,
        route,
        timeOfDay,
        instructions: med.remarks || "",
        form: med.medicineDetails?.form || "",
        strength: med.medicineDetails?.strength || "",
      };
    }),
  };
};

// Total medications in a prescription object
export const calculateTotalMedications = (prescription) =>
  prescription.medications ? prescription.medications.length : 0;

// Status color helper (if you keep statuses)
export const getPrescriptionStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "REQUESTED":
      return "warning";
    case "PENDING":
      return "info";
    case "IN_PROGRESS":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "default";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

// Human-friendly date
export const formatPrescriptionDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Date";
  }
};

// UI timing formatter (used on the doctor form side)
export const formatMedicationTiming = (timings) => {
  if (!timings) return "Not specified";
  const times = [];
  if (timings.morning) times.push("Morning");
  if (timings.afternoon) times.push("Afternoon");
  if (timings.evening) times.push("Evening");
  if (timings.night) times.push("Night");
  return times.length > 0 ? times.join(", ") : "Not specified";
};

// Validate doctor form (no quantity requirement)
export const validatePrescriptionForm = (formData) => {
  const errors = {};

  if (!formData.patientName?.trim()) {
    errors.patientName = "Patient name is required";
  }

  if (!formData.medications || formData.medications.length === 0) {
    errors.medications = "At least one medication is required";
  } else {
    const valid = formData.medications.filter(
      (m) => m.medicine?.trim() && m.dosage?.trim() && m.days?.trim()
    );
    if (valid.length === 0) {
      errors.medications = "At least one complete medication entry is required";
    }
    formData.medications.forEach((m, i) => {
      if (m.medicine?.trim() || m.dosage?.trim() || m.days?.trim()) {
        if (!m.medicine?.trim()) errors[`medication_${i}_medicine`] = "Medicine name is required";
        if (!m.dosage?.trim()) errors[`medication_${i}_dosage`] = "Dosage is required";
        if (!m.days?.trim()) errors[`medication_${i}_days`] = "Duration is required";
        else if (isNaN(parseInt(m.days)) || parseInt(m.days) <= 0)
          errors[`medication_${i}_days`] = "Duration must be a positive number";
      }
    });
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Summary builder (works with requestDate OR prescriptionDate OR createdAt)
export const createPrescriptionSummary = (prescription) => {
  const reqDate =
    prescription.requestDate ||
    prescription.prescriptionDate ||
    prescription.createdAt ||
    null;

  return {
    id: prescription.id,
    patientName: prescription.patientName,
    doctorName: prescription.doctorName,
    status: prescription.status,
    medicationCount: calculateTotalMedications(prescription),
    requestDate: reqDate ? formatPrescriptionDate(reqDate) : "N/A",
    completedDate: prescription.completedDate
      ? formatPrescriptionDate(prescription.completedDate)
      : null,
    isActive: prescription.isActive,
  };
};

/* -------------------- Default export (optional) -------------------- */
export default {
  // API calls
  createPrescription,
  getPrescriptionById,
  getMyPrescriptions,
  getRecentPrescriptions,
  getPrescriptionsByPatientId,
  getPrescriptionByAppointmentId,
  getPrescriptionsForPharmacy,
  dispensePrescription,
  getPrescriptionsByStatus,          // if implemented
  updatePrescriptionStatus,          // if implemented
  searchPrescriptionsByPatientName,
  getDoctorPrescriptionStatistics,   // if implemented
  getOverallPrescriptionStatistics,  // if implemented
  getOverduePrescriptions,           // if implemented
  deletePrescription,                // if implemented
  getPrescriptionStatuses,           // if implemented

  // Helpers
  formatPrescriptionForSubmission,
  calculateTotalMedications,
  getPrescriptionStatusColor,
  formatPrescriptionDate,
  formatMedicationTiming,
  validatePrescriptionForm,
  createPrescriptionSummary,
};


// ✅ DISPENSE MANUAL (pharmacist selects items and quantities)
export const dispenseManual = (prescriptionId, items) =>
  apiFetch(`/prescriptions/${prescriptionId}/dispense-manual`, "POST", { items }, true);

// ✅ COMPLETE PRESCRIPTION (mark inactive)
export const completePrescription = (prescriptionId) =>
  apiFetch(`/prescriptions/${prescriptionId}/complete`, "POST", null, true);

// ✅ COMPLETED PRESCRIPTIONS FOR PATIENT — matches backend: GET /api/prescriptions/patient/completed
export const getCompletedPrescriptionsForPatient = () =>
  apiFetch("/prescriptions/patient/completed", "GET", null, true);

// Fetch prescriptions for a patient (Doctor only)
export async function fetchPatientPrescriptions(patientId) {
  return apiFetch(`/doctor/patients/${patientId}/prescriptions`, 'GET', null, true);
}
