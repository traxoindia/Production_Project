import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, Package, CheckCircle, Clock, BatteryCharging, Printer, X, Plus, Zap, Cpu, Send, User, ChevronDown, Battery } from 'lucide-react';
import Navbar3 from './Navbar3';
import { toast } from 'react-toastify'; // Use standard toast
// Inside Work.jsx imports
import BatteryConnectionWorkstation from './BatteryConnectionWorkstation'; // Adjust path as needed
import SolderingChecklist from './SolderingChecklist';
import FirmwareUpdateWorkstation from './FirmwareUpdateWorkstation';
import PrintStickerForm from './StickerApp'
import QCProbeWorkstation from './QCProbeWorkstation';
// --- API Endpoint ---
const FETCH_EMPLOYEE_WORK_LIST_API = "https://vanaras.onrender.com/api/v1/superadmin/FetchLoginEmployeeWorkList";

// --- Constants ---
const WORK_TITLE_OPTIONS = [
    'Add Barcode',
    'Soldering',
    'Battery connection & Capacitor & add battery',
    'Frimware update',
    'QC check',
    'Print Sticker'
];

// Helper to generate Batch/Lot numbers based on the current date
const generateDateCode = () => {
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    return `BATCH-${dateString}`;
};

// NOTE: These helper functions must be defined outside the component (usually in Work.jsx)
// Utility to format date as DDMMYYYY
const formatDateDDMMYYYY = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}${month}${year}`; // DDMMYYYY
};

// Utility to generate running numeric code like VLT000001
const generateVLTCode = (num = 1) => {
    return `VLT${String(num).padStart(6, '0')}`;
};

// Generate LOT NO
const generateLotCode = (counter = 1) => {
    const dateString = formatDateDDMMYYYY();
    const vltCode = generateVLTCode(counter);
    return `TIA/LOT/${dateString}/${vltCode}`;
};

// Generate BATCH NO
const generateBatchCode = (counter = 1) => {
    const dateString = formatDateDDMMYYYY();
    const vltCode = generateVLTCode(counter);
    return `TIA/BATCH/${dateString}/${vltCode}`;
};

// --- API Endpoints ---
const ADD_BARCODE_API = "https://vanaras.onrender.com/api/v1/superadmin/addBarCode";
const FETCH_IMEI_LIST_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllBarCodeIMEINo";
// --------------------

// ----------------------------------------------------------------------
// ## 1. Task UI Component: Add Barcode
// ----------------------------------------------------------------------
const AddBarcodeForm = ({ assignment }) => {
    // State for form fields
    const [batchNo, setBatchNo] = useState(generateBatchCode());
    const [lotNo, setLotNo] = useState(generateLotCode());
    const [imeiNo, setImeiNo] = useState('');

    // State for loading/data
    const [isLoading, setIsLoading] = useState(false);
    const [imeiList, setImeiList] = useState([]); // State for fetched IMEI list
    const [listLoading, setListLoading] = useState(true);
    const [listRefreshTrigger, setListRefreshTrigger] = useState(0); // For refreshing the list

    // Re-generate Batch/Lot codes on mount (to set the starting state)
    useEffect(() => {
        setBatchNo(generateBatchCode());
        setLotNo(generateLotCode());
        // Fetch IMEI list on mount and refresh trigger change
        fetchIMEIList();
    }, [listRefreshTrigger]);


    // --- New: Fetch IMEI List Function ---
    const fetchIMEIList = async () => {
        setListLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Token missing for IMEI list fetch.");
            setListLoading(false);
            return;
        }

        try {
            const response = await fetch(FETCH_IMEI_LIST_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch IMEI list: ${response.status}`);
            }

            const data = await response.json();
            // Assuming the list is returned under 'allBarCodeIMEINo' or 'allBarCode'
            const fetchedList = data.allBarCodeIMEINo || data.allBarCode || [];

            setImeiList(fetchedList);

        } catch (error) {
            console.error("Error fetching IMEI list:", error);
            toast.error("Failed to load IMEI list history.", { position: "bottom-center" });
        } finally {
            setListLoading(false);
        }
    };
    // ------------------------------------


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imeiNo.trim()) {
            toast.error('Please enter the IMEI NO.', { position: "bottom-center" });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            const payload = {
                batchNo: batchNo,
                lotNo: lotNo,
                imeiNo: imeiNo.trim()
            };

            const response = await fetch(ADD_BARCODE_API, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage = data.message || `Failed to save barcode data. Status: ${response.status}`;
                throw new Error(errorMessage);
            }

            toast.success(`Barcode data saved successfully for IMEI: ${imeiNo.trim()}`, { position: "top-center" });
            alert(`Barcode added Successfully:${imeiNo.trim()}`)

            // Clear input and refresh the list
            setImeiNo('');
            setListRefreshTrigger(prev => prev + 1); // Trigger useEffect to fetch new list

        } catch (error) {
            console.error("Error saving barcode data:", error);
            toast.error(`Error: ${error.message || "Could not save barcode data."}`, { position: "bottom-center" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-0 sm:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* LEFT COLUMN: Barcode Entry Form (Takes 2/3 width) */}
                <div className="lg:col-span-2">

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-inner space-y-6">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <p className="text-sm text-yellow-800 flex items-center gap-2 font-semibold">
                                <Clock size={16} />
                                **Batch No** (Daily Static) | **Lot No** (Unique per session)
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Batch No */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                                <input
                                    type="text"
                                    value={batchNo}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-not-allowed font-mono text-lg"
                                />
                            </div>

                            {/* Lot No */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Lot Number</label>
                                <input
                                    type="text"
                                    value={lotNo}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-not-allowed font-mono text-lg"
                                />
                            </div>
                        </div>

                        {/* IMEI INPUT SECTION */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                IMEI NO <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={imeiNo}
                                // MODIFICATION HERE: Process the input before setting the state
                                onChange={(e) => {
                                    const rawInput = e.target.value.trim();
                                    // Truncate the input to a maximum of 15 characters
                                    // This is especially useful for handling long strings from a scanner.
                                    const truncatedImei = rawInput.substring(0, 15);
                                    setImeiNo(truncatedImei);
                                }}
                                placeholder="Enter 15-digit IMEI number"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-4 border-t">
                            <button
                                type="button"
                                onClick={() => { setImeiNo(''); }}
                                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                                disabled={isLoading}
                            >
                                Clear IMEI
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : <><Plus size={20} /> Save Barcode Data</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: Saved IMEI List (Takes 1/3 width) */}
                {/* RIGHT COLUMN: Saved IMEI List (Takes 1/3 width) */}
                <div className="lg:col-span-1 bg-white shadow-xl rounded-xl flex flex-col h-[600px] border border-gray-200">
                    <div className="bg-gray-100 p-4 rounded-t-xl border-b flex justify-between items-center">
                        <div>
                            <h4 className="text-lg font-bold text-gray-700">IMEI History</h4>
                            <p className="text-xs text-gray-500">{imeiList.length} Total Records</p>
                        </div>
                        <button
                            onClick={() => setListRefreshTrigger(prev => prev + 1)}
                            disabled={listLoading}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <RefreshCw size={18} className={`${listLoading ? "animate-spin text-indigo-500" : "text-gray-600"}`} />
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-grow custom-scrollbar">
                        {listLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                                <RefreshCw size={24} className="animate-spin text-blue-500" />
                                <p className="text-gray-500 text-sm">Fetching records...</p>
                            </div>
                        ) : imeiList && imeiList.length > 0 ? (
                            <ul className="space-y-3">
                                {/* We reverse it to show the most recent entry at the top */}
                                {[...imeiList].reverse().map((item, index) => (
                                    <li
                                        key={item._id || index}
                                        className="p-3 bg-white border-l-4 border-l-green-500 border-gray-200 border rounded-r-lg shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                                IMEI Number
                                            </span>
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                                #{imeiList.length - index}
                                            </span>
                                        </div>
                                        <p className="font-mono font-bold text-gray-800 text-base mb-2">
                                            {item.imeiNo || "N/A"}
                                        </p>
                                        <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-500 border-t pt-2">
                                            <div className="flex justify-between">
                                                <span>Batch:</span>
                                                <span className="font-medium text-gray-700">{item.batchNo || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Lot:</span>
                                                <span className="font-medium text-gray-700">{item.lotNo || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="bg-gray-50 p-4 rounded-full mb-2">
                                    <Plus size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No IMEIs found</p>
                                <p className="text-xs text-gray-400">New entries will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// ## 2. Task UI Component: Soldering
// ----------------------------------------------------------------------

const CHECKPOINTS = [
    '+12v', 'GND (SL No. 2)', 'IGNITION', 'DIN1', 'DIN2', 'SCS', 'LED',
    '4V_SOS', 'AN1', 'AN2', 'DIN3', 'OP2', 'GND (SL No. 13)', 'OP1',
    'TX', 'RX', 'GND (SL No. 17)'
];
const TOTAL_CHECKS = CHECKPOINTS.length;
const MARK_SOLDERING_COMPLETE_API = "https://vanaras.onrender.com/api/v1/superadmin/addSolderingDetails";

const IndividualChecklist = ({ imeiEntry, onStatusChange }) => {
    // State to hold the checklist data (17 booleans)
    const [checklist, setChecklist] = useState(Array(TOTAL_CHECKS).fill(false));
    const [isSaving, setIsSaving] = useState(false);

    // Check initial completion status from the parent data
    const [isCompletedLocally, setIsCompletedLocally] = useState(imeiEntry.isComplete);

    const completedCount = checklist.filter(Boolean).length;
    const allChecked = completedCount === TOTAL_CHECKS;

    // Helper to map checklist array index to the required API key
    const getApiKey = (index) => {
        const apiKeys = [
            'plus12v', 'gnd2', 'ignition', 'din1', 'din2', 'scs', 'led',
            'sos4v', 'an1', 'an2', 'din3', 'op2', 'gnd13', 'op1',
            'tx', 'rx', 'gnd17'
        ];
        return apiKeys[index];
    };

    const handleCheck = (index) => {
        if (isSaving || isCompletedLocally) return;
        const newChecklist = [...checklist];
        newChecklist[index] = !newChecklist[index];
        setChecklist(newChecklist);
    };

    // --- Select All Function ---
    const handleSelectAll = () => {
        if (isSaving || isCompletedLocally) return;
        const areAllChecked = checklist.every(Boolean);
        setChecklist(Array(TOTAL_CHECKS).fill(!areAllChecked));
    };
    // -----------------------------


    const handleComplete = async () => {
        if (!allChecked) return;
        setIsSaving(true);
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Authentication token is missing.", { position: 'bottom-right' });
            setIsSaving(false);
            return;
        }

        try {
            // 1. Submit the detailed soldering checks (addSolderingDetails)
            const detailsPayload = {
                barcodeImeiId: imeiEntry._id,
            };
            checklist.forEach((isChecked, index) => {
                const key = getApiKey(index);
                detailsPayload[key] = isChecked;
            });

            const detailsResponse = await fetch(MARK_SOLDERING_COMPLETE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(detailsPayload),
            });

            const detailsData = await detailsResponse.json();

            if (!detailsResponse.ok || !detailsData.success) {
                const errorMessage = detailsData.message || 'Failed to submit detailed soldering checks.';
                throw new Error(errorMessage);
            }

            // 2. SUCCESS LOGIC
            toast.success(`QC successful and details saved for IMEI ${imeiEntry.imeiNo}.`, { position: 'top-center' });

            // 3. Disable UI locally and notify parent
            setIsCompletedLocally(true);
            onStatusChange(imeiEntry._id); // Notifies parent (SolderingChecklist) to refresh the accordion list

        } catch (error) {
            console.error("Error submitting soldering details:", error);
            toast.error(`Submission failed: ${error.message}`, { position: 'bottom-right' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 bg-white border-t border-red-200">

            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className={`text-sm font-bold ${allChecked ? 'text-green-600' : 'text-orange-600'}`}>
                        {completedCount}/{TOTAL_CHECKS} Complete
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${allChecked ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${(completedCount / TOTAL_CHECKS) * 100}%` }}
                    />
                </div>
            </div>

            {/* Select All Button Section */}
            <div className="flex justify-end mb-3">
                <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 
                        ${isCompletedLocally
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : allChecked
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    disabled={isCompletedLocally || isSaving}
                >
                    {isCompletedLocally ? 'QC Passed' : allChecked ? 'Deselect All' : 'Select All Points'}
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                {CHECKPOINTS.map((label, index) => (
                    <div key={index} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs hover:bg-gray-100">
                        <input
                            type="checkbox"
                            checked={checklist[index]}
                            onChange={() => handleCheck(index)}
                            id={`check-${imeiEntry.imeiNo}-${index}`}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            disabled={isSaving || isCompletedLocally}
                        />
                        <label htmlFor={`check-${imeiEntry.imeiNo}-${index}`} className="text-gray-700 font-medium cursor-pointer flex-1">
                            {label}
                        </label>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-end">
                {isCompletedLocally ? (
                    <span className="px-6 py-2 text-sm font-bold text-green-700 border border-green-300 rounded-lg">
                        Successfully Completed
                    </span>
                ) : (
                    <button
                        onClick={handleComplete}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition"
                        disabled={isSaving || !allChecked}
                    >
                        {isSaving ? 'Submitting...' : <><CheckCircle size={18} /> Finish Soldering</>}
                    </button>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// ## 4. Firmware Update
// ----------------------------------------------------------------------
const FirmwareUpdateForm = ({ assignment }) => {
    const [currentVersion, setCurrentVersion] = useState('');
    const [targetVersion, setTargetVersion] = useState('');
    const [updateStatus, setUpdateStatus] = useState('idle'); // idle, uploading, verifying, complete
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!currentVersion || !targetVersion) {
            alert('Please enter both version numbers');
            return;
        }

        setIsLoading(true);
        setUpdateStatus('uploading');
        setProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUpdateStatus('verifying');
                    setTimeout(() => {
                        setUpdateStatus('complete');
                        setIsLoading(false);
                        alert('Firmware updated successfully!');
                    }, 2000);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Cpu size={28} />
                        Firmware Update System
                    </h3>
                    <p className="text-purple-100 mt-2">Device software upgrade management</p>
                </div>

                <form onSubmit={handleUpdate} className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Firmware Version <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={currentVersion}
                                onChange={(e) => setCurrentVersion(e.target.value)}
                                placeholder="e.g., v1.2.3"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Firmware Version <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={targetVersion}
                                onChange={(e) => setTargetVersion(e.target.value)}
                                placeholder="e.g., v2.0.0"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {updateStatus !== 'idle' && (
                        <div className="bg-purple-50 border-2 border-purple-200 p-5 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    {updateStatus === 'uploading' && 'Uploading Firmware...'}
                                    {updateStatus === 'verifying' && 'Verifying Update...'}
                                    {updateStatus === 'complete' && 'Update Complete!'}
                                </span>
                                <span className="text-sm font-bold text-purple-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-sm text-yellow-800">
                            ⚠ Ensure device is connected and has sufficient power before updating
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : <><Cpu size={20} /> Start Firmware Update</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// ## 5. QC Check
// ----------------------------------------------------------------------
// const QCCheckForm = ({ assignment }) => {
//     const [qcChecks, setQCChecks] = useState({
//         visualInspection: false,
//         functionalTest: false,
//         dimensionalCheck: false,
//         electricalTest: false,
//         safetyCompliance: false,
//         packagingCheck: false
//     });
//     const [defectsFound, setDefectsFound] = useState('');
//     const [qcNotes, setQCNotes] = useState('');
//     const [passFail, setPassFail] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     const handleCheckChange = (key) => {
//         setQCChecks(prev => ({ ...prev, [key]: !prev[key] }));
//     };

//     const allChecksComplete = Object.values(qcChecks).every(Boolean);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!allChecksComplete || !passFail) {
//             alert('Please complete all checks and mark Pass/Fail');
//             return;
//         }
//         setIsLoading(true);
//         console.log("QC Check Data:", { qcChecks, defectsFound, qcNotes, passFail });

//         setTimeout(() => {
//             alert('QC check completed successfully!');
//             setIsLoading(false);
//         }, 1500);
//     };

//     return (
//         <div className="p-4 sm:p-8">
//             <div className="max-w-3xl mx-auto">
//                 <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-2xl">
//                     <h3 className="text-2xl font-bold flex items-center gap-3">
//                         <CheckCircle size={28} />
//                         Quality Control Inspection
//                     </h3>
//                     <p className="text-cyan-100 mt-2">Final product quality assurance verification</p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
//                     <div className="bg-cyan-50 border-2 border-cyan-200 p-5 rounded-xl">
//                         <h4 className="font-semibold text-gray-800 mb-4">QC Inspection Checklist</h4>
//                         <div className="space-y-3">
//                             {Object.entries({
//                                 visualInspection: 'Visual Inspection (No scratches/damages)',
//                                 functionalTest: 'Functional Testing (All features working)',
//                                 dimensionalCheck: 'Dimensional Accuracy Check',
//                                 electricalTest: 'Electrical Performance Test',
//                                 safetyCompliance: 'Safety Standards Compliance',
//                                 packagingCheck: 'Packaging & Labeling Verification'
//                             }).map(([key, label]) => (
//                                 <div key={key} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-cyan-200">
//                                     <input
//                                         type="checkbox"
//                                         checked={qcChecks[key]}
//                                         onChange={() => handleCheckChange(key)}
//                                         id={key}
//                                         className="h-5 w-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
//                                     />
//                                     <label htmlFor={key} className="text-sm text-gray-700 font-medium cursor-pointer">
//                                         {label}
//                                     </label>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Defects Found (if any)
//                         </label>
//                         <textarea
//                             value={defectsFound}
//                             onChange={(e) => setDefectsFound(e.target.value)}
//                             placeholder="List any defects or issues found..."
//                             rows="3"
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             QC Inspector Notes
//                         </label>
//                         <textarea
//                             value={qcNotes}
//                             onChange={(e) => setQCNotes(e.target.value)}
//                             placeholder="Additional observations or comments..."
//                             rows="3"
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Final QC Result <span className="text-red-500">*</span>
//                         </label>
//                         <div className="flex gap-4">
//                             <label className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition"
//                                 style={{ borderColor: passFail === 'pass' ? '#10b981' : '#d1d5db', backgroundColor: passFail === 'pass' ? '#ecfdf5' : 'white' }}>
//                                 <input
//                                     type="radio"
//                                     name="passFail"
//                                     value="pass"
//                                     checked={passFail === 'pass'}
//                                     onChange={(e) => setPassFail(e.target.value)}
//                                     className="h-4 w-4 text-green-600"
//                                 />
//                                 <span className="font-semibold text-green-700">PASS ✓</span>
//                             </label>
//                             <label className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition"
//                                 style={{ borderColor: passFail === 'fail' ? '#ef4444' : '#d1d5db', backgroundColor: passFail === 'fail' ? '#fef2f2' : 'white' }}>
//                                 <input
//                                     type="radio"
//                                     name="passFail"
//                                     value="fail"
//                                     checked={passFail === 'fail'}
//                                     onChange={(e) => setPassFail(e.target.value)}
//                                     className="h-4 w-4 text-red-600"
//                                 />
//                                 <span className="font-semibold text-red-700">FAIL ✗</span>
//                             </label>
//                         </div>
//                     </div>

//                     <div className="pt-4 flex justify-end">
//                         <button
//                             type="submit"
//                             className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
//                             disabled={isLoading || !allChecksComplete || !passFail}
//                         >
//                             {isLoading ? 'Saving...' : <><CheckCircle size={20} /> Submit QC Report</>}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// ----------------------------------------------------------------------
// ## 6. Print Sticker
// ----------------------------------------------------------------------
// const PrintStickerForm = ({ assignment }) => {
//     const [stickerType, setStickerType] = useState('');
//     const [quantity, setQuantity] = useState('');
//     const [batchRef, setBatchRef] = useState(generateDateCode());
//     const [printQuality, setPrintQuality] = useState('high');
//     const [isPrinting, setIsPrinting] = useState(false);
//     const [printProgress, setPrintProgress] = useState(0);

//     const handlePrint = (e) => {
//         e.preventDefault();
//         if (!stickerType || !quantity) {
//             alert('Please fill in all required fields');
//             return;
//         }

//         setIsPrinting(true);
//         setPrintProgress(0);

//         const interval = setInterval(() => {
//             setPrintProgress(prev => {
//                 if (prev >= 100) {
//                     clearInterval(interval);
//                     setIsPrinting(false);
//                     alert(`Successfully printed ${quantity} stickers!`);
//                     return 100;
//                 }
//                 return prev + 20;
//             });
//         }, 400);
//     };

//     return (
//         <div className="p-4 sm:p-8">
//             <div className="max-w-3xl mx-auto">
//                 <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
//                     <h3 className="text-2xl font-bold flex items-center gap-3">
//                         <Printer size={28} />
//                         Label & Sticker Printing System
//                     </h3>
//                     <p className="text-indigo-100 mt-2">Product labeling and identification</p>
//                 </div>

//                 <form onSubmit={handlePrint} className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
//                     <div className="grid md:grid-cols-2 gap-6">
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Sticker Type <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 value={stickerType}
//                                 onChange={(e) => setStickerType(e.target.value)}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
//                                 required
//                             >
//                                 <option value="">Select sticker type</option>
//                                 <option value="barcode">Barcode Label</option>
//                                 <option value="qr">QR Code Label</option>
//                                 <option value="product">Product Information</option>
//                                 <option value="warning">Warning Label</option>
//                                 <option value="serial">Serial Number</option>
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Quantity <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="number"
//                                 min="1"
//                                 value={quantity}
//                                 onChange={(e) => setQuantity(e.target.value)}
//                                 placeholder="Number of stickers"
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Batch Reference <span className="text-blue-500">(Auto-generated)</span>
//                         </label>
//                         <input
//                             type="text"
//                             value={batchRef}
//                             disabled
//                             className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-not-allowed font-mono"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Print Quality
//                         </label>
//                         <div className="flex gap-4">
//                             {['standard', 'high', 'premium'].map((quality) => (
//                                 <label key={quality} className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
//                                     style={{ borderColor: printQuality === quality ? '#6366f1' : '#d1d5db', backgroundColor: printQuality === quality ? '#eef2ff' : 'white' }}>
//                                     <input
//                                         type="radio"
//                                         name="printQuality"
//                                         value={quality}
//                                         checked={printQuality === quality}
//                                         onChange={(e) => setPrintQuality(e.target.value)}
//                                         className="h-4 w-4 text-indigo-600"
//                                     />
//                                     <span className="text-sm font-medium capitalize">{quality}</span>
//                                 </label>
//                             ))}
//                         </div>
//                     </div>

//                     {isPrinting && (
//                         <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-xl">
//                             <div className="flex justify-between items-center mb-2">
//                                 <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                                     <Printer size={16} className="animate-pulse" />
//                                     Printing in progress...
//                                 </span>
//                                 <span className="text-sm font-bold text-indigo-600">{printProgress}%</span>
//                             </div>
//                             <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                                 <div
//                                     className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
//                                     style={{ width: `${printProgress}%` }}
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     <div className="pt-4 flex justify-end gap-4">
//                         <button
//                             type="button"
//                             className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
//                             onClick={() => {
//                                 setStickerType('');
//                                 setQuantity('');
//                                 setPrintQuality('high');
//                             }}
//                         >
//                             Reset Form
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
//                             disabled={isPrinting}
//                         >
//                             {isPrinting ? 'Printing...' : <><Printer size={20} /> Start Printing</>}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// ----------------------------------------------------------------------
// ## Main Render Logic
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// ## Main Work Component
// ----------------------------------------------------------------------
function Work() {
    const [employeeData, setEmployeeData] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const fetchWorkList = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(FETCH_EMPLOYEE_WORK_LIST_API, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch work list: ${response.status}`);
            }

            const data = await response.json();

            // --- Correct handling of new response structure ---
            if (data.emp) {
                setEmployeeData(data.emp);

                if (Array.isArray(data.emp.assignWork)) {
                    const fetchedAssignments = data.emp.assignWork.map((assignment) => ({
                        id: assignment._id,
                        taskTitle: assignment.workTitel || "No Title",
                        task: assignment.workDescription || "No Description",
                        assignedDate: new Date(assignment.createdAt).toLocaleDateString(),
                        status: assignment.status ? "Completed" : "",
                    }));

                    setAssignments(fetchedAssignments);

                    // Select first pending OR first assignment
                    const pendingAssignment = fetchedAssignments.find(a => a.status === "");
                    setSelectedAssignment(pendingAssignment || fetchedAssignments[0]);
                } else {
                    setAssignments([]);
                    setSelectedAssignment(null);
                }

            } else {
                setEmployeeData(null);
                setAssignments([]);
                setSelectedAssignment(null);
            }

        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error(`Error loading work list: ${error.message}`, {
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchWorkList();
    }, [refreshTrigger]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Work To Complete': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    

    const getTaskIcon = (taskTitle) => {
        switch (taskTitle) {
            case 'Add Barcode': return <Package size={18} />;
            case 'Soldering': return <Zap size={18} />;
            case 'Battery connection & Capacitor & add battery': return <BatteryCharging size={18} />;
            case 'Frimware update': return <Cpu size={18} />;
            case 'QC check': return <CheckCircle size={18} />;
            case 'Print Sticker': return <Printer size={18} />;
            default: return <ClipboardList size={18} />;
        }
    };

    const employeeName = employeeData?.empName || 'Employee';

    const renderAssignmentUI = (assignment) => {


        switch (assignment.taskTitle) {

            case 'Add Barcode':
                return <AddBarcodeForm assignment={assignment} />;
            case 'Soldering':
                return <SolderingChecklist assignment={assignment} />;
            case 'Battery connection & Capacitor & add battery':
                return <BatteryConnectionWorkstation assignment={assignment} />;;
            case 'Frimware update':
                return <FirmwareUpdateWorkstation assignment={assignment} />;
            case 'QC check':
                return <QCProbeWorkstation assignment={assignment} currentEmployee={employeeName} />;
            case 'Print Sticker':
                return <PrintStickerForm assignment={assignment} />;
            default:
                return (
                    <div>

                        <div className="p-10 text-center">

                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
                                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Standard Task View</h3>
                                <p className="text-gray-500 mb-6">No custom UI defined for: "{assignment.taskTitle}"</p>
                                <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
                                    Mark as Completed
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Navbar3 />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header */}
                <header className="bg-white shadow-md border-b-2 border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                                        <ClipboardList size={32} className="text-white" />
                                    </div>
                                    {employeeName}'s Work Dashboard
                                </h1>
                                <p className="text-gray-600 mt-2">Manage and track your assigned tasks</p>
                            </div>

                            <button
                                onClick={() => setRefreshTrigger(prev => prev + 1)}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                                       font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition duration-150 shadow-lg"
                                disabled={isLoading}
                            >
                                <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                {isLoading ? 'Loading...' : 'Refresh List'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: Assignment List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden sticky top-8">
                                <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-5 text-white">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <ClipboardList size={24} />
                                        Assigned Tasks ({assignments.length})
                                    </h2>
                                </div>
                                <ul className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                                    {isLoading ? (
                                        <li className="p-6 text-center text-gray-500">
                                            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                                            Loading tasks...
                                        </li>
                                    ) : assignments.length > 0 ? (
                                        assignments.map((assignment) => (
                                            <li
                                                key={assignment.id}
                                                onClick={() => setSelectedAssignment(assignment)}
                                                className={`p-5 cursor-pointer transition-all duration-200 
                                                        ${selectedAssignment?.id === assignment.id
                                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-r-4 border-indigo-600 shadow-inner'
                                                        : 'hover:bg-gray-50 hover:shadow-sm'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`${selectedAssignment?.id === assignment.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                            {getTaskIcon(assignment.taskTitle)}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900">{assignment.taskTitle}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(assignment.status)}`}>
                                                        {assignment.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 ml-6">{assignment.task}</p>
                                                <p className="text-xs text-gray-400 mt-2 ml-6 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    Assigned: {assignment.assignedDate}
                                                </p>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-10 text-center text-gray-500">
                                            <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
                                            <p className="font-semibold">No tasks currently assigned</p>
                                            <p className="text-sm mt-1">Check back later for new assignments</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* RIGHT: Task Details & Forms */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden min-h-[600px]">
                                {selectedAssignment ? (
                                    <>
                                        {/* Header moved inside renderAssignmentUI to be part of the form's layout */}
                                        {renderAssignmentUI(selectedAssignment, employeeName)}
                                    </>
                                ) : (
                                    <div className="p-20 text-center text-gray-500">
                                        <ClipboardList size={64} className="mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-2xl font-bold text-gray-700 mb-2">Select a Task</h3>
                                        <p className="text-gray-500">Choose a task from the list to view details and begin work</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>




    );
}

export default Work;