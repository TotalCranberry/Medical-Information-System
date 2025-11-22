import apiFetch from './api';

// Doctor signature and seal functions
export async function uploadDoctorSignatureSeal(formData) {
  // For FormData, we need to make a direct fetch call instead of using apiFetch
  const token = localStorage.getItem('jwtToken');
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  const response = await fetch(`${baseUrl}/doctor/upload-signature-seal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: Don't set Content-Type header for FormData - let browser set it with boundary
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getDoctorSignatureSeal() {
  return apiFetch('/doctor/signature-seal', 'GET', null, true);
}

// Patient functions for doctors
export async function fetchAllPatients() {
  return apiFetch('/doctor/patients', 'GET', null, true);
}

export async function fetchPatientPrescriptions(patientId) {
  return apiFetch(`/doctor/patients/${patientId}/prescriptions`, 'GET', null, true);
}

export async function fetchPatientMedicalRecord(patientId) {
  return apiFetch(`/doctor/patient/${patientId}/medical-record`, 'GET', null, true);
}