import api from './api';

export const getInvoice = (prescriptionId) => {
    return api(`/invoices/by-prescription/${prescriptionId}`, 'GET', null, true);
};

export const generateInvoice = (prescriptionId) => {
    return api(`/invoices/generate/${prescriptionId}`, 'POST', null, true);
};

export const getStaffInvoices = () => {
    return api('/invoices/staff', 'GET', null, true);
};

export const getInvoiceById = (id) => {
    return api(`/invoices/${id}`, 'GET', null, true);
};