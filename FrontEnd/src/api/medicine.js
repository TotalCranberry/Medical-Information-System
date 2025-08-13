import apiFetch from "./api";


export const getAllMedicines = () =>
    apiFetch("/medicines/all", "GET", null, true);


export const saveMedicine = (data) =>
    apiFetch("/medicines/save", "POST", data, true);


export const searchMedicines = (searchTerm, field = "name") =>
    apiFetch(`/medicines/search?name=${searchTerm}&field=${field}`, "GET", null, true);



export const deleteMedicine = (id) => {
    return apiFetch(`/medicines/delete/${id}`, "DELETE", null, true);
};

