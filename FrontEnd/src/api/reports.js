import apiFetch from './api';

// Fetches all diagnoses for the logged-in patient
export async function fetchDiagnoses() {
  return apiFetch('/patient/reports/diagnoses', 'GET', null, true);
}

// Fetches all medical records for the logged-in patient
export async function fetchMedicals() {
  return apiFetch('/patient/reports/medicals', 'GET', null, true);
}

// Fetch single medical report (authenticated)
export async function fetchPatientMedical(medicalId) {
  return apiFetch(`/patient/view-medical/${medicalId}`, 'GET', null, true);
}

export async function fetchPrescriptions() {
  return apiFetch('/patient/prescriptions', 'GET', null, true);
}

export async function fetchReports() {
  return apiFetch('/patient/reports', 'GET', null, true);
}

export async function fetchLabRequests() {
  return apiFetch('/patient/lab-requests', 'GET', null, true);
}