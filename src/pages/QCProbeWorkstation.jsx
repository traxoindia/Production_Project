import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import toast, { Toaster } from "react-hot-toast";
import { Cpu, CheckCircle, Download, User } from "lucide-react";

// --- Import Images ---
import logo from '../Images/logo.png' 
import approvedStamp from '../Images/Approved.png'
import SIGN from '../Images/SIGN.png'

// --- API Endpoint ---
const FETCH_EMPLOYEES_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllEmployee";

// --- Checklist Definitions ---
const CHECKLIST_ITEMS = {
    probeConnectivity: '1. Probe/Pin Connectivity Check',
    powerSupply: '2. Power Supply Voltage Verification (12V)',
    capacitorCheck: '3. Capacitor/Backup Battery Connection',
    terminalCleanliness: '4. Terminal/Housing Cleanliness',
    signalIntegrity: '5. Signal Integrity Test (e.g., USB Data Lines)',
    cableFlex: '6. Cable Strain/Flex Test',
    bootSequence: '7. Boot Sequence Confirmation (LED Check)',
    gpsFix: '8. GPS Cold/Hot Fix Time Verification',
    gsmConnection: '9. GSM Network Registration Status',
    identificationCheck: '10. Product ID/IMEI Match on Sticker',
    fwVersionMatch: '11. Firmware Version Consistency Check',
    assemblyIntegrity: '12. Physical Assembly Integrity (Screw Torque)',
    housingSeal: '13. Housing Seal/Water Resistance Check',
    labelPlacement: '14. Label Placement and Adhesion',
    qrScan: '15. QR Code Readability Scan Test',
    finalVisual: '16. Final Visual Inspection (No Scratches)',
    packingMaterial: '17. Packing Material Integrity'
};

