import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, BatteryCharging, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

// --- API Endpoints ---
const FETCH_IMEI_LIST_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchSolderingDetailsandImeiNo"; 
const MARK_BATTERY_COMPLETE_API = "https://vanaras.onrender.com/api/v1/superadmin/addBatteryDetails";


// ----------------------------------------------------------------------
// ## 1. Task UI Component: Battery Connection & Capacitor (The Form)
// ----------------------------------------------------------------------
const BatteryConnectionForm = ({ imeiEntry, onStatusChange }) => { 
    const [voltage, setVoltage] = useState('');
    const [connectionChecks, setConnectionChecks] = useState({
        batteryConnected: false,
        capacitorConnected: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCompletedLocally, setIsCompletedLocally] = useState(imeiEntry.isComplete); 

    const handleCheckChange = (key) => {
        if (isCompletedLocally) return;
        setConnectionChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const allChecksComplete = Object.values(connectionChecks).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!voltage || !allChecksComplete) {
            toast.error('Please enter the voltage and confirm both connections.', { position: 'bottom-right' });
            return;
        }
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");

            const payload = {
                barcodeImeiId: imeiEntry._id,
                voltage: parseFloat(voltage),
                batteryConnected: connectionChecks.batteryConnected,
                capacitorConnected: connectionChecks.capacitorConnected,
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

            toast.success(`Battery data saved for IMEI ${imeiEntry.imeiNo}!`, { position: 'top-center' });

            setIsCompletedLocally(true);
            onStatusChange(imeiEntry._id);

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
                    
                    {/* Voltage Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Measured Voltage (V) <span className="text-red-500">*</span>
                        </label>
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

                    <div></div>
                </div>

                {/* Checkboxes */}
                <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-4">Connection Checklist</h4>

                    <div className="space-y-3">
                        {/* Battery Connected */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={connectionChecks.batteryConnected}
                                onChange={() => handleCheckChange('batteryConnected')}
                                id={`battery-${imeiEntry._id}`}
                                className="h-5 w-5 text-green-600 border-gray-300 rounded"
                                disabled={checkboxDisabled}
                            />
                            <label htmlFor={`battery-${imeiEntry._id}`} className="text-sm text-gray-700 font-medium cursor-pointer">
                                <b>Battery Connected</b> (Polarity Checked)
                            </label>
                        </div>

                        {/* Capacitor Connected */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={connectionChecks.capacitorConnected}
                                onChange={() => handleCheckChange('capacitorConnected')}
                                id={`capacitor-${imeiEntry._id}`}
                                className="h-5 w-5 text-green-600 border-gray-300 rounded"
                                disabled={checkboxDisabled}
                            />
                            <label htmlFor={`capacitor-${imeiEntry._id}`} className="text-sm text-gray-700 font-medium cursor-pointer">
                                <b>Capacitor Connected</b>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 flex justify-end">
                    {isCompletedLocally ? (
                        <span className="px-6 py-3 text-sm font-bold text-green-700 border border-green-300 rounded-lg">
                            Installation Complete
                        </span>
                    ) : (
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2"
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
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchIMEIList = async () => {
        setListLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(FETCH_IMEI_LIST_API, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            const allImeis = data.solderingDetailsList || [];
            let firstOpen = null;

            const mapped = allImeis.map(item => {
                const imeiId = item.barcodeImeiId?._id || item._id;

                const formatted = {
                    ...item,
                    _id: imeiId,
                    imeiNo: item.barcodeImeiId?.imeiNo || "N/A",
                    isReady: item.status_Soldering === true,
                    isComplete: item.batteryStatus === true,
                };

                if (formatted.isReady && !formatted.isComplete && !firstOpen) {
                    firstOpen = imeiId;
                }

                return formatted;
            });

            setImeiData(mapped);

            if (firstOpen) {
                setActiveImeiId(firstOpen);  // AUTO OPEN FIRST AVAILABLE IMEI
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch IMEI list.");
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchIMEIList();
    }, [refreshTrigger]);

    const handleImeiComplete = () => {
        setActiveImeiId(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAccordionToggle = (id) => {
        setActiveImeiId(prev => prev === id ? null : id);
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <BatteryCharging size={28} />
                        Battery & Capacitor Workstation
                    </h3>
                </div>

                <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
                    {listLoading ? (
                        <div className="text-center py-10">Loading IMEI list...</div>
                    ) : (
                        <div className="space-y-3">
                            {imeiData.map(imei => {
                                const isOpen = activeImeiId === imei._id;
                                return (
                                    <div key={imei._id} className="border border-gray-200 rounded-lg overflow-hidden">

                                        {/* HEADER */}
                                        <div
                                            onClick={() => handleAccordionToggle(imei._id)}
                                            className={`p-3 flex justify-between cursor-pointer 
                                                ${imei.isComplete ? "bg-green-100" : "bg-gray-50 hover:bg-gray-100"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {imei.isComplete ? <CheckCircle className="text-green-700" /> :
                                                    <Clock className="text-gray-500" />}
                                                <span className="font-mono text-lg">{imei.imeiNo}</span>
                                            </div>

                                            <ChevronDown
                                                className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                                            />
                                        </div>

                                        {/* FORM */}
                                        {isOpen && !imei.isComplete && (
                                            <BatteryConnectionForm
                                                imeiEntry={imei}
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
