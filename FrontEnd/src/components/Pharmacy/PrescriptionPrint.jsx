import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// API Functions
import { completePrescription, getPrescriptionById } from '../../api/prescription';

// Assets
import UOPLogo from '../../assets/UOP_logo.jpeg';

// ---- Colors Configuration ----
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  light: "#F8F9FA",
};

// Empty object for default state (optimization)
const EMPTY_RX = Object.freeze({});

// --- Helpers ---

// Convert various truthy/falsy values to 1 or 0
const convertToBinary = (value) => {
  if (value === 1 || value === '1' || value === true) return 1;
  if (value === 0 || value === '0' || value === false) return 0;
  return null; // unknown
};

// Get symbol for status
const getStatusSymbol = (isOk) => {
  if (isOk) {
    return '✓';
  } else {
    return '✗';
  }
};

// Simple style object for dividing lines
const lineStyle = {
  borderTop: "2px solid " + colors.primary
};

// --- Data Normalization ---
// This function standardizes the prescription items into a clean format
const normalizeItems = (rx) => {
  // Handle different possible names for the items array
  let rawItems = [];
  if (rx && rx.items) {
    rawItems = rx.items;
  } else if (rx && rx.medications) {
    rawItems = rx.medications;
  }

  return rawItems.map((item, index) => {
    // Extract Item Details with fallbacks
    const medName = item.medicineName || (item.medicine && item.medicine.name) || item.medicine || '';
    const route = item.routeOfAdministration || item.route || '-';
    const duration = item.durationDays || item.days || item.duration || '';
    
    // Ensure timeOfDay is an array
    let timeArr = [];
    if (item.timeOfDay) timeArr = item.timeOfDay;
    else if (item.timesOfDay) timeArr = item.timesOfDay;
    else if (item.times) timeArr = item.times;

    const dosage = item.dosage || '';
    
    // Nested details
    const form = item.form || (item.medicineDetails && item.medicineDetails.form) || '';
    const strength = item.strength || (item.medicineDetails && item.medicineDetails.strength) || '';

    // Quantities
    let reqQty = item.requiredQuantity;
    if (reqQty == null) reqQty = item.quantity;
    if (reqQty == null) reqQty = item.units;
    if (reqQty == null) reqQty = item.requestedQty;

    let dispQty = item.dispensedQuantity;
    if (dispQty == null) dispQty = item.dispensedQty;

    // Status
    let statusRaw = item.dispensedStatus;
    if (statusRaw == null) statusRaw = item.dispensed_status;
    if (statusRaw == null) statusRaw = item.isDispensed;
    if (statusRaw == null) statusRaw = item.status;
    if (statusRaw == null) statusRaw = item.dispensed;

    const dispensedStatus = convertToBinary(statusRaw) || 0;

    // Return Clean Object
    return {
      id: item.id || item.itemId || ("idx_" + index),
      medicineName: medName,
      route: route,
      duration: duration,
      timeOfDay: Array.isArray(timeArr) ? timeArr : [],
      dosage: dosage,
      form: form,
      strength: strength,
      units: item.units || item.quantity || null,
      requiredQuantity: reqQty,
      dispensedQuantity: dispQty,
      dispensedStatus: dispensedStatus,
      instructions: item.instructions || '',
    };
  });
};

// Helper to map results by name or ID for quick lookup
const buildResultsMap = (dispenseResults) => {
  const map = new Map();
  
  if (Array.isArray(dispenseResults)) {
    dispenseResults.forEach(result => {
      // Try to find a key (Name or ID)
      let key = "";
      if (result.medicineName) {
        key = result.medicineName.toLowerCase().trim();
      } else if (result.itemId !== undefined) {
        key = String(result.itemId).toLowerCase().trim();
      }

      if (key) {
        map.set(key, {
          dispensedQty: result.dispensedQty || result.dispensedQuantity || 0,
          requestedQty: result.requestedQty || result.requiredQuantity || null,
          note: result.note || ''
        });
      }
    });
  }
  return map;
};

// Helper to find result for a specific item
const getResultForItem = (item, resultsMap) => {
  if (!resultsMap || resultsMap.size === 0) return null;
  
  // Try finding by Name
  const byName = resultsMap.get((item.medicineName || '').toLowerCase().trim());
  if (byName) return byName;
  
  // Try finding by ID
  const byId = resultsMap.get(String(item.id || '').toLowerCase().trim());
  if (byId) return byId;
  
  return null;
};

