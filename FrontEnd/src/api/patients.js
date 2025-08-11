import apiFetch from './api';

// Fetch all patients (students and staff) for doctors
export async function fetchAllPatients() {
  return apiFetch('/doctor/patients', 'GET', null, true);
}