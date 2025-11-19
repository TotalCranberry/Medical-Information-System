import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getInvoice, getInvoiceById } from "../../api/invoice";
import UOPLogo from "../../assets/UOP_logo.jpeg";

// ---- THEME TOKENS (match PrescriptionPrint) ----
const THEME = {
  primary: "#0C3C3C",
  accent:  "#45D27A",
  gray:    "#6C6B6B",
  white:   "#ffffff",
  light:   "#F8F9FA",
};

const line = { borderTop: "2px solid #0C3C3C" };

const fmtMoney = (v) => {
  const n = Number(v ?? 0);
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `Rs. ${n.toFixed(2)}`;
  }
};

const normalizeInvoice = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const patient = raw.patient || {};
  const patientName = raw.patientName || patient.name || patient.fullName || "-";
  const patientAge = raw.patientAge ?? patient.age ?? null;
  const patientGender = raw.patientGender ?? patient.gender ?? null;

  const createdAt = raw.createdAt || raw.date || raw.issuedAt || new Date().toISOString();
  const id = raw.id || raw.invoiceId || raw.number || "-";

  const items = Array.isArray(raw.invoiceItems)
    ? raw.invoiceItems
    : Array.isArray(raw.items)
    ? raw.items
    : [];

  const normItems = items.map((it, i) => {
    const qty = it.dispenseQuantity ?? it.quantity ?? it.qty ?? 0;
    const unit = it.unitPrice ?? it.price ?? 0;
    const total = it.totalPrice ?? it.total ?? qty * unit;
    return {
      id: it.id ?? `row_${i}`,
      medicineName: it.medicineName || it.name || it.title || "",
      dosage: it.dosage || it.strength || "-",
      dispenseQuantity: qty,
      unitPrice: unit,
      totalPrice: total,
    };
  });

  const subTotal = raw.subTotal ?? raw.subtotal ?? normItems.reduce((s, r) => s + Number(r.totalPrice || 0), 0);
  const service = raw.serviceCharge ?? raw.serviceFee ?? 0;
  const totalAmount = raw.totalAmount ?? raw.total ?? subTotal + Number(service);

  return {
    id,
    createdAt,
    patientName,
    patientAge,
    patientGender,
    items: normItems,
    subTotal,
    service,
    totalAmount,
    clinic: {
      name: raw.clinicName || "University of Peradeniya — Medical Center",
      phone: raw.clinicPhone || "—",
      email: raw.clinicEmail || "—",
      address: raw.clinicAddress || "—",
      logo: raw.clinicLogo || UOPLogo,
    },
    cashier: raw.cashier || raw.issuedBy || null,
  };
};

const InvoicePrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState({ loading: true, error: null, invoice: null });
  const [notice, setNotice] = useState(null);

  const showNotice = (type, text, ms = 2500) => {
    setNotice({ type, text });
    if (ms) setTimeout(() => setNotice(null), ms);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        let raw;
        // Try to get by invoice ID first (for staff invoices)
        try {
          raw = await getInvoiceById(id);
        } catch {
          // Fallback to prescription ID (for prescription invoices)
          raw = await getInvoice(id);
        }
        const norm = normalizeInvoice(raw);
        if (alive) setState({ loading: false, error: null, invoice: norm });
      } catch (e) {
        if (alive) setState({ loading: false, error: e?.message || "Failed to load invoice", invoice: null });
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const onPrint = () => {
    window.print();
    showNotice("success", "Invoice is ready in the print dialog.");
  };

  const onBack = () => {
    // Match how invoices are reached (usually from Completed tab)
    const fromTab = location.state?.fromTab || "Completed";
    navigate("/pharmacist/view-prescriptions", { state: { activeTab: fromTab } });
  };

  const invoice = state.invoice;

  if (state.loading) {
    return (
      <div className="p-6" style={{ color: THEME.primary }}>
        <style>{`
          .bar {
            height: 6px; width: 100%;
            background: linear-gradient(90deg, ${THEME.primary}, ${THEME.accent});
            border-radius: 4px; margin-bottom: 12px;
            animation: pulse 1.2s ease-in-out infinite;
          }
          @keyframes pulse {
            0% { opacity: .65; }
            50% { opacity: 1; }
            100% { opacity: .65; }
          }
        `}</style>
        <div className="bar" />
        Loading invoice…
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-6">
        <div style={{ background: "#ffefef", border: "1px solid #ffcccc", borderRadius: 12, padding: 16, color: "#8a1c1c" }}>
          {state.error}
        </div>
        <div className="mt-4" style={{ marginTop: 16 }}>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg"
            style={{ border: `1px solid ${THEME.primary}`, color: THEME.primary, background: "#fff" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) return <div className="p-6">No invoice data</div>;

  const hasItems = Array.isArray(invoice.items) && invoice.items.length > 0;

  return (
    <div className="p-6" style={{ background: THEME.light }}>
      <style>{`
        :root {
          --c-primary: ${THEME.primary};
          --c-accent: ${THEME.accent};
          --c-gray: ${THEME.gray};
        }

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

        .print-container {
          max-width: 980px; margin: 0 auto; background: white;
          box-shadow: 0 18px 40px rgba(12,60,60,0.12);
          border-radius: 16px; padding: 40px;
          border: 1px solid rgba(12,60,60,0.08);
        }

        .top-accent {
          height: 6px; width: 100%;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(90deg, var(--c-primary), var(--c-accent));
          margin-bottom: 16px;
        }

        .header-wrap { margin-bottom: 18px; }
        .section-gap { margin-top: 22px; }
        .section-gap-lg { margin-top: 32px; }

        .header-title {
          color: var(--c-primary); letter-spacing: .3px; font-weight: 800;
          background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .subtle { color: var(--c-gray); }
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

        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td {
          border: 1px solid #e5e7eb; padding: 12px 14px; vertical-align: top;
          font-size: 13.5px; line-height: 1.45;
        }
        .table th {
          font-weight: 700; background: #f2f4f7; text-align: left; color: var(--c-primary);
        }
        .zebra tbody tr:nth-child(even) td { background: rgba(12,60,60,0.02); }

        .totals { width: 100%; max-width: 420px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 10px 0; }
        .totals-row.bold {
          font-weight: 800; border-top: 1px solid #e5e7eb; margin-top: 4px; padding-top: 12px; color: var(--c-primary);
        }

        .sign-line { border-top: 1px solid var(--c-primary); height: 26px; margin-top: 36px; }

        .notice { margin-top: 18px; padding: 12px 14px; border-radius: 10px; font-size: 14px; }
        .notice.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .notice.error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .btn { padding: 12px 16px; border-radius: 12px; cursor: pointer; font-weight: 700; }
        .btn-outline {
          border: 1px solid var(--c-primary); background: white; color: var(--c-primary); transition: all .25s ease;
        }
        .btn-outline:hover {
          background: var(--c-primary); color: white; transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(12,60,60,0.25);
        }
        .btn-solid {
          border: 1px solid var(--c-primary); background: var(--c-primary); color: white; transition: all .25s ease;
        }
        .btn-solid:hover {
          transform: translateY(-1px); box-shadow: 0 10px 28px rgba(12,60,60,0.25); background: #0a2e2e;
        }
        .btn-row { display: flex; justify-content: flex-end; gap: 16px; flex-wrap: wrap; }
      `}</style>

      <div className="print-container page">
        <div className="top-accent" />

        {/* Header — mirrored from PrescriptionPrint */}
        <div className="flex items-center gap-5 header-wrap" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 70,
              height: 70,
              border: "1px solid var(--c-primary)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 8px 20px rgba(12,60,60,0.15)"
            }}
          >
            <img
              src={invoice.clinic.logo}
              alt="University of Peradeniya logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = UOPLogo; }}
            />
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div className="header-title" style={{ fontSize: 22 }}>
              {invoice.clinic.name}
            </div>
            <div className="subtle" style={{ fontSize: 13, marginTop: 4 }}>
              Peradeniya, Sri Lanka • Tel: {invoice.clinic.phone} • Email: {invoice.clinic.email}
            </div>
            <div className="muted" style={{ marginTop: 2 }}>
              {invoice.clinic.address}
            </div>
          </div>

          <div className="text-right" style={{ minWidth: 190, textAlign: "right" }}>
            <div className="badge">Invoice</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Date: <strong>{new Date(invoice.createdAt).toLocaleString()}</strong>
            </div>
            <div className="muted">
              No: <strong>{invoice.id}</strong>
            </div>
            {invoice.cashier && (
              <div className="muted">
                Issued by: <strong>{invoice.cashier}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ margin: "14px 0 12px 0", ...line }} />

        {/* Billed To — same card style */}
        <div className="section-gap" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
          <div className="card" style={{ background: "#fcfffe" }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: THEME.primary }}>Billed To</div>
            <div style={{ marginBottom: 4 }}><strong>Name:</strong> {invoice.patientName}</div>
            <div style={{ marginBottom: 4 }}><strong>Age:</strong> {invoice.patientAge ?? "-"}</div>
            <div><strong>Sex:</strong> {invoice.patientGender ?? "-"}</div>
          </div>
        </div>

        {/* Items table — zebra + right-aligned numbers */}
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
              invoice.items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: THEME.primary }}>
                      {it.medicineName || "-"}
                    </div>
                  </td>
                  <td>{it.dosage || "-"}</td>
                  <td style={{ textAlign: "right" }}>{it.dispenseQuantity ?? 0}</td>
                  <td style={{ textAlign: "right" }}>{fmtMoney(it.unitPrice)}</td>
                  <td style={{ textAlign: "right" }}>{fmtMoney(it.totalPrice)}</td>
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

        {/* Totals — matches card & typography */}
        <div className="section-gap">
          <div className="totals card">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{fmtMoney(invoice.subTotal)}</span>
            </div>
            {invoice.service ? (
              <div className="totals-row">
                <span>Service Charge</span>
                <span>{fmtMoney(invoice.service)}</span>
              </div>
            ) : null}
            <div className="totals-row bold">
              <span>Total Amount</span>
              <span>{fmtMoney(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Signature — same style */}
        <div className="section-gap-lg" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
          <div>
            <div className="sign-line" />
            <div className="muted" style={{ marginTop: 6 }}>Pharmacist/Cashier Signature</div>
          </div>
        </div>

        {/* Notice — shared style */}
        {notice && (<div className={`notice ${notice.type}`}>{notice.text}</div>)}

        {/* Actions — same buttons */}
        <div className="no-print section-gap-lg btn-row">
          <button onClick={onPrint} className="btn btn-outline">Download / Print</button>
          <button onClick={onBack} className="btn btn-solid">Return to View Prescription</button>
        </div>

        {/* Footer — same vibe */}
        <div className="section-gap" style={{ ...line }} />
        <div className="muted" style={{ marginTop: 8 }}>
          This invoice was generated by the University of Peradeniya Medical Center system.
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
