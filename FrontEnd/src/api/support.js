import apiFetch from './api';

export async function submitSupportRequest(message) {
  return apiFetch('/support/submit', 'POST', { message }, true);
}

export async function getMyTickets() {
  return apiFetch('/support/my-tickets', 'GET', null, true);
}
