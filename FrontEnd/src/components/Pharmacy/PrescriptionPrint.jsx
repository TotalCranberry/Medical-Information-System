import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completePrescription, getPrescriptionById } from '../../api/prescription';
import UOPLogo from '../../assets/UOP_logo.jpeg';

// ---------- THEME ----------
const THEME = {
  primary: "#0C3C3C",
  accent:  "#45D27A",
  gray:    "#6C6B6B",
  white:   "#ffffff",
  light:   "#F8F9FA",
};

// Stable empty object to avoid new refs in deps
const EMPTY_RX = Object.freeze({});

// ---------- Coercion helpers ----------
const to01 = (v) => {
  if (v === 1 || v === '1' || v === true) return 1;
  if (v === 0 || v === '0' || v === false) return 0;
  return null; // unknown
};
const markSymbol = (ok) => (ok ? '✓' : '✗');
const line = { borderTop: '2px solid #0C3C3C' };

// ---------- Normalizers ----------
const normalizeItems = (rx) => {
  const raw = (rx?.items || rx?.medications || []);
  return (raw || []).map((it, i) => {
    const medName   = it.medicineName || it.medicine?.name || it.medicine || '';
    const route     = it.routeOfAdministration || it.route || '-';
    const duration  = it.durationDays || it.days || it.duration || '';
    const timeArr   = it.timeOfDay || it.timesOfDay || it.times || [];
    const dosage    = it.dosage ?? '';
    const form      = it.form ?? it.medicineDetails?.form ?? '';
    const strength  = it.strength ?? it.medicineDetails?.strength ?? '';

    const requiredQuantity  = it.requiredQuantity ?? it.quantity ?? it.units ?? it.requestedQty ?? null;
    const dispensedQuantity = it.dispensedQuantity ?? it.dispensedQty ?? null;

    const statusRaw =
      it.dispensedStatus ??
      it.dispensed_status ??
      it.isDispensed ??
      it.status ??
      it.dispensed ??
      null;

    const dispensedStatus = to01(statusRaw) ?? 0;

    return {
      id: it.id ?? it.itemId ?? `idx_${i}`,
      medicineName: medName,
      route,
      duration,
      timeOfDay: Array.isArray(timeArr) ? timeArr : [],
      dosage,
      form,
      strength,
      units: it.units ?? it.quantity ?? null,

      requiredQuantity,
      dispensedQuantity,
      dispensedStatus,
      instructions: it.instructions ?? '',
    };
  });
};

const buildResultsMap = (dispenseResults) => {
  const map = new Map();
  if (Array.isArray(dispenseResults)) {
    dispenseResults.forEach(r => {
      const key =
        (r.medicineName && r.medicineName.toLowerCase().trim()) ||
        (r.itemId !== undefined && String(r.itemId).toLowerCase().trim()) ||
        '';
      if (!key) return;
      map.set(key, {
        dispensedQty:  r.dispensedQty ?? r.dispensedQuantity ?? 0,
        requestedQty:  r.requestedQty ?? r.requiredQuantity ?? null,
        note:          r.note || ''
      });
    });
  }
  return map;
};

const getResultForItem = (item, resultsMap) => {
  if (!resultsMap || resultsMap.size === 0) return null;
  const byName = resultsMap.get((item.medicineName || '').toLowerCase().trim());
  if (byName) return byName;
  const byId = resultsMap.get(String(item.id || '').toLowerCase().trim());
  if (byId) return byId;
  return null;
};

