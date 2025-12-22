import React, { useState } from "react";
import logo from "../Images/logo.png"// 👈 update path if needed

const checklistItems = [
  "No solder defect on Elite PCB",
  "No electrical and physical damage component Elite Tracking PCB",
  "Wire harnessing check",
  "Manual components post-soldering worksheet implementation",
  "Check soldering of cable as per sequence (Green, Yellow, Red & Blue)",
  "Battery Connection to board – LED should glow red color",
  "No shorting of any component",
  "Power / Voltage Testing – All components in right polarity",
  "Firmware Flashing and IMEI to ICCID Mapping Request Raised",
  "Embedded SIM Activation",
  "Final QC Manual Check – Out of Box Audit",
  "Final QC System Check – Report Downloaded",
  "Packaging and Enclosure Sealing"
];

function AssemblyChecklist() {
  const [date, setDate] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  const [rows, setRows] = useState(
    checklistItems.map(() => ({
      imei: "",
      testedBy: "",
      note: ""
    }))
  );

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      date,
      checklist: rows,
      verifiedBy,
      approvedBy
    };
    console.log("Submitted Data:", payload);
    alert("Checklist Submitted Successfully");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      
      {/* LOGO */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <img
          src={logo}
          alt="Traxo Logo"
          style={{ height: "70px", objectFit: "contain" }}
        />
      </div>

      <h2 style={{ textAlign: "center", margin: 0 }}>
        Traxo AIS-140 Tracker (Elite)
      </h2>
      <h3 style={{ textAlign: "center", marginTop: "5px" }}>
        Assembly Checklist & Test Record
      </h3>

      <div style={{ marginBottom: "15px" }}>
        <strong>Date:</strong>{" "}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          width="100%"
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Check Point</th>
              <th>IMEI</th>
              <th>Tested By</th>
              <th>Assembly Note</th>
            </tr>
          </thead>

          <tbody>
            {checklistItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item}</td>
                <td>
                  <input
                    type="text"
                    value={rows[index].imei}
                    onChange={(e) =>
                      handleChange(index, "imei", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={rows[index].testedBy}
                    onChange={(e) =>
                      handleChange(index, "testedBy", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={rows[index].note}
                    onChange={(e) =>
                      handleChange(index, "note", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "30px" }}>
          <div style={{ marginBottom: "10px" }}>
            <strong>Verified By:</strong>{" "}
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
            />
          </div>

          <div>
            <strong>Approved By:</strong>{" "}
            <input
              type="text"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Submit Checklist
        </button>
      </form>
    </div>
  );
}

export default AssemblyChecklist;
