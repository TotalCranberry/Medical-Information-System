import apiFetch from './api';

export async function uploadMedicalForm(formData) {
  return apiFetch('/patient/upload-medical-form', 'POST', formData, true);
}