// --- Main Component ---
const PrescriptionPrint = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from previous page
  const stateData = location.state || {};
  const passedRx = stateData.prescription;
  const dispenseResults = stateData.dispenseResults;
  const fromCompletedTab = stateData.fromCompletedTab;

  // --- State ---
  const [notice, setNotice] = useState(null);
  const [rxFresh, setRxFresh] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 1. Fetch Fresh Data ---
  // We fetch the latest version of the prescription to ensure status is up to date
  useEffect(() => {
    let isMounted = true;

    const fetchFreshData = async () => {
      if (passedRx && passedRx.id) {
        try {
          setLoading(true);
          const freshData = await getPrescriptionById(passedRx.id);
          
          if (isMounted) {
            setRxFresh(freshData);
          }
        } catch (error) {
          console.error("Failed to fetch fresh prescription data");
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchFreshData();

    return () => { isMounted = false; };
  }, [passedRx]);

  // Use the fresh data if available, otherwise use passed data
  const rx = useMemo(() => {
    if (rxFresh) return rxFresh;
    if (passedRx) return passedRx;
    return EMPTY_RX;
  }, [rxFresh, passedRx]);

  // Normalize items for display
  const items = useMemo(() => normalizeItems(rx), [rx]);

  // Prepare results map
  const resultsMap = useMemo(() => buildResultsMap(dispenseResults), [dispenseResults]);

  // Basic Details
  const createdAt = rx.createdAt || rx.prescriptionDate || new Date().toISOString();
  const logoSrc = rx.clinicLogo || UOPLogo;

  // --- 2. Handlers ---

  const showNotice = (type, text) => {
    setNotice({ type: type, text: text });
    // Hide after 2.5 seconds
    setTimeout(() => setNotice(null), 2500);
  };

  const handleDownload = () => {
    window.print();
    showNotice('success', 'Prescription is ready in the print dialog.');
  };

  const handleComplete = async () => {
    try {
      await completePrescription(rx.id);
      showNotice("success", "Prescription marked as completed.");
      // Navigate back after short delay
      setTimeout(() => navigate("/pharmacist/view-prescriptions"), 900);
    } catch {
      showNotice("error", "Failed to complete prescription. Please try again.");
    }
  };

  const handleReturn = () => {
    let fromTab = "Pending";
    if (fromCompletedTab) {
      fromTab = "Completed";
    } else if (location.state && location.state.fromTab) {
      fromTab = location.state.fromTab;
    }
    
    navigate("/pharmacist/view-prescriptions", { state: { activeTab: fromTab } });
  };

  // Extract Patient & Doctor info safely
  const patient = rx.patient || {};
  const doctor = rx.doctor || {};
  
  const patientName = patient.name || rx.patientName || '-';
  
  let patientAge = rx.patientAge;
  if (patientAge == null) patientAge = patient.age;

  let patientGender = rx.patientGender;
  if (patientGender == null) patientGender = patient.gender;

  const doctorName = doctor.name || rx.doctorName || '-';
  
  const noData = !passedRx;

  // --- 3. Main Render ---
  return (
    <div style={{ padding: 24, background: colors.light }}>
      {/* CSS Styles */}
      <style>{`
        :root {
          --c-primary: ${colors.primary};
          --c-accent: ${colors.accent};
          --c-gray: ${colors.gray};
        }

        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container {
            position: absolute !important;
            left: 0; top: 0; width: 100%;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 24px !important;
            border-radius: 0 !important;
            border: none !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 18mm 15mm;
            margin: 0;
            background: white;
            page-break-after: always;
          }
          .table th {
            background: #f2f4f7 !important;
            -webkit-print-color-adjust: exact;
          }
          .zebra tbody tr:nth-child(even) td {
            background: #fafafa !important;
            -webkit-print-color-adjust: exact;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
        }
        @page { size: A4; margin: 12mm; }

        .print-container {
          max-width: 980px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 18px 40px rgba(12,60,60,0.12);
          border-radius: 16px;
          padding: 40px;
          border: 1px solid rgba(12,60,60,0.08);
        }

        /* Refactor Note: Removed gradient. Replaced with solid color. */
        .top-accent {
          height: 6px;
          width: 100%;
          border-radius: 8px 8px 0 0;
          background-color: var(--c-primary);
          margin-bottom: 16px;
        }

        .header-wrap { margin-bottom: 18px; }
        .section-gap { margin-top: 22px; }
        .section-gap-lg { margin-top: 32px; }

        /* Refactor Note: Removed gradient text. Replaced with solid color. */
        .header-title {
          color: var(--c-primary);
          letter-spacing: 0.3px;
          font-weight: 800;
        }
        
        .subtle { color: var(--c-gray); }
        .muted { color: #6b7280; font-size: 12px; }

        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          font-size: 12px;
          border-radius: 999px;
          color: var(--c-primary);
          background: rgba(12,60,60,0.06);
          border: 1px solid rgba(12,60,60,0.12);
          font-weight: 700;
        }

        .rx {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--c-primary);
          border: 2px solid var(--c-primary);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td {
          border: 1px solid #e5e7eb;
          padding: 12px 14px;
          vertical-align: top;
          font-size: 13.5px;
          line-height: 1.45;
        }
        .table th {
          font-weight: 700;
          background: #f2f4f7;
          text-align: left;
          color: var(--c-primary);
        }
        .zebra tbody tr:nth-child(even) td { background: rgba(12,60,60,0.02); }

        .sign-line {
          border-top: 1px solid var(--c-primary);
          height: 26px;
          margin-top: 36px;
        }

        .notice { margin-top: 18px; padding: 12px 14px; border-radius: 10px; font-size: 14px; }
        .notice.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .notice.error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .btn { padding: 12px 16px; border-radius: 12px; cursor: pointer; font-weight: 700; }
        .btn-outline {
          border: 1px solid var(--c-primary);
          background: white;
          color: var(--c-primary);
          transition: all .25s ease;
        }
        .btn-outline:hover {
          background: var(--c-primary);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(12,60,60,0.25);
        }
        .btn-solid {
          border: 1px solid var(--c-primary);
          background: var(--c-primary);
          color: white;
          transition: all .25s ease;
        }
        .btn-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(12,60,60,0.25);
          background: #0a2e2e;
        }
        .btn-row { display: flex; justify-content: flex-end; gap: 16px; flex-wrap: wrap; }
      `}</style>

      <div className="print-container page">
        <div className="top-accent" />

        {/* --- No Data View --- */}
        {noData ? (
          <div style={{ padding: 24 }}>
            <div className="header-title" style={{ fontSize: 20, marginBottom: 12 }}>
              No prescription data available
            </div>
            <p className="subtle" style={{ marginBottom: 16 }}>
              Please return to the prescriptions list and select a prescription to print.
            </p>
            <div className="btn-row no-print">
              <button onClick={() => navigate("/pharmacist/view-prescriptions", { state: { activeTab: "Pending" } })}
                      className="btn btn-solid">
                Go to Prescriptions
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* --- Header Section --- */}
            <div className="flex items-center gap-5 header-wrap" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              
              {/* Logo */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  border: '1px solid var(--c-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 8px 20px rgba(12,60,60,0.15)'
                }}
              >
                <img
                  src={logoSrc}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = UOPLogo; }}
                />
              </div>

              {/* Clinic Info */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="header-title" style={{ fontSize: 22 }}>
                  University of Peradeniya — Medical Center
                </div>
                <div className="subtle" style={{ fontSize: 13, marginTop: 4 }}>
                  Peradeniya, Sri Lanka • Tel: {rx.clinicPhone || '—'} • Email: {rx.clinicEmail || '—'}
                </div>
                <div className="muted" style={{ marginTop: 2 }}>
                  {rx.clinicAddress || '—'}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-right" style={{ minWidth: 190, textAlign: 'right' }}>
                <div className="badge">Prescription</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Date: <strong>{new Date(createdAt).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div style={{ margin: '14px 0 12px 0', ...lineStyle }} />

            {/* --- Patient & Doctor Info --- */}
            <div className="section-gap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div className="card" style={{ background: '#fcfffe' }}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: colors.primary }}>Patient Information</div>
                <div style={{ marginBottom: 4 }}><strong>Name:</strong> {patientName}</div>
                <div style={{ marginBottom: 4 }}><strong>Age:</strong> {patientAge || '-'}</div>
                <div><strong>Sex:</strong> {patientGender || '-'}</div>
                {patient.role && (
                  <div style={{ marginTop: 4 }}><strong>Role:</strong> {patient.role}</div>
                )}
              </div>
              <div className="card" style={{ background: '#fcfffe' }}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: colors.primary }}>Prescribed By</div>
                <div style={{ marginBottom: 4 }}><strong>Doctor:</strong> {doctorName}</div>
                {rx.department && (
                  <div><strong>Department:</strong> {rx.department}</div>
                )}
              </div>
            </div>

            {/* --- Rx Title --- */}
            <div className="section-gap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="rx">℞</div>
              <div className="subtle" style={{ fontSize: 16, fontWeight: 700, color: colors.primary }}>Medications</div>
            </div>

            {/* --- Medications Table --- */}
            <table className="table zebra section-gap">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Route</th>
                  <th>Instructions</th>
                  <th>Disp. Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: colors.gray }}>
                      No prescription items found
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => {
                    const overlay = getResultForItem(item, resultsMap);
                    let dispQty = 0;
                    if (item.dispensedQuantity != null) dispQty = item.dispensedQuantity;
                    else if (overlay && overlay.dispensedQty != null) dispQty = overlay.dispensedQty;

                    const isDispensed = item.dispensedStatus === 1;

                    return (
                      <tr key={item.id || index}>
                        <td>
                          <div style={{ fontWeight: 700, color: colors.primary }}>{item.medicineName || "-"}</div>
                          <div style={{ fontSize: 12, color: colors.gray }}>
                            {item.form || '-'} {item.strength ? ("• " + item.strength) : ''}
                          </div>
                        </td>
                        <td>{item.dosage || "-"}</td>
                        <td>
                          {(Array.isArray(item.timeOfDay) && item.timeOfDay.length) ? item.timeOfDay.join(", ") : "-"}
                        </td>
                        <td>{item.duration ? (item.duration + " days") : "-"}</td>
                        <td>{item.route || "-"}</td>
                        <td>{item.instructions || "-"}</td>
                        <td>{dispQty || "-"}</td>
                        <td style={{ textAlign: "center", fontWeight: 800, color: isDispensed ? '#047857' : '#b91c1c' }}>
                          {getStatusSymbol(isDispensed)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* --- General Notes --- */}
            {rx.generalNotes && rx.generalNotes.trim() && rx.generalNotes !== "#" && (
              <div className="section-gap">
                <div style={{ fontWeight: 800, marginBottom: 6, color: colors.primary }}>General Notes</div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{rx.generalNotes}</div>
              </div>
            )}

            {/* --- Doctor's Signature and Seal --- */}
            <div className="section-gap-lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div className="muted" style={{ marginBottom: 8 }}>Doctor's Signature</div>
                {rx.doctorSignature ? (
                  <img
                    src={rx.doctorSignature}
                    alt="Doctor's Signature"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '60px',
                      objectFit: 'contain',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '4px',
                      background: 'white'
                    }}
                  />
                ) : (
                  <div className="sign-line" />
                )}
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div className="muted" style={{ marginBottom: 8 }}>Doctor's Seal</div>
                {rx.doctorSeal ? (
                  <img
                    src={rx.doctorSeal}
                    alt="Doctor's Seal"
                    style={{
                      maxWidth: '120px',
                      maxHeight: '120px',
                      objectFit: 'contain',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '4px',
                      background: 'white'
                    }}
                  />
                ) : (
                  <div style={{ width: '120px', height: '60px', border: '1px dashed #e5e7eb', borderRadius: '4px', display: 'inline-block' }} />
                )}
              </div>
            </div>

            {/* --- Notice Message --- */}
            {notice && (
              <div className={"notice " + notice.type}>{notice.text}</div>
            )}

            {/* --- Action Buttons (Hidden when printing) --- */}
            <div className="no-print section-gap-lg btn-row">
              {/* Logic for different user roles */}
              {user && user.role === 'Pharmacist' ? (
                <>
                  <button onClick={handleDownload} className="btn btn-outline" disabled={loading} aria-label="Print prescription">
                    {loading ? 'Loading…' : 'Download / Print'}
                  </button>

                  {fromCompletedTab ? (
                    <button onClick={handleReturn} className="btn btn-solid" disabled={loading} aria-label="Return to prescriptions">
                      Return to View Prescription
                    </button>
                  ) : (
                    <>
                      {rx.isActive ? (
                        <button onClick={handleComplete} className="btn btn-solid" disabled={loading} aria-label="Complete prescription">
                          Complete Prescription
                        </button>
                      ) : (
                        <button onClick={handleReturn} className="btn btn-solid" disabled={loading} aria-label="Return to prescriptions">
                          Return to View Prescription
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (user && (user.role === 'Student' || user.role === 'Staff')) ? (
                <>
                  <button
                    onClick={() => navigate("/" + user.role.toLowerCase() + "/dashboard")}
                    className="btn btn-outline"
                    aria-label="Return to dashboard"
                  >
                    Return to Dashboard
                  </button>

                  <button onClick={handleDownload} className="btn btn-outline" disabled={loading} aria-label="Print prescription">
                    {loading ? 'Loading…' : 'Download / Print'}
                  </button>
                </>
              ) : (
                // Fallback for other roles
                <button onClick={handleDownload} className="btn btn-outline" disabled={loading} aria-label="Print prescription">
                  {loading ? 'Loading…' : 'Download / Print'}
                </button>
              )}
            </div>

            {/* --- Footer --- */}
            <div className="section-gap" style={{ ...lineStyle }} />
            <div className="muted" style={{ marginTop: 8 }}>
              This prescription is generated by the University of Peradeniya Medical Center system.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrescriptionPrint;