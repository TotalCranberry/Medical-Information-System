import apiFetch from './api';

// Patient appointment functions
export async function fetchAppointments() {
  return apiFetch('/patient/appointments', 'GET', null, true);
}

export async function createAppointment(data) {
  return apiFetch('/patient/appointments', 'POST', data, true);
}

export async function cancelAppointment(appointmentId) {
  return apiFetch(`/patient/appointments/${appointmentId}`, 'DELETE', null, true);
}

// Doctor appointment functions
export async function fetchTodaysAppointments() {
  return apiFetch('/doctor/appointments/today', 'GET', null, true);
}

export async function fetchAppointmentQueue() {
  return apiFetch('/doctor/appointments/queue', 'GET', null, true);
}

export async function fetchAllAppointments() {
  return apiFetch('/doctor/appointments/all', 'GET', null, true);
}

export async function completeAppointment(appointmentId) {
  return apiFetch(`/doctor/appointments/${appointmentId}/complete`, 'PUT', null, true);
}

export async function fetchDashboardStats() {
  return apiFetch('/doctor/dashboard/stats', 'GET', null, true);
}

// Patient profile functions for doctors
export async function fetchPatientProfile(patientId) {
  return apiFetch(`/doctor/patients/${patientId}`, 'GET', null, true);
}

export async function fetchPatientVitals(patientId) {
  return apiFetch(`/doctor/patients/${patientId}/vitals`, 'GET', null, true);
}

export async function savePatientVitals(patientId, vitalsData) {
  return apiFetch(`/doctor/patients/${patientId}/vitals`, 'POST', vitalsData, true);
}

export async function saveDiagnosis(patientId, diagnosisData) {
  return apiFetch(`/doctor/patients/${patientId}/diagnosis`, 'POST', diagnosisData, true);
}

// Medical functions for doctors
export async function issueMedical(patientId, formData) {
  // For FormData, we need to make a direct fetch call instead of using apiFetch
  const token = localStorage.getItem('jwtToken');
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  const response = await fetch(`${baseUrl}/doctor/patients/${patientId}/medical`, {
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

export async function fetchPatientMedicals(patientId) {
  return apiFetch(`/doctor/patients/${patientId}/medicals`, 'GET', null, true);
}

export async function fetchMedical(medicalId) {
  return apiFetch(`/doctor/medicals/${medicalId}`, 'GET', null, true);
}

export async function sendMedicalToCourseUnit(medicalId, courseUnitEmail) {
  return apiFetch(`/doctor/medicals/${medicalId}/send-to-course-unit?courseUnitEmail=${encodeURIComponent(courseUnitEmail)}`, 'PUT', null, true);
}

export async function previewMedicalPdf(medicalId) {
  const token = localStorage.getItem('jwtToken');
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  const response = await fetch(`${baseUrl}/doctor/medicals/${medicalId}/preview-pdf`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.blob();
}

export async function getDoctorSignatureAndSeal() {
  return apiFetch('/doctor/signature-seal', 'GET', null, true);
}