const QCProbeWorkstation = ({ currentEmployee }) => {
    // --- State Management ---
    const [employeeNames, setEmployeeNames] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false); 
    const [selectedEmployeeName, setSelectedEmployeeName] = useState(currentEmployee || ""); 

    const [qcChecks, setQCChecks] = useState({});

    // 1. Initialize the checklist state 
    useEffect(() => {
        const initialChecks = {};
        Object.keys(CHECKLIST_ITEMS).forEach(key => {
            initialChecks[key] = false;
        });
        setQCChecks(initialChecks);
    }, []);
    
    // 2. Set the employee name state when the prop changes
    useEffect(() => {
        setSelectedEmployeeName(currentEmployee || "");
    }, [currentEmployee]);


    // --- API Fetch Function (Only for legacy, kept minimal) ---
    const fetchEmployees = async () => {
        setLoadingEmployees(true); 
        const token = localStorage.getItem("token");

        if (!token) {
            setLoadingEmployees(false);
            return;
        }

        try {
            const response = await fetch(FETCH_EMPLOYEES_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch employees: ${response.status}`);
            }

        } catch (error) {
            console.error("Error fetching Employees:", error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // --- Checklist Handlers ---
    const handleCheckChange = (key) => {
        setQCChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    // --- New Select All Handler ---
    const handleSelectAll = () => {
        const areAllChecked = allChecksComplete;
        const newChecks = {};
        // Set all to the opposite of the current state (if all are true, set all to false)
        Object.keys(CHECKLIST_ITEMS).forEach(key => {
            newChecks[key] = !areAllChecked;
        });
        setQCChecks(newChecks);
    };
    // ----------------------------

    const allChecksComplete = Object.values(qcChecks).every(Boolean);

    // --- PDF Generation Logic (Updated for Images) ---

    const handleGeneratePDF = () => {
        if (!selectedEmployeeName) { 
            toast.error("Employee name is missing. Cannot generate report!", { position: "top-right" });
            return;
        }

        // --- Dummy Record Generation ---
        const dummyRecord = {
            name: selectedEmployeeName,
            imei: "N/A (Tracking removed)", 
            result: allChecksComplete ? "Pass" : "Fail", 
            remark: allChecksComplete ? "All checks completed." : "Checklist not fully completed.",
            qcChecks: qcChecks,
            timestamp: new Date().toLocaleString()
        };
        const recordsToReport = [dummyRecord]; 
        // --- End Dummy Record Generation ---

        try {
            const doc = new jsPDF("p", "mm", "a4");

            // --- Load all images required for PDF ---
            const loadImages = () => {
                return new Promise((resolve, reject) => {
                    let imagesLoaded = 0;
                    const totalImages = 3;
                    const loadedAssets = {};

                    const checkCompletion = () => {
                        imagesLoaded++;
                        if (imagesLoaded === totalImages) {
                            resolve(loadedAssets);
                        }
                    };

                    const headerImg = new Image();
                    headerImg.onload = () => { loadedAssets.headerImg = headerImg; checkCompletion(); };
                    headerImg.onerror = reject;
                    headerImg.src = logo; 

                    const stampImg = new Image();
                    stampImg.onload = () => { loadedAssets.stampImg = stampImg; checkCompletion(); };
                    stampImg.onerror = reject;
                    stampImg.src = approvedStamp; 

                    const signImg = new Image();
                    signImg.onload = () => { loadedAssets.signImg = signImg; checkCompletion(); };
                    signImg.onerror = reject;
                    signImg.src = SIGN; 
                });
            };

            loadImages().then(({ headerImg, stampImg, signImg }) => {
                
                // --- 1. Report Header ---
                doc.addImage(headerImg, "PNG", 155, 5, 45, 25);
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.text("TRAXO (INDIA) AUTOMATION PVT. LTD.", 14, 20);
                
                doc.setFontSize(18);
                doc.setTextColor(52, 152, 219); 
                doc.text("QC Checklist Report", 14, 30);
                
                doc.setFontSize(11);
                doc.setTextColor(60, 60, 60);
                doc.text(`Generated by: ${selectedEmployeeName}`, 14, 38);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 43);

                let startY = 55;
                
                // --- 2. Checklist Table ---
                const checkTableColumns = ["Checklist Item", "Status"];
                const checkTableRows = Object.entries(CHECKLIST_ITEMS).map(([key, label]) => [
                    label,
                    recordsToReport[0].qcChecks[key] ? "✓ PASSED" : "✗ NOT CHECKED"
                ]);
                
                autoTable(doc, {
                    startY: startY,
                    head: [checkTableColumns],
                    body: checkTableRows,
                    styles: { halign: "left", fontSize: 10 },
                    headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
                    alternateRowStyles: { fillColor: [235, 245, 255] },
                    columnStyles: { 1: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [0, 0, 0] } }, 
                });

                startY = doc.lastAutoTable.finalY + 10;
                
                // --- 3. Summary ---
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("Final Summary:", 14, startY);
                startY += 7;
                
                doc.setFont("helvetica", "normal");
                doc.text(`Total Checks: ${Object.keys(CHECKLIST_ITEMS).length}`, 14, startY);
                startY += 5;
                doc.text(`Completed Checks: ${Object.values(qcChecks).filter(Boolean).length}`, 14, startY);
                startY += 5;
                doc.text(`Overall Status: ${recordsToReport[0].result} (${allChecksComplete ? 'Pass' : 'Fail'})`, 14, startY);
                startY += 5;
                doc.text(`Report Note: ${recordsToReport[0].remark}`, 14, startY);
                startY += 10;

                // --- 4. Signature and Stamp (at the bottom) ---
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 14;

                // Signature placeholder text
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
               
                doc.line(15, pageHeight - 33, 55, pageHeight - 33); // Line for signature

                // Add Signature Image (Example positioning: above the line)
                if (signImg) {
                    // Coordinates: (X, Y, Width, Height)
                    doc.addImage(signImg, "PNG", 18, pageHeight - 50, 30, 15);
                }

                // Add Approved Stamp (Placed on the right)
                if (stampImg && allChecksComplete) {
                     // Coordinates: (X, Y, Width, Height)
                    doc.addImage(stampImg, "PNG", pageWidth - 55, pageHeight - 55, 40, 40);
                }


                // --- 5. Footer ---
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(
                  "© TRAXO (INDIA) AUTOMATION PVT. LTD. | Confidential Report",
                  margin,
                  pageHeight - 1
                );

                doc.save(`QC_Checklist_${selectedEmployeeName.replace(/\s/g, '_')}.pdf`);
                toast.success("📄 PDF Generated Successfully!", { position: "top-right" });
            })
            .catch(error => {
                console.error("PDF Image Loading Error:", error);
                toast.error("❌ Failed to load images for PDF!", { position: "top-right" });
            });

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("❌ Failed to generate PDF!", { position: "top-right" });
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-r from-cyan-50 to-blue-100 flex flex-col items-center py-8 px-4">
            <Toaster position="top-right" reverseOrder={false} />
            <h1 className="text-2xl font-extrabold text-blue-700 mb-6 flex items-center gap-2">
                <Cpu size={30} /> 🛠️ **QC Probe Test Workstation**
            </h1>

            <div className="w-full max-w-6xl bg-white shadow-2xl rounded-xl p-6 border border-blue-200">
                
                {/* 1. Checklist and Controls */}
                <div className="mb-6 p-6 border rounded-xl bg-blue-50">
                    
                    {/* Top Control Row: Employee Display & Action */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-blue-200">
                        
                        {/* Employee Display */}
                        <div className="flex items-center gap-3 w-full md:w-1/3">
                            <User size={20} className="text-blue-700" />
                            <input
                                type="text"
                                value={selectedEmployeeName || "Loading..."}
                                disabled
                                placeholder="Employee Name"
                                className="w-full p-2 border rounded-md bg-gray-100 font-semibold text-gray-700 cursor-not-allowed"
                            />
                        </div>

                         {/* Completion Status */}
                         <div className="text-sm font-semibold text-gray-800">
                            Checklist Status: 
                            <span className={`ml-2 font-bold ${allChecksComplete ? 'text-green-600' : 'text-red-600'}`}>
                                {Object.values(qcChecks).filter(Boolean).length} / {Object.keys(CHECKLIST_ITEMS).length}
                            </span>
                        </div>
                        
                        {/* Primary Action Button */}
                        <button
                            onClick={handleGeneratePDF}
                            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
                            disabled={!selectedEmployeeName || !allChecksComplete} 
                        >
                            <Download size={20} /> Generate PDF Report
                        </button>
                    </div>

                    {/* Checklist Header and Select All Button */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-blue-800 text-xl flex items-center gap-2">
                            <CheckCircle size={22} /> **QC Inspection Checklist** ({Object.keys(CHECKLIST_ITEMS).length} Points)
                        </h2>
                        
                        {/* Select All Button */}
                        <button
                            onClick={handleSelectAll}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 
                                ${allChecksComplete
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                            {allChecksComplete ? 'Deselect All' : 'Select All Points'}
                        </button>
                    </div>
                    
                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(CHECKLIST_ITEMS).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition">
                                <input
                                    type="checkbox"
                                    checked={qcChecks[key]}
                                    onChange={() => handleCheckChange(key)}
                                    id={key}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor={key} className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QCProbeWorkstation;