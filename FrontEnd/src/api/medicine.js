import apiFetch from "./api"; // or "../api" if your path differs

// ✅ Get all medicines
export const getAllMedicines = () =>
    apiFetch("/medicines/all", "GET", null, true);

// ✅ Add or update medicine
export const saveMedicine = (data) =>
    apiFetch("/medicines/save", "POST", data, true);

// ✅ Search medicines by field (name, generic, manufacturer, batch, category)
export const searchMedicines = (searchTerm, field = "name") =>
    apiFetch(`/medicines/search?name=${searchTerm}&field=${field}`, "GET", null, true);



// delete medicine
export const deleteMedicine = (id) => {
    return apiFetch(`/medicines/delete/${id}`, "DELETE", null, true);
};

