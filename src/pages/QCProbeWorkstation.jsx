import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import toast, { Toaster } from "react-hot-toast";
import { Cpu, CheckCircle, Download, User, ChevronDown, Archive, Clock, Hash, Zap, BarChart2, Send, Lock, Search } from "lucide-react"; 

// --- Import Images ---
import logo from '../Images/logo.png' 
import approvedStamp from '../Images/Approved.png'
import SIGN from '../Images/SIGN.png'

// --- API Endpoints ---
const FETCH_EMPLOYEES_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllEmployee";
const FETCH_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchFirmWareDetails"; 
const QC_SUBMIT_API = "https://vanaras.onrender.com/api/v1/superadmin/QualityCheck"; 

// --- Checklist Definitions ---
const CHECKLIST_ITEMS = {
    probeConnectivity: '1.PCB S.No.',
    powerSupply: '2.Check the device ID on the server for GPS, GSM signal',
    capacitorCheck: '3.Check the status of connection of device & battery status in server.',
    terminalCleanliness: '4.Check the indication of LED on the device for stability of signal',
    signalIntegrity: '5. Check for PCB tightness & screw on PCB',
    cableFlex: '6.Conformal coating has to be done on both sides of the PCA & check solder ball on both side of PCA',
    bootSequence: '7.Check for the S.No. on PCA',
    gpsFix: '8.Check for the glue & cable routing',
    gsmConnection: '9.Product Damage, Dust, Cleanliness & Ensure the cabinet screws are tighten properly',
    identificationCheck: '10. Product ID/IMEI Match on Sticker',
    fwVersionMatch: '11. Firmware Version Consistency Check',
    assemblyIntegrity: '12. Physical Assembly Integrity (Screw Torque)',
    housingSeal: '13.Check glue application and proper cable routing',
    labelPlacement: '14.Verify LED indication on device for signal stability',
    qrScan: '15. Verify PCB serial number',
    finalVisual: '16. Final Visual Inspection (No Scratches)',
    packingMaterial: '17. Packing Material Integrity'
};

// Function to generate the initial checklist state (all false)
const initializeChecklist = () => {
    const initialChecks = {};
    Object.keys(CHECKLIST_ITEMS).forEach(key => {
        initialChecks[key] = false;
    });
    return initialChecks;
};


