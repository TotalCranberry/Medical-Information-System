import apiFetch from './api';

export async function getUnreadNotifications() {
  return apiFetch('/notifications', 'GET', null, true);
}

export async function markAsRead(id) {
  return apiFetch(`/notifications/${id}/read`, 'PUT', null, true);
}