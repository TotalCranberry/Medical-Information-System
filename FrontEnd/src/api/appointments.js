import apiFetch from './api';

export async function fetchAppointments() {
  return apiFetch('/patient/appointments', 'GET', null, true);
}

export async function createAppointment(data) {
  return apiFetch('/patient/appointments', 'POST', data, true);
}