// ---------- Component ----------
const PrescriptionPrint = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prescription: passedRx, dispenseResults, fromCompletedTab } = location.state || {};

  const [notice, setNotice] = useState(null);
  const [rxFresh, setRxFresh] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch latest copy for accurate dispensedStatus (hook runs unconditionally)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!passedRx?.id) return; // guard, but still call the hook
      try {
        setLoading(true);
        const fresh = await getPrescriptionById(passedRx.id);
        if (alive) setRxFresh(fresh);
      } catch {
        /* keep using passedRx */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [passedRx?.id]);

  // Memoize rx to keep stable reference across renders
  const rx = useMemo(() => (rxFresh ?? passedRx ?? EMPTY_RX), [rxFresh, passedRx]);
  const items = useMemo(() => normalizeItems(rx), [rx]);
  const resultsMap = useMemo(() => buildResultsMap(dispenseResults), [dispenseResults]);

  const createdAt = rx.createdAt || rx.prescriptionDate || new Date().toISOString();
  const logoSrc = rx.clinicLogo || UOPLogo;

  const showNotice = (type, text, ms = 2500) => {
    setNotice({ type, text });
    if (ms) setTimeout(() => setNotice(null), ms);
  };

  const onDownload = () => {
    window.print();
    showNotice('success', 'Prescription is ready in the print dialog.');
  };

  const onComplete = async () => {
    try {
      await completePrescription(rx.id);
      showNotice("success", "Prescription marked as completed.");
      setTimeout(() => navigate("/pharmacist/view-prescriptions"), 900);
    } catch {
      showNotice("error", "Failed to complete prescription. Please try again.");
    }
  };

  const onReturn = () => {
    const fromTab = location.state?.fromTab || (fromCompletedTab ? "Completed" : "Pending");
    navigate("/pharmacist/view-prescriptions", { state: { activeTab: fromTab } });
  };

  // Patient & doctor fields (safe fallbacks)
  const patient = rx.patient || {};
  const doctor = rx.doctor || {};
  const patientName = patient.name || rx.patientName || '-';
  const patientAge = patient.age ?? rx.patientAge;
  const patientGender = patient.gender || rx.patientGender;
  const doctorName = doctor.name || rx.doctorName || '-';
  const doctorRegNo = doctor.regNo || doctor.registrationNumber || rx.doctorRegNo || '';

  const noData = !passedRx; // used in render AFTER hooks

  return (
    <div style={{ padding: 24, background: THEME.light }}>
      {/* Styles */}
      <style>{`
        :root {
          --c-primary: ${THEME.primary};
          --c-accent: ${THEME.accent};
          --c-gray: ${THEME.gray};
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

        .top-accent {
          height: 6px;
          width: 100%;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(90deg, var(--c-primary) 0%, var(--c-accent) 100%);
          margin-bottom: 16px;
        }

        .header-wrap { margin-bottom: 18px; }
        .section-gap { margin-top: 22px; }
        .section-gap-lg { margin-top: 32px; }

        .header-title {
          color: var(--c-primary);
          letter-spacing: 0.3px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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

        {/* If no incoming prescription, show a friendly message (AFTER hooks) */}
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
            {/* Header */}
            <div className="flex items-center gap-5 header-wrap" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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
                  alt="University of Peradeniya logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = UOPLogo; }}
                />
              </div>

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

              <div className="text-right" style={{ minWidth: 190, textAlign: 'right' }}>
                <div className="badge">Prescription</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Date: <strong>{new Date(createdAt).toLocaleString()}</strong>
                </div>
                {/* {rx.id && (
                  <div className="muted">
                    Rx ID: <strong>{rx.id}</strong>
                  </div>
                )} */}
              </div>
            </div>

            <div style={{ margin: '14px 0 12px 0', ...line }} />

            {/* Patient & Doctor Info */}
            <div className="section-gap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div className="card" style={{ background: '#fcfffe' }}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: THEME.primary }}>Patient Information</div>
                <div style={{ marginBottom: 4 }}><strong>Name:</strong> {patientName}</div>
                <div><strong>Age / Sex:</strong> {(patientAge ?? '-')}{(patientGender ? ` / ${patientGender}` : '')}</div>
                {patient.role && (
                  <div style={{ marginTop: 4 }}><strong>Role:</strong> {patient.role}</div>
                )}
              </div>
              <div className="card" style={{ background: '#fcfffe' }}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: THEME.primary }}>Prescribed By</div>
                <div style={{ marginBottom: 4 }}><strong>Doctor:</strong> {doctorName}</div>
                <div style={{ marginBottom: 4 }}><strong>Reg. No:</strong> {doctorRegNo || '-'}</div>
                {rx.department && (
                  <div><strong>Department:</strong> {rx.department}</div>
                )}
              </div>
            </div>

            {/* Rx Title */}
            <div className="section-gap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="rx">℞</div>
              <div className="subtle" style={{ fontSize: 16, fontWeight: 700, color: THEME.primary }}>Medications</div>
            </div>

            {/* Medications Table */}
            <table className="table zebra section-gap">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Route</th>
                  <th>Instructions</th>
                  {/* <th>Req. Qty</th> */}
                  <th>Disp. Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const overlay = getResultForItem(item, resultsMap);
                  // const requestedQty = (item.requiredQuantity ?? item.units ?? overlay?.requestedQty ?? null);
                  const dispensedQty  = (item.dispensedQuantity ?? overlay?.dispensedQty ?? 0);
                  const dispensed = item.dispensedStatus === 1;

                  return (
                    <tr key={item.id || index}>
                      <td>
                        <div style={{ fontWeight: 700, color: THEME.primary }}>{item.medicineName || "-"}</div>
                        <div style={{ fontSize: 12, color: THEME.gray }}>
                          {item.form || '-'} {item.strength ? `• ${item.strength}` : ''}
                        </div>
                      </td>
                      <td>{item.dosage || "-"}</td>
                      <td>{Array.isArray(item.timeOfDay) && item.timeOfDay.length ? item.timeOfDay.join(", ") : "-"}</td>
                      <td>{item.duration ? `${item.duration} days` : "-"}</td>
                      <td>{item.route || "-"}</td>
                      <td>{item.instructions || "-"}</td>
                      {/* <td>{requestedQty ?? "-"}</td> */}
                      <td>{dispensedQty ?? "-"}</td>
                      <td style={{ textAlign: "center", fontWeight: 800, color: dispensed ? '#047857' : '#b91c1c' }}>
                        {markSymbol(dispensed)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* General Notes */}
            {rx.generalNotes && rx.generalNotes.trim() && rx.generalNotes !== "#" && (
              <div className="section-gap">
                <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.primary }}>General Notes</div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{rx.generalNotes}</div>
              </div>
            )}

            {/* Signatures */}
            <div className="section-gap-lg" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              <div>
                <div className="sign-line" />
                <div className="muted" style={{ marginTop: 6 }}>Doctor's Signature</div>
              </div>
              <div>
                <div className="sign-line" />
                <div className="muted" style={{ marginTop: 6 }}>Pharmacist's Signature</div>
              </div>
            </div>

            {/* Notice */}
            {notice && (
              <div className={`notice ${notice.type}`}>{notice.text}</div>
            )}

            {/* Bottom buttons */}
            <div className="no-print section-gap-lg btn-row">
              <button onClick={onDownload} className="btn btn-outline" disabled={loading} aria-label="Print prescription">
                {loading ? 'Loading…' : 'Download / Print'}
              </button>

              {fromCompletedTab ? (
                <button onClick={onReturn} className="btn btn-solid" disabled={loading} aria-label="Return to prescriptions">
                  Return to View Prescription
                </button>
              ) : (
                <>
                  {rx.isActive ? (
                    <button onClick={onComplete} className="btn btn-solid" disabled={loading} aria-label="Complete prescription">
                      Complete Prescription
                    </button>
                  ) : (
                    <button onClick={onReturn} className="btn btn-solid" disabled={loading} aria-label="Return to prescriptions">
                      Return to View Prescription
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="section-gap" style={{ ...line }} />
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
