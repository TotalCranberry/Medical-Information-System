import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// API Functions
import { getInvoice, getInvoiceById } from "../../api/invoice";

// Assets
import UOPLogo from "../../assets/UOP_logo.jpeg";

// ---- Colors Configuration ----
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  light: "#F8F9FA",
};

// Simple style object for dividing lines
const lineStyle = {
  borderTop: "2px solid " + colors.primary
};

// --- Helper: Format Money ---
const formatMoney = (value) => {
  // Convert to number, defaulting to 0 if null/undefined
  let num = Number(value);
  if (isNaN(num)) {
    num = 0;
  }

  try {
    // Attempt to use the browser's built-in currency formatter
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(num);
  } catch (error) {
    // Fallback if Internationalization fails
    return "Rs. " + num.toFixed(2);
  }
};

// --- Helper: Normalize Data ---
// This function takes raw data from the API (which might vary)
// and converts it into a consistent structure for our component.
const normalizeInvoice = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const patient = raw.patient || {};
  
  // Extract patient details with fallbacks
  let patientName = "-";
  if (raw.patientName) patientName = raw.patientName;
  else if (patient.name) patientName = patient.name;
  else if (patient.fullName) patientName = patient.fullName;

  const patientAge = raw.patientAge || patient.age || null;
  const patientGender = raw.patientGender || patient.gender || null;

  const createdAt = raw.createdAt || raw.date || raw.issuedAt || new Date().toISOString();
  const id = raw.id || raw.invoiceId || raw.number || "-";

  // Extract items list
  let rawItems = [];
  if (Array.isArray(raw.invoiceItems)) {
    rawItems = raw.invoiceItems;
  } else if (Array.isArray(raw.items)) {
    rawItems = raw.items;
  }

  // Standardize each item
  const normalizedItems = rawItems.map((item, index) => {
    // Quantity Logic
    let qty = 0;
    if (item.dispenseQuantity != null) qty = item.dispenseQuantity;
    else if (item.quantity != null) qty = item.quantity;
    else if (item.qty != null) qty = item.qty;

    // Price Logic
    let unitPrice = 0;
    if (item.unitPrice != null) unitPrice = item.unitPrice;
    else if (item.price != null) unitPrice = item.price;

    // Total Logic
    let totalPrice = 0;
    if (item.totalPrice != null) totalPrice = item.totalPrice;
    else if (item.total != null) totalPrice = item.total;
    else totalPrice = qty * unitPrice;

    return {
      id: item.id || ("row_" + index),
      medicineName: item.medicineName || item.name || item.title || "",
      dosage: item.dosage || item.strength || "-",
      dispenseQuantity: qty,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
    };
  });

  // Calculate totals if missing
  let subTotal = raw.subTotal || raw.subtotal;
  if (subTotal == null) {
    // Sum up all item totals
    subTotal = normalizedItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  }

  const serviceCharge = raw.serviceCharge || raw.serviceFee || 0;
  
  let totalAmount = raw.totalAmount || raw.total;
  if (totalAmount == null) {
    totalAmount = subTotal + Number(serviceCharge);
  }

  // Return clean object
  return {
    id: id,
    createdAt: createdAt,
    patientName: patientName,
    patientAge: patientAge,
    patientGender: patientGender,
    items: normalizedItems,
    subTotal: subTotal,
    service: serviceCharge,
    totalAmount: totalAmount,
    clinic: {
      name: raw.clinicName || "University of Peradeniya — Medical Center" + " invooice",
      phone: raw.clinicPhone || "—",
      email: raw.clinicEmail || "—",
      address: raw.clinicAddress || "—",
      logo: raw.clinicLogo || UOPLogo,
    },
    cashier: raw.cashier || raw.issuedBy || null,
  };
};

