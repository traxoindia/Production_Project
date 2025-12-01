import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, BatteryCharging, ChevronDown, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
// NOTE: Assuming Navbar3 and other icons (Plus, X, Briefcase, User, Users) are imported 
// and used in the application root, or they would need to be imported here if used in this file.

// --- API Endpoints (Constants) ---
const FETCH_IMEI_LIST_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchAllBarCodeIMEINo"; 
const VERIFY_IMEI_AGAIN_API = "https://vanaras.onrender.com/api/v1/superadmin/veriFyImeiNoAgain"; 
const MARK_BATTERY_COMPLETE_API = "https://vanaras.onrender.com/api/v1/superadmin/addBatteryDetails";


// ----------------------------------------------------------------------
// ## 1. Task UI Component: Battery Connection & Capacitor (The Form)
// ----------------------------------------------------------------------
const BatteryConnectionForm = ({ assignment, imeiEntry, onStatusChange }) => { 
    const [batteryType, setBatteryType] = useState('');
    const [voltage, setVoltage] = useState('');
    const [capacitorValue, setCapacitorValue] = useState('');
    const [connectionChecks, setConnectionChecks] = useState({
        polarity: false,
        isolation: false,
        capacitorPlacement: false,
        voltageTest: false
    });
    const [isLoading, setIsLoading] = useState(false);
    // Use imeiEntry's status for initial disabling
    const [isCompletedLocally, setIsCompletedLocally] = useState(imeiEntry.isComplete); 

    const handleCheckChange = (key) => {
        if (isCompletedLocally) return;
        setConnectionChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const allChecksComplete = Object.values(connectionChecks).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!batteryType || !voltage || !capacitorValue || !allChecksComplete) {
            toast.error('Please complete all fields and checks.', { position: 'bottom-right' });
            return;
        }
        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            // Construct Payload
            const payload = {
                barcodeImeiId: imeiEntry._id,
                batteryType,
                voltage: parseFloat(voltage), 
                capacitorValue: parseInt(capacitorValue),
                polarity: connectionChecks.polarity,
                isolation: connectionChecks.isolation,
                capacitorPlacement: connectionChecks.capacitorPlacement,
                voltageTest: connectionChecks.voltageTest
            };

            const response = await fetch(MARK_BATTERY_COMPLETE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to submit battery data.');
            }

            toast.success(`Battery/Capacitor data saved for IMEI ${imeiEntry.imeiNo}!`, { position: 'top-center' });

            setIsCompletedLocally(true);
            onStatusChange(imeiEntry._id); // Notify parent component to update list status

        } catch (error) {
            console.error("Battery Submission Error:", error);
            toast.error(`Submission failed: ${error.message}`, { position: 'bottom-right' });
        } finally {
            setIsLoading(false);
        }
    };

    const checkboxDisabled = isLoading || isCompletedLocally;

    return (
        <div className="p-4 bg-white border-t border-green-200">
            <form onSubmit={handleSubmit} className="bg-white p-4 space-y-6">
                <div className="grid md:grid-cols-2 gap-6" style={{ opacity: checkboxDisabled ? 0.6 : 1 }}>
                    {/* Battery Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Battery Type <span className="text-red-500">*</span></label>
                        <select
                            value={batteryType}
                            onChange={(e) => setBatteryType(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                            required
                            disabled={checkboxDisabled}
                        >
                            <option value="">Select battery type</option>
                            <option value="Li-Ion">Lithium-Ion</option>
                            <option value="Li-Po">Lithium-Polymer</option>
                            <option value="NiMH">Nickel-Metal Hydride</option>
                            <option value="Alkaline">Alkaline</option>
                        </select>
                    </div>

                    {/* Voltage (V) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Voltage (V) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            step="0.1"
                            value={voltage}
                            onChange={(e) => setVoltage(e.target.value)}
                            placeholder="e.g., 3.7"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                            required
                            disabled={checkboxDisabled}
                        />
                    </div>
                </div>

                {/* Capacitor Value */}
                <div style={{ opacity: checkboxDisabled ? 0.6 : 1 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Capacitor Value (µF) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        value={capacitorValue}
                        onChange={(e) => setCapacitorValue(e.target.value)}
                        placeholder="e.g., 100"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        required
                        disabled={checkboxDisabled}
                    />
                </div>

                {/* Verification Checklist */}
                <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-4">Safety Verification Checklist</h4>
                    <div className="space-y-3">
                        {Object.entries({
                            polarity: 'Battery Polarity Verified (+/-)',
                            isolation: 'Electrical Isolation Confirmed',
                            capacitorPlacement: 'Capacitor Correctly Positioned',
                            voltageTest: 'Voltage Output Tested'
                        }).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={connectionChecks[key]}
                                    onChange={() => handleCheckChange(key)}
                                    id={`${imeiEntry._id}-${key}`}
                                    className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    disabled={checkboxDisabled}
                                />
                                <label htmlFor={`${imeiEntry._id}-${key}`} className="text-sm text-gray-700 font-medium cursor-pointer">
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submission Button */}
                <div className="pt-4 flex justify-end">
                    {isCompletedLocally ? (
                        <span className="px-6 py-3 text-sm font-bold text-green-700 border border-green-300 rounded-lg">
                            Installation Complete
                        </span>
                    ) : (
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
                            disabled={isLoading || !allChecksComplete}
                        >
                            {isLoading ? 'Saving...' : <><CheckCircle size={20} /> Complete Installation</>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};


// ----------------------------------------------------------------------
// ## 2. Main Component: BatteryConnectionWorkstation
// ----------------------------------------------------------------------
const BatteryConnectionWorkstation = ({ assignment }) => {
    const [imeiData, setImeiData] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [activeImeiId, setActiveImeiId] = useState(null); 
    const [unlockedImeiId, setUnlockedImeiId] = useState(null); 
    const [verifyingId, setVerifyingId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

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
                // Determine completion status from the API response
                const isComplete = imei.batteryStatus === true; 
                // Determine readiness status (previous step completed: Soldering)
                const hasStatusOne = imei.solderingStatus === true; 

                if (hasStatusOne && !isComplete && !firstOpenId) {
                    firstOpenId = imei._id;
                }

                return {
                    ...imei,
                    assignmentId: assignment.id,
                    isComplete: isComplete, 
                    hasStatusOne: hasStatusOne, // Status from the *previous* step (Soldering)
                };
            }).filter(imei => imei.hasStatusOne || !imei.isComplete);

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
    }, [refreshTrigger]);

    const handleImeiComplete = (imeiId) => {
        setUnlockedImeiId(null);
        setActiveImeiId(null);
        setRefreshTrigger(prev => prev + 1);
    };

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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || `Verification failed for ${imeiEntry.imeiNo}.`);
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

    const isImeiAccessible = (imeiId) => {
        return imeiData.find(i => i._id === imeiId)?.hasStatusOne || imeiId === unlockedImeiId;
    };

    const handleAccordionToggle = (imeiId) => {
        const imei = imeiData.find(i => i._id === imeiId);
        if (imei.isComplete || isImeiAccessible(imeiId)) {
            setActiveImeiId(activeImeiId === imeiId ? null : imeiId);
        }
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <BatteryCharging size={28} />
                        Battery & Capacitor Workstation
                    </h3>
                    <p className="text-green-100 mt-2">Sequential step: Install power source components.</p>
                </div>
                
                <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
                    <h4 className="text-xl font-bold text-gray-700">Units Ready for Installation</h4>
                    
                    {listLoading ? (
                        <div className="text-center py-10">Loading IMEI list...</div>
                    ) : imeiData.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No units are currently ready for battery installation (Soldering not complete).</div>
                    ) : (
                        <div className="space-y-3">
                            {imeiData.map((imeiEntry) => {
                                const isCompleted = imeiEntry.isComplete;
                                const isReady = imeiEntry.hasStatusOne; // True if Soldering is complete
                                const isUnlocked = isImeiAccessible(imeiEntry._id);
                                const isActive = imeiEntry._id === activeImeiId;
                                const isProcessing = verifyingId === imeiEntry._id;
                                const isDisabled = !isReady && !isCompleted;

                                return (
                                <div key={imeiEntry._id} className="border border-gray-200 rounded-lg overflow-hidden">
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
                                                <span className="font-bold text-green-700">Installation Complete</span>
                                            ) : isReady || isUnlocked ? (
                                                <button
                                                    onClick={() => handleAccordionToggle(imeiEntry._id)}
                                                    className={`px-4 py-1 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                                    disabled={isProcessing}
                                                >
                                                    {isActive ? 'Hide Form' : 'Start Installation'}
                                                    <ChevronDown size={18} className={`inline ml-2 transform transition-transform ${isActive ? 'rotate-180' : 'rotate-0'}`} />
                                                </button>
                                            ) : (
                                                // This state should rarely occur if filtering is correct, but acts as a fallback
                                                <span className="text-sm text-red-500 font-semibold">Requires Soldering QC</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Accordion Content */}
                                    {isActive && (isReady || isUnlocked) && !isCompleted && (
                                        <BatteryConnectionForm
                                            assignment={assignment} 
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
export default BatteryConnectionWorkstation;