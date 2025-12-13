import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu, 
  CheckCircle,
  ChevronDown,
  Zap,
  RefreshCw 
} from "lucide-react";
import { toast } from "react-toastify";

// --- API Endpoints ---
const FETCH_BATTERY_DETAILS_API =
  "https://vanaras.onrender.com/api/v1/superadmin/fetchBatteryConnectionDetails";

const CREATE_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/createFirmWare"; 

// --- Constants for Serial Number Generation ---
const SERIAL_PREFIX = "TIA/";
const SERIAL_SUFFIX_START = 8037;
const SESSION_SL_COUNTER_KEY = "traxo_sl_counter";

// Helper to format date as DDMMYYYY
const getFormattedDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// ----------------------------------------------------------------------
// ## 1. Individual Device Update Form
// ----------------------------------------------------------------------
const FirmwareUpdateForm = ({ imeiEntry, onUpdateComplete }) => {
  // FIX APPLIED: Corrected typo from imeidEntry to imeiEntry
  const [iccidNo, setIccidNo] = useState(imeiEntry.iccidNo || ''); 
  // slNo state is handled differently: initialized by generation function
  const [slNo, setSlNo] = useState(imeiEntry.slNo || '');
  
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isCompletedLocally, setIsCompletedLocally] = useState(imeiEntry.isComplete);

  // --- SERIAL NUMBER GENERATION LOGIC ---
  useEffect(() => {
    // Check if the current entry already has a serial number (e.g., loaded from API)
    if (imeiEntry.slNo) {
        setSlNo(imeiEntry.slNo);
        return;
    }
    
    // --- 1. Get/Initialize Counter ---
    const storedCounter = sessionStorage.getItem(SESSION_SL_COUNTER_KEY);
    let nextCounter = SERIAL_SUFFIX_START;

    if (storedCounter) {
        // If stored, use the stored value (ensures sequential numbers within the session)
        nextCounter = parseInt(storedCounter, 10);
        // Ensure counter hasn't regressed below the starting point
        if (nextCounter < SERIAL_SUFFIX_START) {
             nextCounter = SERIAL_SUFFIX_START;
        }
    }

    // --- 2. Generate Serial Number ---
    const datePart = getFormattedDate();
    // Format the number part (AXXXX, starting from 8037)
    const slSuffix = `A${String(nextCounter).padStart(4, '0')}`;
    const generatedSlNo = `${SERIAL_PREFIX}${datePart}${slSuffix}`;
    
    // --- 3. Update State and Session Storage ---
    setSlNo(generatedSlNo);
    
    // Increment the counter for the *next* device
    sessionStorage.setItem(SESSION_SL_COUNTER_KEY, nextCounter + 1);

  }, [imeiEntry.slNo]); 
  // --- END SERIAL NUMBER GENERATION LOGIC ---


  if (isCompletedLocally && updateStatus === 'idle') {
      return (
          <div className="p-4 bg-white border-t border-green-200">
              <div className="px-6 py-3 text-sm font-bold text-green-700 border border-green-300 rounded-lg flex items-center gap-2">
                  <CheckCircle size={18} /> Firmware Update Passed
              </div>
          </div>
      );
  }

  const handleFirmwarePost = async () => {
    const token = localStorage.getItem("token"); // Get token
    
    // API requires imeiNo, iccidNo, slNo (using local state values)
    const postData = {
        imeiNo: imeiEntry.imeiNo,
        iccidNo: iccidNo,
        slNo: slNo, // Use the generated/set slNo
    };
    
    // Basic validation before API call
    if (!postData.imeiNo || !postData.iccidNo || !postData.slNo) {
        // This should theoretically not happen if slNo is auto-generated
        toast.error('IMEI, ICCID No, and Serial No must all be provided.', { position: "top-center" });
        return false;
    }

    try {
        const response = await fetch(CREATE_FIRMWARE_API, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API failed with status: ${response.status}`);
        }
        
        // Success
        return true; 

    } catch (error) {
        console.error("Firmware POST Error:", error);
        toast.error(`POST Failed: ${error.message}`, { position: "top-center" });
        return false;
    }
  };


  const handleUpdate = (e) => {
    e.preventDefault();
    
    if (!iccidNo || !slNo) {
        toast.error('Please fill in the ICCID No and Serial No fields.', { position: "bottom-right" });
        return;
    }

    setIsLoading(true);
    setUpdateStatus('uploading');
    setProgress(0);

    // --- START: FIRMWARE UPDATE PROCESS SIMULATION ---
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setUpdateStatus('verifying');
                
                // 1. Verification/POST delay
                setTimeout(async () => {
                    const postSuccess = await handleFirmwarePost();

                    if (postSuccess) {
                        setUpdateStatus('complete');
                        setIsCompletedLocally(true); 
                        toast.success(`Firmware request initiated for IMEI ${imeiEntry.imeiNo}!`, { position: "top-center" });
                        onUpdateComplete(imeiEntry._id); 
                    } else {
                        setUpdateStatus('idle'); 
                        setProgress(0);
                    }
                    
                    setIsLoading(false);

                }, 2000); 
                return 100;
            }
            return prev + 10;
        });
    }, 300);
    // --- END: FIRMWARE UPDATE PROCESS SIMULATION ---
  };

  return (
    <div className="p-4 bg-white border-t border-purple-200">
      <form onSubmit={handleUpdate} className="bg-white p-4 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* ICCID No Input Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ICCID No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={iccidNo}
              onChange={(e) => setIccidNo(e.target.value)}
              placeholder="Enter ICCID Number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              required
              disabled={isLoading || isCompletedLocally}
            />
          </div>

          {/* Serial No (slNo) Input Field - Now auto-generated and read-only */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Serial No (SL No) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slNo}
              placeholder="Auto Generating Serial Number..."
              className="w-full px-4 py-3 border-2 border-purple-500 bg-purple-50 rounded-lg focus:outline-none cursor-default font-mono font-bold"
              required
              // Disabled and read-only because it's auto-generated
              disabled={true} 
            />
            <p className="mt-1 text-xs text-gray-500">
                Format: TIA/DDMMYYYYAXXXX. Auto-generated and incremented per session.
            </p>
          </div>
        </div>

        {updateStatus !== 'idle' && (
          <div className="bg-purple-50 border-2 border-purple-200 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                {updateStatus === 'uploading' && '1/2 Preparing Request...'}
                {updateStatus === 'verifying' && '2/2 Sending Update Status to Server...'}
                {updateStatus === 'complete' && 'Update Request Complete!'}
              </span>
              <span className="text-sm font-bold text-purple-600">
                {updateStatus === 'uploading' ? `${progress}%` : '...'}
            </span>
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
                ⚠ Device: **{imeiEntry.imeiNo}**. Ensure connection before sending the update request.
            </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
            disabled={isLoading || isCompletedLocally}
          >
            {isLoading ? 'Updating...' : <><Cpu size={20} /> Send Firmware Update Request</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// ----------------------------------------------------------------------
// ## 2. Main Component: FirmwareUpdateWorkstation
// ----------------------------------------------------------------------
const FirmwareUpdateWorkstation = ({ assignment }) => {
  const [imeiData, setImeiData] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeImeiId, setActiveImeiId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [filterImei, setFilterImei] = useState(''); 

  const fetchIMEIList = useCallback(async () => {
    setListLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(FETCH_BATTERY_DETAILS_API, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch device list: ${response.status}`);
      }

      const data = await response.json();
      
      const allImeis = data.batteryConnectionDetailsList || []; 
      
      const mapped = allImeis.map((item) => {
        const uniqueId = item.imeiNo; 
        
        // A device is considered 'Complete' (cannot be updated) if overAllassemblyStatus is TRUE.
        const isComplete = item.overAllassemblyStatus === true; 
        
        // A device is 'Ready' for listing if battery is connected (assuming this is the first filter)
        const isReady = item.batteryConnectedStatus === true; 

        return {
          ...item,
          _id: uniqueId, 
          imeiNo: item.imeiNo || "N/A",
          iccidNo: item.iccidNo || '',
          slNo: item.slNo || '',
          currentVersion: 'N/A', 
          isComplete: isComplete,
          isReady: isReady, 
        };
      }).filter(item => item.isReady); // Only show devices that are ready

      setImeiData(mapped);
      
    } catch (error) {
      console.error("Device List Fetch Error:", error);
      toast.error(`Failed to fetch IMEI list: ${error.message}`);
    } finally {
      setListLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchIMEIList();
  }, [refreshTrigger, fetchIMEIList]); 

  const handleUpdateComplete = (completedImeiId) => {
    // When a firmware request is successfully POSTed, mark it as complete
    setImeiData(prevData => prevData.map(item => 
        item._id === completedImeiId ? { ...item, isComplete: true } : item
    ));
    // Close the accordion after completion
    setActiveImeiId(null);
  };

  const handleAccordionToggle = (id) => {
    setActiveImeiId((prev) => (prev === id ? null : id));
  };
  
  const handleRefreshClick = () => {
      // Clear the filter when refreshing data
      setFilterImei('');
      // Toggle refreshTrigger to re-run useEffect
      setRefreshTrigger(prev => prev + 1);
  };

  // --- Filtering Logic ---
  const handleFilterChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); 
    setFilterImei(value.slice(0, 15)); 
    if (value.length > 0) {
        // Find the first matching IMEI and open it immediately for quick input
        const matchingImei = imeiData.find(imei => imei.imeiNo.includes(value.slice(0, 15)));
        if (matchingImei && !matchingImei.isComplete) {
             setActiveImeiId(matchingImei._id);
        } else {
             setActiveImeiId(null);
        }
    } else {
        setActiveImeiId(null);
    }
  };

  const filteredImeis = imeiData.filter(imei => 
      imei.imeiNo && imei.imeiNo.includes(filterImei)
  );
  // --- End Filtering Logic ---

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Cpu size={28} />
            Firmware Update Workstation
          </h3>
          <p className="text-purple-100 mt-2">Manage firmware updates for units that passed Battery Connection.</p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
          
          {/* Controls and Filter */}
          <div className="flex justify-between items-end gap-4 mb-6">
              <div className="flex-grow">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                />
              </div>
              <button
                onClick={handleRefreshClick}
                disabled={listLoading}
                className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200 disabled:opacity-50 transition"
              >
                <RefreshCw size={16} className={listLoading ? 'animate-spin' : ''} />
                Refresh List
              </button>
          </div>

          {listLoading ? (
            <div className="text-center py-10">Loading device list...</div>
          ) : filteredImeis.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                {filterImei ? `No IMEI found matching "${filterImei}".` : 'No units are currently passing the battery connection check.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImeis.map((imei) => {
                const id = imei._id;
                const isOpen = activeImeiId === id;
                const isComplete = imei.isComplete; // Determined by overAllassemblyStatus

                let headerClass = isComplete ? "bg-green-100 cursor-default" : "bg-gray-50 hover:bg-gray-100 cursor-pointer";
                let icon = isComplete ? <CheckCircle className="text-green-700" /> : <Zap className="text-purple-500" />;
                let statusText = isComplete ? "Overall Assembly Passed (Done)" : "Ready for Firmware Request";


                return (
                  <div
                    key={imei._id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* HEADER */}
                    <div
                      onClick={() => !isComplete && handleAccordionToggle(imei._id)}
                      className={`p-3 flex justify-between items-center transition-all ${headerClass}`}
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <div>
                            <span className="font-mono text-lg font-bold">{imei.imeiNo}</span>
                            <span className="ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                Status: Battery Connected
                            </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${isComplete ? 'text-green-700' : 'text-purple-600'}`}>
                            {statusText}
                        </span>
                        {!isComplete && (
                            <ChevronDown
                              className={`transform transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                        )}
                      </div>
                    </div>

                    {/* FORM - Only render if open AND not complete */}
                    {isOpen && !isComplete && (
                      <FirmwareUpdateForm
                        imeiEntry={imei}
                        onUpdateComplete={handleUpdateComplete}
                      />
                    )}

                    {/* Completion Message */}
                    {isComplete && (
                        <div className="p-4 bg-green-50 text-green-700 text-sm border-t border-green-300 flex items-center gap-2">
                            <CheckCircle size={16} /> 
                            <span>This unit has passed the Overall Assembly check and is complete.</span>
                        </div>
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

export default FirmwareUpdateWorkstation;