const InvoicePrint = () => {
  // Get ID from URL
  const params = useParams();
  const invoiceId = params.id;
  
  const navigate = useNavigate();
  const location = useLocation();

  // --- State Variables ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  
  // Notification state
  const [notice, setNotice] = useState(null);

  // --- 1. Fetch Data ---
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let rawData;
        
        // Try fetching by Invoice ID first (Staff Invoice)
        try {
          rawData = await getInvoiceById(invoiceId);
        } catch (err) {
          // If that fails, try fetching by Prescription ID
          rawData = await getInvoice(invoiceId);
        }

        const cleanData = normalizeInvoice(rawData);
        
        if (isMounted) {
          setInvoiceData(cleanData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load invoice");
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => { isMounted = false; };
  }, [invoiceId]);

  // --- 2. Handlers ---

  const showNotice = (type, text) => {
    setNotice({ type: type, text: text });
    // Hide after 2.5 seconds
    setTimeout(() => setNotice(null), 2500);
  };

  const handlePrint = () => {
    window.print();
    showNotice("success", "Invoice is ready in the print dialog.");
  };

  const handleBack = () => {
    // Return to the previous tab (default to Completed if not specified)
    const fromTab = location.state?.fromTab || "Completed";
    navigate("/pharmacist/view-prescriptions", { 
      state: { activeTab: fromTab } 
    });
  };

  // --- 3. Render Loading/Error ---

  if (isLoading) {
    return (
      <div className="p-6" style={{ color: colors.primary, padding: "24px" }}>
        {/* Refactor Note: Replaced gradient animation with solid color animation */}
        <style>{`
          .bar {
            height: 6px; width: 100%;
            background-color: ${colors.primary};
            border-radius: 4px; margin-bottom: 12px;
            animation: pulse 1.2s ease-in-out infinite;
          }
          @keyframes pulse {
            0% { opacity: .4; }
            50% { opacity: 1; }
            100% { opacity: .4; }
          }
        `}</style>
        <div className="bar" />
        Loading invoice…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ background: "#ffefef", border: "1px solid #ffcccc", borderRadius: 12, padding: 16, color: "#8a1c1c" }}>
          {error}
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleBack}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "8px",
              border: "1px solid " + colors.primary, 
              color: colors.primary, 
              background: "#fff",
              cursor: "pointer"
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!invoiceData) return <div style={{ padding: "24px" }}>No invoice data found.</div>;

  // Check if items exist
  const hasItems = Array.isArray(invoiceData.items) && invoiceData.items.length > 0;

  // --- 4. Main Render ---
  return (
    <div style={{ padding: "24px", background: colors.light, minHeight: "100vh" }}>
      <style>{`
        :root {
          --c-primary: ${colors.primary};
          --c-accent: ${colors.accent};
          --c-gray: ${colors.gray};
        }

        /* Print Settings */
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .no-print { display: none !important; }
          .print-container {
            position: absolute !important; left: 0; top: 0; width: 100%;
            box-shadow: none !important; margin: 0 !important; padding: 24px !important;
            border-radius: 0 !important; border: none !important; background: white !important;
          }
          .page { width: 210mm; min-height: 297mm; padding: 18mm 15mm; margin: 0; background: white; page-break-after: always; }
          .table th { background: #f2f4f7 !important; -webkit-print-color-adjust: exact; }
          .zebra tbody tr:nth-child(even) td { background: #fafafa !important; -webkit-print-color-adjust: exact; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
        }
        @page { size: A4; margin: 12mm; }

        /* Container Styles */
        .print-container {
          max-width: 980px; margin: 0 auto; background: white;
          box-shadow: 0 18px 40px rgba(12,60,60,0.12);
          border-radius: 16px; padding: 40px;
          border: 1px solid rgba(12,60,60,0.08);
        }

        /* Refactor Note: Removed gradient. Now using solid primary color */
        .top-accent {
          height: 6px; width: 100%;
          border-radius: 8px 8px 0 0;
          background-color: var(--c-primary);
          margin-bottom: 16px;
        }

        .header-wrap { margin-bottom: 18px; }
        .section-gap { margin-top: 22px; }
        .section-gap-lg { margin-top: 32px; }

        /* Refactor Note: Removed gradient text logic. Now solid color. */
        .header-title {
          color: var(--c-primary);
          letter-spacing: .3px; 
          font-weight: 800;
          font-size: 22px;
        }
        
        .subtle { color: var(--c-gray); font-size: 13px; margin-top: 4px; }
        .muted { color: #6b7280; font-size: 12px; }

        .badge {
          display: inline-block; padding: 4px 10px; font-size: 12px;
          border-radius: 999px; color: var(--c-primary);
          background: rgba(12,60,60,0.06);
          border: 1px solid rgba(12,60,60,0.12);
          font-weight: 700;
        }

        .card {
          border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px;
          background: #fcfffe;
        }

        /* Table Styles */
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td {
          border: 1px solid #e5e7eb; padding: 12px 14px; vertical-align: top;
          font-size: 13.5px; line-height: 1.45;
        }
        .table th {
          font-weight: 700; background: #f2f4f7; text-align: left; color: var(--c-primary);
        }
        .zebra tbody tr:nth-child(even) td { background: rgba(12,60,60,0.02); }

        /* Totals Section */
        .totals { width: 100%; max-width: 420px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 10px 0; }
        .totals-row.bold {
          font-weight: 800; border-top: 1px solid #e5e7eb; margin-top: 4px; padding-top: 12px; color: var(--c-primary);
        }

        .sign-line { border-top: 1px solid var(--c-primary); height: 26px; margin-top: 36px; }

        /* Notifications */
        .notice { margin-top: 18px; padding: 12px 14px; border-radius: 10px; font-size: 14px; }
        .notice.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }

        /* Buttons */
        .btn { padding: 12px 16px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; }
        .btn-outline {
          border: 1px solid var(--c-primary); background: white; color: var(--c-primary); transition: all .25s ease;
        }
        .btn-outline:hover {
          background: rgba(12,60,60,0.05);
        }
        .btn-solid {
          border: 1px solid var(--c-primary); background: var(--c-primary); color: white; transition: all .25s ease;
        }
        .btn-solid:hover {
          background: #0a2e2e;
        }
        .btn-row { display: flex; justify-content: flex-end; gap: 16px; flex-wrap: wrap; }
      `}</style>

      <div className="print-container page">
        <div className="top-accent" />

        {/* --- Header Section --- */}
        <div className="flex items-center gap-5 header-wrap" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          
          {/* Logo */}
          <div
            style={{
              width: 70,
              height: 70,
              border: "1px solid " + colors.primary,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: "#fff"
            }}
          >
            <img
              src={invoiceData.clinic.logo}
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = UOPLogo; }}
            />
          </div>

          {/* Clinic Info */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div className="header-title">
              {invoiceData.clinic.name}
            </div>
            <div className="subtle">
              Peradeniya, Sri Lanka • Tel: {invoiceData.clinic.phone} • Email: {invoiceData.clinic.email}
            </div>
            <div className="muted" style={{ marginTop: 2 }}>
              {invoiceData.clinic.address}
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="text-right" style={{ minWidth: 190, textAlign: "right" }}>
            <div className="badge">Invoice</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Date: <strong>{new Date(invoiceData.createdAt).toLocaleString()}</strong>
            </div>
            <div className="muted">
              No: <strong>{invoiceData.id}</strong>
            </div>
            {invoiceData.cashier && (
              <div className="muted">
                Issued by: <strong>{invoiceData.cashier}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ margin: "14px 0 12px 0", ...lineStyle }} />

        {/* --- Billed To Section --- */}
        <div className="section-gap">
          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 8, color: colors.primary }}>Billed To</div>
            <div style={{ marginBottom: 4 }}><strong>Name:</strong> {invoiceData.patientName}</div>
            <div style={{ marginBottom: 4 }}><strong>Age:</strong> {invoiceData.patientAge || "-"}</div>
            <div><strong>Sex:</strong> {invoiceData.patientGender || "-"}</div>
          </div>
        </div>

        {/* --- Items Table --- */}
        <table className="table zebra section-gap">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dosage</th>
              <th style={{ textAlign: "right" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {hasItems ? (
              invoiceData.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: colors.primary }}>
                      {item.medicineName || "-"}
                    </div>
                  </td>
                  <td>{item.dosage || "-"}</td>
                  <td style={{ textAlign: "right" }}>{item.dispenseQuantity || 0}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(item.unitPrice)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(item.totalPrice)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 18 }}>
                  No items found in this invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* --- Totals Section --- */}
        <div className="section-gap">
          <div className="totals card">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{formatMoney(invoiceData.subTotal)}</span>
            </div>
            {invoiceData.service > 0 && (
              <div className="totals-row">
                <span>Service Charge</span>
                <span>{formatMoney(invoiceData.service)}</span>
              </div>
            )}
            <div className="totals-row bold">
              <span>Total Amount</span>
              <span>{formatMoney(invoiceData.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* --- Footer / Signature --- */}
        <div className="section-gap-lg" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
          <div>
            <div className="sign-line" />
            <div className="muted" style={{ marginTop: 6 }}>Pharmacist/Cashier Signature</div>
          </div>
        </div>

        {/* Notifications */}
        {notice && (
          <div className={"notice " + notice.type}>
            {notice.text}
          </div>
        )}

        {/* --- Actions Buttons (Hidden when printing) --- */}
        <div className="no-print section-gap-lg btn-row">
          <button onClick={handlePrint} className="btn btn-outline">Download / Print</button>
          <button onClick={handleBack} className="btn btn-solid">Return to View Prescription</button>
        </div>

        {/* Footer Note */}
        <div className="section-gap" style={{ ...lineStyle }} />
        <div className="muted" style={{ marginTop: 8 }}>
          This invoice was generated by the University of Peradeniya Medical Center system.
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;