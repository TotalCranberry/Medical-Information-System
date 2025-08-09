import apiFetch from './api';

export async function fetchAppointments() {
  // FIX: Path now includes role prefix
  return apiFetch('/patient/appointments', 'GET', null, true);
}

export async function createAppointment(data) {
  // FIX: Path now includes role prefix
  return apiFetch('/patient/appointments', 'POST', data, true);
}
