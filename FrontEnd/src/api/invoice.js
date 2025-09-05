import api from './api';

export const getInvoice = (prescriptionId) => {
    return api(`/invoices/by-prescription/${prescriptionId}`, 'GET', null, true);
};

export const generateInvoice = (prescriptionId) => {
    return api(`/invoices/generate/${prescriptionId}`, 'POST', null, true);
};