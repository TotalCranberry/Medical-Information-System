import apiFetch from './api';

export async function fetchReports() {
  // FIX: Path now includes role prefix
  return apiFetch('/patient/reports', 'GET', null, true);
}

export async function fetchPrescriptions() {
  // FIX: Path now includes role prefix
  return apiFetch('/patient/prescriptions', 'GET', null, true);
}
