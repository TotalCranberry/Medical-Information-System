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
