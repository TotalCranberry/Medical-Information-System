import React, { useState, useRef } from "react";
import {
  Box, Typography, Paper, Grid, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Checkbox
} from "@mui/material";


const initialInventory = {
  Paracetamol: {
    stock: 1200,
    form: "Tablet",
    strength: "500mg",
    category: "Painkiller"
  },
  Cetrizine: {
    stock: 40,
    form: "Tablet",
    strength: "10mg",
    category: "Antihistamine"
  }
};


const initialRequests = [
  {
    id: 1,
    name: "A.B.C. Dasanayaka",
    age: 44,
    gender: "Male",
    requestedAt: new Date().toLocaleString(),
    prescription: [
      { drug: "Paracetamol", dose: 1, timesPerDay: 2, days: 5, type: "pill" },
      { drug: "Cetrizine", dose: 1, timesPerDay: 1, days: 7, type: "pill" }
    ]
  }
];

const PrescriptionsPage = () => {
  const [tab, setTab] = useState("Requests");
  const [inventory, setInventory] = useState(initialInventory);
  const [requests, setRequests] = useState(initialRequests);
  const [pending, setPending] = useState([]);
  const [fulfilled, setFulfilled] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [dispensed, setDispensed] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef();

  const handleViewPrescription = (patient) => {
    setRequests((prev) => prev.filter((p) => p.id !== patient.id));
    setPending((prev) => [...prev, patient]);
    setSelectedPrescription(patient);
    setDispensed({});
    setRemarks("");
    setTab("Pending");
  };

  const handleCheckboxChange = (drug, requiredQty) => {
    setDispensed((prev) => ({
      ...prev,
      [drug]: !prev[drug]
    }));

    if (!dispensed[drug]) {
      setInventory((prev) => {
        const updated = { ...prev };
        if (updated[drug] && updated[drug].stock >= requiredQty) {
          updated[drug].stock -= requiredQty;
        }
        return updated;
      });
    }
  };

  const handleCompletePrescription = (patient) => {
    const issuedAt = new Date().toLocaleString();
    setPending((prev) => prev.filter((p) => p.id !== patient.id));
    setFulfilled((prev) => [...prev, { ...patient, remarks, dispensed, issuedAt }]);
    setSelectedPrescription(null);
    setRemarks("");
    setDispensed({});
    setTab("Requests");
  };

  const handleDownloadPrescription = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head><title>Prescription</title></head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    const interval = setInterval(() => {
      if (printWindow.closed) clearInterval(interval);
    }, 500);

    printWindow.print();
  };

  const summary = {
    Requests: requests.length,
    Pending: pending.length,
    Fulfilled: fulfilled.length
  };

  const tabData = { Requests: requests, Pending: pending, Fulfilled: fulfilled };

  return (
    <Box sx={{ px: 3, py: 5 }}>
      <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 5 }}>
        Prescriptions
      </Typography>


      <Grid container spacing={4} justifyContent="center" mb={5}>
        {Object.entries(summary).map(([key, value]) => (
          <Grid item key={key}>
            <Paper elevation={6} sx={{
              p: 4, textAlign: "center", borderLeft: "6px solid #45d27a",
              borderRadius: "16px", height: 180, width: 260,
              display: "flex", flexDirection: "column", justifyContent: "center"
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#0c3c3c", mb: 1 }}>{key}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#45d27a" }}>{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>


      <Box display="flex" justifyContent="center" mb={3} gap={2}>
        {["Requests", "Pending", "Fulfilled"].map((label) => (
          <Button
            key={label}
            variant={tab === label ? "contained" : "outlined"}
            onClick={() => setTab(label)}
            sx={{
              backgroundColor: tab === label ? "#0c3c3c" : "transparent",
              color: tab === label ? "#fff" : "#0c3c3c",
              borderColor: "#0c3c3c",
              "&:hover": { backgroundColor: tab === label ? "#173d3d" : "#f5f5f5" },
              fontWeight: 600, px: 3, py: 1.2, borderRadius: "10px"
            }}
          >
            {label}
          </Button>
        ))}
      </Box>


      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        {tab === "Pending" && selectedPrescription ? (
          <>

            <Box ref={printRef} sx={{ border: "1px solid #ccc", borderRadius: 2, padding: 4, backgroundColor: "#fdfdfd", mb: 4 }}>
              <Typography variant="h6">Prescription for {selectedPrescription.name}</Typography>
              <Typography><strong>Patient ID:</strong> P-{selectedPrescription.id.toString().padStart(4, "0")}</Typography>
              <Typography><strong>Age:</strong> {selectedPrescription.age}</Typography>
              <Typography><strong>Gender:</strong> {selectedPrescription.gender}</Typography>
              <Typography><strong>Date:</strong> {new Date().toLocaleString()}</Typography>

              <Box mt={2}>
                <Typography><strong>Medicines:</strong></Typography>
                {selectedPrescription.prescription.map((item, i) => {
                  const requiredQty = item.dose * item.timesPerDay * item.days;
                  const available = inventory[item.drug]?.stock >= requiredQty;
                  const given = dispensed[item.drug];
                  return (
                    <Box key={i} display="flex" justifyContent="space-between" mt={1}>
                      <Typography>
                        • {item.drug} – {item.dose} {item.type}(s) × {item.timesPerDay}/day for {item.days} days
                      </Typography>
                      <Typography>{given ? "✔" : !available ? "❌" : ""}</Typography>
                    </Box>
                  );
                })}
              </Box>

              {remarks.trim() !== "" && (
                <Box mt={3}>
                  <Typography><strong>Remarks:</strong></Typography>
                  <Typography>{remarks}</Typography>
                </Box>
              )}

              {/* Signature Block */}
              <Box mt={6} display="flex" justifyContent="flex-end">
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ mb: 6 }}>&nbsp;</Typography>
                  <Typography sx={{ borderTop: "1px solid #000", width: "200px", pt: 1 }}>
                    Doctor’s Signature
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#555" }}>
                    Dr. [Full Name], [Reg. No.]
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>
                    [Clinic Stamp]
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant="h6">Dispense Medicines</Typography>
              {selectedPrescription.prescription.map((item, i) => {
                const requiredQty = item.dose * item.timesPerDay * item.days;
                const available = inventory[item.drug]?.stock >= requiredQty;
                return (
                  <Box key={i} display="flex" alignItems="center" gap={2} mt={1}>
                    <Checkbox
                      checked={!!dispensed[item.drug]}
                      disabled={!available}
                      onChange={() => handleCheckboxChange(item.drug, requiredQty)}
                    />
                    <Typography>
                      {item.drug} — {requiredQty} unit(s) {available ? "" : "(Unavailable)"}
                    </Typography>
                  </Box>
                );
              })}
            </Box>


            <Box mb={4}>
              <Typography variant="h6" gutterBottom>Search Inventory</Typography>
              <Box sx={{ position: "relative", mb: 2 }}>
                <input
                  type="text"
                  placeholder="Search medicine by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                  }}
                />
              </Box>

              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Form</strong></TableCell>
                    <TableCell><strong>Strength</strong></TableCell>
                    <TableCell><strong>Stock</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(inventory)
                    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(([name, info], index) => (
                      <TableRow key={index}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{info.form}</TableCell>
                        <TableCell>{info.strength}</TableCell>
                        <TableCell>{info.stock}</TableCell>
                        <TableCell>{info.category}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>


            <Box mb={4}>
              <Typography variant="h6">Remarks</Typography>
              <textarea
                rows="3"
                placeholder="e.g., Issued all except Cetrizine."
                onChange={(e) => setRemarks(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <Button
                variant="outlined"
                sx={{ mt: 2, mr: 2, borderColor: "#0c3c3c", color: "#0c3c3c" }}
                onClick={handleDownloadPrescription}
              >
                Download & Print Prescription
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#45d27a", "&:hover": { backgroundColor: "#3ca769" } }}
                onClick={() => handleCompletePrescription(selectedPrescription)}
              >
                Complete
              </Button>
            </Box>
          </>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Date & Time</TableCell>
                {tab === "Requests" && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {tabData[tab].map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.gender}</TableCell>
                  <TableCell>
                    {tab === "Requests" ? row.requestedAt : row.issuedAt || "N/A"}
                  </TableCell>
                  {tab === "Requests" && (
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleViewPrescription(row)}
                        sx={{ borderColor: "#45d27a", color: "#45d27a" }}
                      >
                        View Prescription
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default PrescriptionsPage;
