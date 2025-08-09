import apiFetch from './api';

export async function fetchReports() {
  return apiFetch('/patient/reports', 'GET', null, true);
}

export async function fetchPrescriptions() {
  return apiFetch('/patient/prescriptions', 'GET', null, true);
}
