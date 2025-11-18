import apiFetch from './api';

export async function submitMedicalForm(formData) {
  return apiFetch('/patient/submit-medical-form', 'POST', formData);
}