import apiFetch from './api';

export async function submitMedicalForm(formData) {
  return apiFetch('/patient/submit-medical-form', 'POST', formData);
}

export const getMedicalRecord = (patientId) => {
  return apiFetch(`/api/doctor/patient/${patientId}/medical-record`);
};