import apiFetch from './api';

export async function submitSupportRequest(message) {
  return apiFetch('/support/submit', 'POST', { message }, true);
}