const QCProbeWorkstation = ({ currentEmployee }) => {
    // --- State Management ---
    const [employeeNames, setEmployeeNames] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false); 
    const [selectedEmployeeName, setSelectedEmployeeName] = useState(currentEmployee || ""); 
    
    // Holds the full list of IMEI records
    const [imeiRecords, setImeiRecords] = useState([]); 
    const [loadingFirmware, setLoadingFirmware] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    // STATE FOR ACCORDION & FILTER
    const [openImei, setOpenImei] = useState(null); 
    const [imeiFilter, setImeiFilter] = useState(""); 

    // Derived State: The currently selected record and its checklist status
    const selectedRecord = imeiRecords.find(record => record.imeiNo === openImei);
    const qcChecks = selectedRecord ? selectedRecord.qcChecks : initializeChecklist();
    const allChecksComplete = Object.values(qcChecks).every(Boolean);

    // Check if the currently open record is completed
    const isRecordCompleted = selectedRecord?.isQcCompleted || false;


    // 2. Set the employee name state when the prop changes
    useEffect(() => {
        setSelectedEmployeeName(currentEmployee || "");
    }, [currentEmployee]);


    // --- API Fetch Function (Employees - Kept minimal) ---
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
            // Employee data processing would go here
            
        } catch (error) {
            console.error("Error fetching Employees:", error);
        } finally {
            setLoadingEmployees(false);
        }
    };
    
    // --- API Fetch Function for IMEI/Firmware Details ---
    const fetchFirmWareDetails = async () => {
        setLoadingFirmware(true);
        const token = localStorage.getItem("token");
    
        if (!token) {
            setLoadingFirmware(false);
            toast.error("Authentication token not found for firmware.");
            return;
        }
    
        try {
            const response = await fetch(FETCH_FIRMWARE_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch IMEI details: ${response.status}`);
            }
            
            const data = await response.json();
            
            const fetchedList = data.firmWareDetailsList || []; 
            
            // MAP CHANGE: Initialize records with isQcCompleted based on firmWareStatus
            const initializedRecords = fetchedList.map(record => ({
                ...record,
                qcChecks: initializeChecklist(), 
                isQcCompleted: record.firmWareStatus, // Set lock status based on API response
            }));

            setImeiRecords(initializedRecords); 
            toast.success(`Fetched ${initializedRecords.length} IMEI records.`);
            
        } catch (error) {
            console.error("Error fetching IMEI Details:", error);
            toast.error(`Failed to fetch IMEI details.`);
        } finally {
            setLoadingFirmware(false);
        }
    };


    // Combined useEffect for API calls
    useEffect(() => {
        fetchEmployees();
        fetchFirmWareDetails(); 
    }, []);

    // --- Checklist Handlers ---
    const handleCheckChange = (key) => {
        // Prevent changes if the record is already completed
        if (!openImei || isRecordCompleted) return; 

        setImeiRecords(prevRecords => 
            prevRecords.map(record => {
                if (record.imeiNo === openImei) {
                    return {
                        ...record,
                        qcChecks: {
                            ...record.qcChecks,
                            [key]: !record.qcChecks[key],
                        },
                    };
                }
                return record;
            })
        );
    };
    
    const handleSelectAll = () => {
        // Prevent changes if the record is already completed
        if (!openImei || isRecordCompleted) return; 
        
        const areAllChecked = allChecksComplete;

        setImeiRecords(prevRecords => 
            prevRecords.map(record => {
                if (record.imeiNo === openImei) {
                    const updatedChecks = {};
                    Object.keys(CHECKLIST_ITEMS).forEach(key => {
                        updatedChecks[key] = !areAllChecked;
                    });

                    return {
                        ...record,
                        qcChecks: updatedChecks,
                    };
                }
                return record;
            })
        );
    };

    // --- Accordion Handler ---
    const toggleAccordion = (imeiNo) => {
         // Find the record to check its completion status
         const record = imeiRecords.find(r => r.imeiNo === imeiNo);
         
         // Only toggle if the record is NOT completed OR if it's the currently open one (to allow closing)
         if (!record?.isQcCompleted || openImei === imeiNo) {
             setOpenImei(openImei === imeiNo ? null : imeiNo);
         } else {
            toast.error("This QC record is already submitted and locked.", { position: "top-right" });
         }
    };

    // --- QC Submission Handler ---
    const handleQcSubmit = async () => {
        if (!selectedRecord) {
            toast.error("No record selected for submission.", { position: "top-right" });
            return;
        }
        if (!allChecksComplete) {
            toast.error("Please complete all checklist points before submitting.", { position: "top-right" });
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        const checks = selectedRecord.qcChecks;

        const submissionPayload = {
            imeiNo: selectedRecord.imeiNo,
            empName: selectedEmployeeName, 
            probePin: checks.probeConnectivity,
            powerSupply: checks.powerSupply,
            capacitorBackup: checks.capacitorCheck,
            terminal: checks.terminalCleanliness,
            signalIntegraty: checks.signalIntegrity,
            cabelStrain: checks.cableFlex,
            ledCheck: checks.bootSequence,
            gpsClod: checks.gpsFix,
            gsmNetwork: checks.gsmConnection,
            productId: checks.identificationCheck,
            // fwVersionMatch is intentionally omitted as it lacks an API field
            physicallyAssembly: checks.assemblyIntegrity,
            housingSeal: checks.housingSeal,
            labelPlaceMent: checks.labelPlacement,
            qrCodeRelaliablty: checks.qrScan,
            finalVisualInspection: checks.finalVisual,
            packingMatarialIntegraty: checks.packingMaterial,
        };
        
        console.log("QC Submission Payload:", submissionPayload);


        try {
            const response = await fetch(QC_SUBMIT_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionPayload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Failed to submit QC results: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // --- SUCCESS LOGIC: Mark Record as Completed and Lock ---
            toast.success(`✅ QC Report for IMEI ${selectedRecord.imeiNo} submitted successfully!`, { position: "top-right", duration: 4000 });
            
            // 1. Update the record's isQcCompleted status to true
            setImeiRecords(prevRecords => 
                prevRecords.map(record => {
                    if (record.imeiNo === selectedRecord.imeiNo) {
                        // Also set firmWareStatus to true to simulate persistence if this component reloads
                        return { ...record, isQcCompleted: true, firmWareStatus: true };
                    }
                    return record;
                })
            );
            
            // 2. Generate PDF
            handleGeneratePDF(); 
            
            // 3. Close the accordion after submission
            setOpenImei(null); 

        } catch (error) {
            console.error("QC Submission Error:", error);
            toast.error(`❌ Submission failed: ${error.message}`, { position: "top-right", duration: 7000 });
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- END: QC Submission Handler ---


    // --- PDF Generation Logic ---
    const handleGeneratePDF = () => {
        // Use isRecordCompleted for lock check in PDF
        if (!selectedRecord || (!allChecksComplete && !selectedRecord.isQcCompleted)) { 
            toast.error("Complete the checklist or select a submitted record to generate the PDF.", { position: "top-right" });
            return;
        }
        if (!selectedEmployeeName) { 
            toast.error("Employee name is missing. Cannot generate report!", { position: "top-right" });
            return;
        }


        // --- Record Generation based on selectedRecord state ---
        const recordToReport = {
            name: selectedEmployeeName,
            imei: selectedRecord.imeiNo, 
            slNo: selectedRecord.slNo,
            result: selectedRecord.isQcCompleted || allChecksComplete ? "Pass" : "Fail", 
            remark: selectedRecord.isQcCompleted || allChecksComplete ? "All checks completed." : "Checklist not fully completed.",
            qcChecks: selectedRecord.qcChecks,
            timestamp: new Date().toLocaleString()
        };
        const recordsToReport = [recordToReport]; 
        // --- End Record Generation ---

        try {
            const doc = new jsPDF("p", "mm", "a4");
            
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
                doc.text(`IMEI/SL No: ${recordToReport.imei} / ${recordToReport.slNo}`, 14, 38);
                doc.text(`Generated by: ${selectedEmployeeName}`, 14, 43);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 48);

                let startY = 60;
                
                // --- 2. Checklist Table ---
                const checkTableColumns = ["Checklist Item", "Status"];
                const checkTableRows = Object.entries(CHECKLIST_ITEMS).map(([key, label]) => [
                    label,
                    recordToReport.qcChecks[key] ? "✓ PASSED" : "✗ NOT CHECKED"
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
                doc.text(`Completed Checks: ${Object.values(recordToReport.qcChecks).filter(Boolean).length}`, 14, startY);
                startY += 5;
                doc.text(`Overall Status: ${recordToReport.result}`, 14, startY);
                startY += 5;
                doc.text(`Report Note: ${recordToReport.remark}`, 14, startY);
                startY += 10;

                // --- 4. Signature and Stamp (at the bottom) ---
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 14;

                // Signature placeholder text
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
               
                doc.line(15, pageHeight - 33, 55, pageHeight - 33); // Line for signature
                doc.text("QC Operator Signature", 15, pageHeight - 29); 

                // Add Signature Image 
                if (signImg) {
                    doc.addImage(signImg, "PNG", 18, pageHeight - 50, 30, 15);
                }

                // Add Approved Stamp (Placed on the right)
                if (stampImg && (selectedRecord.isQcCompleted || allChecksComplete)) {
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

                doc.save(`QC_Report_${recordToReport.imei}.pdf`);
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

    // Filter the records based on the input field
    const filteredImeiRecords = imeiRecords.filter(record => 
        record.imeiNo && record.imeiNo.toLowerCase().includes(imeiFilter.toLowerCase())
    );


    return (
        <div className="min-h-screen bg-gradient-to-r from-cyan-50 to-blue-100 flex flex-col items-center py-8 px-4">
            <Toaster position="top-right" reverseOrder={false} />
            <h1 className="text-2xl font-extrabold text-blue-700 mb-6 flex items-center gap-2">
                <Cpu size={30} /> 🛠️ **QC Probe Test Workstation**
            </h1>

            <div className="w-full max-w-6xl bg-white shadow-2xl rounded-xl p-6 border border-blue-200">
                
                {/* 1. Control Row (Employee, Filter, Status, PDF) - Refined Layout */}
                <div className="grid grid-cols-1 gap-4 mb-6 pb-4 border-b border-blue-200 sm:grid-cols-2 lg:grid-cols-4 items-center">
                    
                    {/* Employee Display (Column 1) */}
                    <div className="flex items-center gap-3">
                        <User size={20} className="text-blue-700" />
                        <input
                            type="text"
                            value={selectedEmployeeName || "Loading..."}
                            disabled
                            placeholder="Employee Name"
                            className="w-full p-2 border rounded-md bg-gray-100 font-semibold text-gray-700 cursor-not-allowed"
                        />
                    </div>

                    {/* IMEI Filter Input (Column 2) - Combined and placed correctly */}
                    <div className="flex items-center gap-2 border rounded-md px-2 bg-white shadow-sm">
                        <Search size={20} className="text-gray-500" />
                        <input
                            type="text" // Changed back to text to prevent input field control issues on web, relying on onChange slice
                            inputMode="numeric" // Suggest numeric keyboard on mobile
                            pattern="[0-9]*" // Hint for numeric input
                            value={imeiFilter}
                            onChange={(e) => {
                                // Enforce max 15 digits
                                const value = e.target.value.replace(/\D/g, '').slice(0, 15); // Strip non-digits and enforce length
                                setImeiFilter(value);
                            }}
                            placeholder="Filter by IMEI (15 digits)"
                            className="w-full p-1.5 bg-white focus:outline-none text-gray-700 text-sm"
                            maxLength={15} 
                        />
                    </div>
                    
                    {/* Completion Status for SELECTED Record (Column 3) */}
                    <div className="flex items-center text-sm font-semibold text-gray-800">
                        **Status:**
                        {openImei ? (
                            <span className={`ml-2 font-bold ${isRecordCompleted ? 'text-green-600' : (allChecksComplete ? 'text-green-600' : 'text-red-600')}`}>
                                {Object.values(qcChecks).filter(Boolean).length} / {Object.keys(CHECKLIST_ITEMS).length}
                            </span>
                        ) : (
                            <span className="ml-2 text-gray-500">Select IMEI</span>
                        )}
                    </div>
                    
                    {/* Primary Action Button (Download PDF Button) (Column 4) */}
                    <button
                        onClick={handleGeneratePDF}
                        className="w-full bg-gray-500 text-white px-8 py-3 rounded-md hover:bg-gray-600 font-semibold transition flex items-center justify-center gap-2"
                        disabled={!selectedRecord} 
                    >
                        <Download size={20} /> Download PDF Report
                    </button>
                </div>

                {/* 2. IMEI/Firmware Records Accordion */}
                <div className="mb-6 p-6 border rounded-xl bg-gray-50">
                    <h2 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4 pb-2 border-b border-gray-300">
                        <Archive size={22} /> **Fetched IMEI/Production Records** ({filteredImeiRecords.length} found)
                    </h2>

                    {loadingFirmware && (
                         <div className="text-center p-4 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                            Loading IMEI Records...
                         </div>
                    )}
                    
                    {/* Accordion Container */}
                    <div className="space-y-3">
                        {filteredImeiRecords.map((record, index) => { 
                            const recordChecksComplete = Object.values(record.qcChecks).every(Boolean);
                            const isLocked = record.isQcCompleted; 

                            return (
                            <div key={record.imeiNo || index} className="border border-gray-300 rounded-xl overflow-hidden shadow-md">
                                
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleAccordion(record.imeiNo)}
                                    // Disable button if locked and not currently open
                                    disabled={isLocked && openImei !== record.imeiNo} 
                                    className={`w-full flex justify-between items-center p-4 font-bold text-left transition-colors duration-200 
                                        ${isLocked
                                            ? 'bg-green-100 text-green-800 opacity-80 cursor-not-allowed'
                                            : openImei === record.imeiNo 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'bg-white hover:bg-blue-50 text-gray-800'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Hash size={20} className={isLocked ? 'text-green-600' : (openImei === record.imeiNo ? 'text-white' : 'text-blue-600')}/>
                                        IMEI: **{record.imeiNo || `Record ${index + 1}`}**
                                        {isLocked ? (
                                            <span className="ml-2 px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-full flex items-center gap-1">
                                                <Lock size={14} /> QC PASSED
                                            </span>
                                        ) : (
                                            recordChecksComplete && <CheckCircle size={18} className={openImei === record.imeiNo ? 'text-green-300' : 'text-green-600'}/>
                                        )}
                                    </span>
                                    <ChevronDown size={20} className={`transform transition-transform ${openImei === record.imeiNo ? 'rotate-180 text-white' : 'rotate-0 text-gray-500'}`} />
                                </button>

                                {/* Accordion Content (Summary + Checklist) */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openImei === record.imeiNo ? 'max-h-[1200px] p-4' : 'max-h-0 p-0'}`}>
                                    {openImei === record.imeiNo && (
                                        <div className="space-y-6">
                                            
                                            {/* Summary Details Grid (Cards) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <DetailCard label="Serial No" value={record.slNo} icon={BarChart2} />
                                                <DetailCard label="ICCID No" value={record.iccidNo} icon={BarChart2} />
                                                <DetailCard 
                                                    label="Firmware Status" 
                                                    value={record.firmWareStatus ? 'Complete' : 'Complete'} 
                                                    status={record.firmWareStatus} 
                                                    icon={Zap} 
                                                />
                                                
                                                {record.imeiDetails && (
                                                    <>
                                                        <DetailCard label="Batch No" value={record.imeiDetails.batchNo} icon={Archive} />
                                                        <DetailCard label="Lot No" value={record.imeiDetails.lotNo} icon={Archive} />
                                                        <DetailCard 
                                                            label="Soldering Status" 
                                                            value={record.imeiDetails.solderingStatus ? 'Done' : 'Pending'} 
                                                            status={record.imeiDetails.solderingStatus} 
                                                            icon={Cpu} 
                                                        />
                                                        <DetailCard 
                                                            label="Production Status (1)" 
                                                            value={record.imeiDetails.status_ONE ? 'Done' : 'Pending'} 
                                                            status={record.imeiDetails.status_ONE} 
                                                            icon={CheckCircle} 
                                                        />
                                                        <DetailCard 
                                                            label="Record Created" 
                                                            value={new Date(record.imeiDetails.createdAt).toLocaleDateString()} 
                                                            icon={Clock} 
                                                        />
                                                        <DetailCard 
                                                            label="Last Updated" 
                                                            value={new Date(record.updatedAt).toLocaleDateString()} 
                                                            icon={Clock} 
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            {/* QC Checklist */}
                                            <div className="p-4 border border-blue-300 rounded-xl bg-blue-50">
                                                {/* Checklist Header and Select All Button */}
                                                <div className="flex justify-between items-center mb-4 border-b pb-3 border-blue-200">
                                                    <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2">
                                                        <CheckCircle size={20} /> **QC Inspection Checklist** ({Object.keys(CHECKLIST_ITEMS).length} Points)
                                                    </h3>
                                                    
                                                    {/* Select All Button */}
                                                    <button
                                                        onClick={handleSelectAll}
                                                        disabled={isLocked} // Disabled if locked
                                                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                                                            ${recordChecksComplete
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                    >
                                                        {recordChecksComplete ? 'Deselect All' : 'Select All Points'}
                                                    </button>
                                                </div>
                                                
                                                {/* Checklist Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {Object.entries(CHECKLIST_ITEMS).map(([key, label]) => (
                                                        <div 
                                                            key={key} 
                                                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                                                                record.qcChecks[key] 
                                                                    ? 'bg-green-50 border-green-300' 
                                                                    : 'bg-white border-gray-200 hover:bg-blue-100'
                                                            } ${isLocked ? 'opacity-70' : ''}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={record.qcChecks[key]} 
                                                                onChange={() => handleCheckChange(key)}
                                                                id={`${record.imeiNo}-${key}`} 
                                                                disabled={isLocked} // Disabled if locked
                                                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                            <label 
                                                                htmlFor={`${record.imeiNo}-${key}`} 
                                                                className="text-sm text-gray-700 font-medium cursor-pointer select-none"
                                                            >
                                                                {label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* QC Submit Button / Locked Status Message */}
                                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                                {isLocked ? (
                                                    <div className="text-lg font-bold text-green-700 bg-green-100 p-3 rounded-lg flex items-center gap-2">
                                                        <Lock size={20} /> QC Submission Complete. Report is Finalized.
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleQcSubmit}
                                                        className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 font-semibold transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                        disabled={!recordChecksComplete || isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send size={20} /> Submit QC Results (PASS)
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )})}

                        {/* Message for no records found */}
                        {filteredImeiRecords.length === 0 && !loadingFirmware && (
                             <div className="text-center p-4 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                                {imeiFilter ? `No IMEI records found matching "${imeiFilter}".` : 'No IMEI records found.'}
                             </div>
                        )}
                        {imeiRecords.length === 0 && !loadingFirmware && !imeiFilter && (
                             <div className="text-center p-4 bg-red-100 text-red-700 rounded-md font-medium">
                                No IMEI records found. Check API or Token.
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Detail Display (Refined Card UI)
const DetailCard = ({ label, value, status, icon: Icon }) => {
    // Determine color based on boolean 'status' prop (true = success/green, false = fail/red)
    const statusBg = status === true ? 'bg-green-100 border-green-400' : 
                     status === false ? 'bg-red-100 border-red-400' : 'bg-gray-100 border-gray-300';
    
    const statusText = status === true ? 'text-green-800' : 
                       status === false ? 'text-red-800' : 'text-gray-800';
    
    const statusIconColor = status === true ? 'text-green-600' : 
                            status === false ? 'text-red-600' : 'text-blue-600';

    return (
        <div className={`p-3 rounded-lg border ${statusBg} shadow-sm`}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 font-medium uppercase">{label}</span>
                {Icon && <Icon size={14} className={statusIconColor} />}
            </div>
            <p className={`text-md font-bold ${statusText}`}>
                {value || 'N/A'}
            </p>
        </div>
    );
};

export default QCProbeWorkstation;
