import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  BatteryCharging,
  ChevronDown,
  XCircle,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Zap, // Added Zap icon for the main header
  RefreshCw, // Added RefreshCw for loading spinner
} from "lucide-react";
import { toast } from "react-toastify";

// --- Global Constants & API Endpoints ---
const CHECKPOINTS = [
    '+12v', 'GND (SL No. 2)', 'IGNITION', 'DIN1', 'DIN2', 'SCS', 'LED',
    '4V_SOS', 'AN1', 'AN2', 'DIN3', 'OP2', 'GND (SL No. 13)', 'OP1',
    'TX', 'RX', 'GND (SL No. 17)'
];
const TOTAL_CHECKS = CHECKPOINTS.length;
const MARK_SOLDERING_COMPLETE_API = "https://vanaras.onrender.com/api/v1/superadmin/addSolderingDetails";
const VERIFY_IMEI_AGAIN_API = "https://vanaras.onrender.com/api/v1/superadmin/veriFyImeiNoAgain";
const FETCH_IMEI_LIST_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllBarCodeIMEINo";


// ----------------------------------------------------------------------
// ## 1. Task UI Component: IndividualChecklist (The Form)
// ----------------------------------------------------------------------
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
            toast.success(` successful and details saved for IMEI ${imeiEntry.imeiNo}.`, { position: 'top-center' });

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
                    {isCompletedLocally ? ' Passed' : allChecked ? 'Deselect All' : 'Select All Points'}
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
// ## 2. Main Component: SolderingChecklist
// ----------------------------------------------------------------------
const SolderingChecklist = ({ assignment }) => {
    const [imeiData, setImeiData] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [activeImeiId, setActiveImeiId] = useState(null); // The currently open accordion item
    const [completedIds, setCompletedIds] = useState(new Set());
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [unlockedImeiId, setUnlockedImeiId] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);

    // >>> NEW STATE FOR FILTERING <<<
    const [filterImei, setFilterImei] = useState(''); 

    // API endpoints (repeated for clarity/scope)
    const FETCH_IMEI_LIST_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllBarCodeIMEINo";
    const VERIFY_IMEI_AGAIN_API = "https://vanaras.onrender.com/api/v1/superadmin/veriFyImeiNoAgain";


    const fetchIMEIList = async () => {
        setListLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(FETCH_IMEI_LIST_API, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch IMEI list: ${response.status}`);
            }

            const data = await response.json();

            const allImeis = data.allBarCodeIMEINo || data.allBarCode || [];
            let firstOpenId = null;

            const fetchedImeis = allImeis.map(imei => {
                const isComplete = imei.solderingStatus === true;

                if (imei.status_ONE === true && !isComplete && !firstOpenId) {
                    firstOpenId = imei._id;
                }

                return {
                    ...imei,
                    assignmentId: assignment.id,
                    isComplete: isComplete, 
                    hasStatusOne: imei.status_ONE === true, 
                };
            });

            setImeiData(fetchedImeis);

            if (firstOpenId) {
                setActiveImeiId(firstOpenId);
                setUnlockedImeiId(firstOpenId);
            }

        } catch (error) {
            console.error("Error fetching IMEI list:", error);
            toast.error("Failed to load IMEI list history.", { position: "bottom-center" });
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchIMEIList();
    }, [refreshTrigger, completedIds]);

    const handleImeiComplete = (imeiId) => {
        setUnlockedImeiId(null);
        setActiveImeiId(null);
        setRefreshTrigger(prev => prev + 1);
    };

    // --- Verification Click Logic ---
    const handleVerificationClick = async (imeiEntry) => {
        if (imeiEntry.isComplete) {
            toast.warn(`IMEI ${imeiEntry.imeiNo} is already completed.`, { position: "top-center" });
            return;
        }

        if (imeiEntry.hasStatusOne) {
            toast.info(`IMEI ${imeiEntry.imeiNo} is ready. Opening checklist.`, { position: "top-center" });
            setUnlockedImeiId(imeiEntry._id);
            setActiveImeiId(imeiEntry._id);
            return;
        }

        setVerifyingId(imeiEntry._id);
        const token = localStorage.getItem("token");

        try {
            const payload = { imeiNo: imeiEntry.imeiNo };
            const response = await fetch(VERIFY_IMEI_AGAIN_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const errorMessage = data.message || `Verification failed for ${imeiEntry.imeiNo}.`;
                throw new Error(errorMessage);
            }

            toast.success(`IMEI ${imeiEntry.imeiNo} verified. Checklist unlocked.`, { position: "top-center" });
            setUnlockedImeiId(imeiEntry._id);
            setActiveImeiId(imeiEntry._id);
            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error("Error during IMEI verification:", error);
            toast.error(`Verification Failed: ${error.message}`, { position: "top-center" });
            setUnlockedImeiId(null);
        } finally {
            setVerifyingId(null);
        }
    };
    // -------------------------------

    const isImeiAccessible = (imeiId) => {
        return imeiData.find(i => i._id === imeiId)?.hasStatusOne || imeiId === unlockedImeiId;
    };

    const handleAccordionToggle = (imeiId) => {
        const imei = imeiData.find(i => i._id === imeiId);
        if (imei.isComplete || isImeiAccessible(imeiId)) {
            setActiveImeiId(activeImeiId === imeiId ? null : imeiId);
        }
    };

    // >>> FILTERING LOGIC <<<
    const handleFilterChange = (e) => {
        // 1. Strip non-digits
        const value = e.target.value.replace(/[^0-9]/g, ''); 
        // 2. Limit to 15 digits
        setFilterImei(value.slice(0, 15)); 
        // Optionally close the accordion when filtering starts
        if (value.length > 0) {
            setActiveImeiId(null);
        }
    };

    // Filter the data based on the current input value
    const filteredImeis = imeiData.filter(imei => 
        imei.imeiNo && imei.imeiNo.includes(filterImei)
    );
    // >>> END FILTERING LOGIC <<<

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-red-600 to-orange-700 text-white p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Zap size={28} />
                        Soldering Workstation
                    </h3>
                    <p className="text-red-100 mt-2">17-Point QC for multiple units assigned to this task.</p>
                </div>

                <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">

                    <h4 className="text-xl font-bold text-gray-700">Units Requiring Verification</h4>
                    
                    {/* NEW: IMEI Filter Input Field */}
                    <div className="mb-6">
                        <label htmlFor="imei-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by **IMEI Number** (15 Digits) 🔎
                        </label>
                        <input
                            type="text"
                            id="imei-filter"
                            value={filterImei}
                            onChange={handleFilterChange}
                            placeholder="Enter 15-digit IMEI"
                            maxLength={15}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150"
                        />
                    </div>
                    {/* END NEW IMEI Filter Input Field */}


                    {listLoading ? (
                        <div className="text-center py-10">Loading IMEI list...</div>
                    ) : filteredImeis.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {filterImei ? `No IMEI found matching "${filterImei}".` : 'No units found requiring soldering for this assignment.'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredImeis.map((imeiEntry) => { // MAP OVER FILTERED DATA
                                const isCompleted = imeiEntry.isComplete;
                                const hasStatusOne = imeiEntry.hasStatusOne;
                                const isUnlocked = isImeiAccessible(imeiEntry._id);
                                const isActive = imeiEntry._id === activeImeiId;
                                const isProcessing = verifyingId === imeiEntry._id;
                                const isButtonDisabled = isProcessing || isCompleted;

                                return (
                                    <div key={imeiEntry._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Accordion Header */}
                                        <div
                                            className={`w-full flex justify-between items-center p-3 text-left transition-all duration-300 
                                            ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-50'}`}
                                        >

                                            <div className="flex items-center gap-3">
                                                {isCompleted ? <CheckCircle size={20} className="text-green-700" /> : <Clock size={20} className="text-gray-500" />}
                                                <span className="font-mono text-lg text-gray-800">{imeiEntry.imeiNo}</span>
                                            </div>

                                            {/* Action Button / Status Display */}
                                            <div>
                                                {isCompleted ? (
                                                    <span className="font-bold text-green-700"> Passed</span>
                                                ) : isUnlocked || hasStatusOne ? (
                                                    <button
                                                        onClick={() => handleAccordionToggle(imeiEntry._id)}
                                                        className={`px-4 py-1 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                                                    >
                                                        {isActive ? 'Hide Checklist' : 'Show Checklist'}
                                                        <ChevronDown size={18} className={`inline ml-2 transform transition-transform ${isActive ? 'rotate-180' : 'rotate-0'}`} />
                                                    </button>
                                                ) : (
                                                    // Verify Button (Only shown if status_ONE is false)
                                                    <button
                                                        onClick={() => handleVerificationClick(imeiEntry)}
                                                        className="px-4 py-1 text-sm bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                                                        disabled={isButtonDisabled}
                                                    >
                                                        {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : 'Verify & Start'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Accordion Content */}
                                        {isActive && (isUnlocked || hasStatusOne) && !isCompleted && (
                                            <IndividualChecklist
                                                imeiEntry={imeiEntry}
                                                onStatusChange={handleImeiComplete}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolderingChecklist;