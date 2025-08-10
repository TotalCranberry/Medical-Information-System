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