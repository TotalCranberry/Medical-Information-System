import apiFetch from "./api";

// Get all lab requests, optionally by status
export const getLabRequests = async (status) => {
  try {
    const url = status ? `/lab/requests/status/${status}` : "/lab/requests";
    console.log("Fetching LabRequests from:", url); // Debug
    const data = await apiFetch(url, "GET", null, true); // ✅ addAuth = true
    console.log("Fetched LabRequests:", data); // Debug
    return data;
  } catch (error) {
    console.error("Error fetching lab requests:", error);
    throw error;
  }
};

// Update the status of a lab request
export const updateLabRequestStatus = async (id, status) => {
  try {
    console.log("Updating LabRequest:", { id, status }); // Debug
    if (!id) throw new Error("LabRequest ID is missing");
    if (!status) throw new Error("Status is missing");

    const url = `/lab/requests/${id}/status?status=${status}`;
    const data = await apiFetch(url, "PUT", null, true); // ✅ addAuth = true
    console.log("Updated LabRequest:", data); // Debug
    return data;
  } catch (error) {
    console.error("Error updating lab request status:", error);
    throw error;
  }
};

// Create a new lab request
export const createLabRequest = async (patientId, testType) => {
  try {
    if (!patientId) throw new Error("Patient ID is missing");
    if (!testType) throw new Error("Test type is missing");

    console.log("Creating lab request for patient:", patientId, "test type:", testType); // Debug

    const requestData = {
      patientId: patientId,
      testType: testType
    };

    const data = await apiFetch("/lab/requests", "POST", requestData, true); // ✅ addAuth = true
    console.log("Created lab request:", data); // Debug
    return data;
  } catch (error) {
    console.error("Error creating lab request:", error);
    throw error;
  }
};

// Get lab requests for a specific patient
export const getLabRequestsForPatient = async (patientId) => {
  try {
    if (!patientId) throw new Error("Patient ID is missing");

    console.log("Fetching lab requests for patient:", patientId); // Debug
    const data = await apiFetch(`/lab/requests/patient/${patientId}`, "GET", null, true); // ✅ addAuth = true
    console.log("Fetched lab requests for patient:", data); // Debug
    return data;
  } catch (error) {
    console.error("Error fetching lab requests for patient:", error);
    throw error;
  }
};

// Get a single lab request by ID
export const getLabRequestById = async (requestId) => {
  try {
    if (!requestId) throw new Error("Lab request ID is missing");

    console.log("Fetching lab request:", requestId); // Debug
    const data = await apiFetch(`/lab/requests/${requestId}`, "GET", null, true); // ✅ addAuth = true
    console.log("Fetched lab request:", data); // Debug
    return data;
  } catch (error) {
    console.error("Error fetching lab request:", error);
    throw error;
  }
};

// Upload lab result file
export const uploadLabResult = async (id, file) => {
  try {
    if (!id) throw new Error("LabRequest ID is missing");
    if (!file) throw new Error("File is missing");

    console.log("Uploading file for LabRequest:", id, file.name); // Debug

    const formData = new FormData();
    formData.append("file", file);

    const url = `/lab/requests/${id}/upload`;

    // ✅ Add JWT token for authorization
    const data = await apiFetch(url, "POST", formData, true);
    console.log("Uploaded file result:", data); // Debug
    return data;
  } catch (error) {
    console.error("Error uploading lab result:", error);
    throw error;
  }
};
