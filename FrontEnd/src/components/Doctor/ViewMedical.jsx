import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchMedical as fetchDoctorMedical, sendMedicalToCourseUnit } from "../../api/appointments";
import { fetchPatientMedical } from "../../api/reports";

const ViewMedical = () => {
  const { medicalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [medical, setMedical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const role = localStorage.getItem("userRole");

  useEffect(() => {
    loadMedical();
  }, [medicalId]);

  const loadMedical = async () => {
    try {
      setLoading(true);

      let medicalData;
      if (role === "Student" || role === "Staff") {
        medicalData = await fetchPatientMedical(medicalId);
      } else {
        medicalData = await fetchDoctorMedical(medicalId);
      }

      setMedical(medicalData);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load medical certificate");
      console.error("Error loading medical:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToCourseUnit = async () => {
    try {
      setSending(true);
      await sendMedicalToCourseUnit(medicalId);
      setSuccess("Medical certificate sent to course unit successfully!");
      await loadMedical();
    } catch (err) {
      setError(err.message || "Failed to send medical to course unit");
      console.error("Error sending medical:", err);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (role === "Student" || role === "Staff") {
      navigate("/patient/reports");
    } else if (medical?.patient?.id) {
      navigate(`/doctor/patients/${medical.patient.id}`, { state: { patient: medical.patient } });
    } else {
      navigate("/doctor/dashboard");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!medical) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Medical certificate not found. Please go back and try again.
        </div>
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="flex items-center mb-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-4"
        >
          ← Back
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Medical Certificate</h1>

      {/* Error & Success */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right text-red-500">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right text-green-500">×</button>
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Certificate Details */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">UNIVERSITY OF PERADENIYA</h2>
              <h3 className="text-xl font-semibold text-green-500 mb-2">MEDICAL CERTIFICATE</h3>
              <p className="text-gray-600">Medical Information System</p>
            </div>

            <hr className="mb-6" />

            {/* Patient Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Name:</strong> {medical.patientName}</div>
                <div><strong>Role:</strong> {medical.patientRole}</div>
                <div><strong>Age:</strong> {medical.patientAge ? `${medical.patientAge} years` : "N/A"}</div>
                <div><strong>Faculty:</strong> {medical.patientFaculty || "N/A"}</div>
                <div className="md:col-span-2"><strong>Email:</strong> {medical.patientEmail}</div>
              </div>
            </div>

            <hr className="mb-6" />

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Medical Recommendations</h4>
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="whitespace-pre-wrap leading-relaxed">{medical.recommendations}</p>
              </div>
            </div>

            {/* Additional Notes */}
            {medical.additionalNotes && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h4>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{medical.additionalNotes}</p>
                </div>
              </div>
            )}

            <hr className="mb-6" />

            {/* Dates */}
            <div>
              <p className="mb-2"><strong>Date of Issue:</strong> {formatDate(medical.medicalDate)}</p>
              <p className="mb-2"><strong>Certificate ID:</strong> {medical.id}</p>
              {medical.appointment && (
                <p className="mb-2"><strong>Appointment Date:</strong> {formatDate(medical.appointment.appointmentDateTime)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Actions */}
        {role !== "Student" && role !== "Staff" && (
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🏥</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Certificate Actions</h4>
              </div>
              <hr className="mb-6" />

              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">Status:</p>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    medical.isSentToCourseUnit
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  {medical.isSentToCourseUnit && <span className="mr-1">✓</span>}
                  {medical.isSentToCourseUnit ? "Sent to Course Unit" : "Not Sent"}
                </div>
                {medical.isSentToCourseUnit && medical.sentToCourseUnitAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Sent on: {formatDate(medical.sentToCourseUnitAt)}
                  </p>
                )}
              </div>

              {!medical.isSentToCourseUnit && (
                <button
                  onClick={handleSendToCourseUnit}
                  disabled={sending}
                  className={`w-full px-4 py-2 rounded text-white font-medium ${
                    sending ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {sending ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    "📤 Send to Course Unit"
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMedical;
