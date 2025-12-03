import React, { useState, useEffect } from "react";
import {
  Cpu, 
  CheckCircle,
  Clock,
  BatteryCharging,
  ChevronDown,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";

// --- API Endpoints ---
const FETCH_BATTERY_DETAILS_API =
  "https://vanaras.onrender.com/api/v1/superadmin/fetchBatteryConnectionDetails";

// Mock API endpoint for firmware update (Placeholder for future server endpoint)
const FIRMWARE_UPDATE_API = "/api/v1/superadmin/firmwareUpdate"; 

// ----------------------------------------------------------------------
// ## 1. Individual Device Update Form
// ----------------------------------------------------------------------
const FirmwareUpdateForm = ({ imeiEntry, onUpdateComplete }) => {
  // Use a placeholder for the current version since the API doesn't provide it
  const [currentVersion, setCurrentVersion] = useState('v1.0.0'); 
  const [targetVersion, setTargetVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, uploading, verifying, complete
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // NOTE: isCompletedLocally relies on imeiEntry.isComplete, which is assumed false upon fetch.
  const [isCompletedLocally, setIsCompletedLocally] = useState(imeiEntry.isComplete);


  if (isCompletedLocally && updateStatus === 'idle') {
      return (
          <div className="p-4 bg-white border-t border-green-200">
              <div className="px-6 py-3 text-sm font-bold text-green-700 border border-green-300 rounded-lg flex items-center gap-2">
                  <CheckCircle size={18} /> Firmware Update Passed
              </div>
          </div>
      );
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!currentVersion || !targetVersion) {
        toast.error('Please enter both version numbers.', { position: "bottom-right" });
        return;
    }

    setIsLoading(true);
    setUpdateStatus('uploading');
    setProgress(0);

    // --- START: SIMULATION LOGIC ---
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setUpdateStatus('verifying');
                
                // Simulate success API call after verification delay
                setTimeout(() => {
                    setUpdateStatus('complete');
                    setIsLoading(false);
                    
                    // Trigger the notification/API call to mark status complete on server side
                    // (Requires a new POST API call here)
                    setIsCompletedLocally(true); 
                    toast.success(`IMEI ${imeiEntry.imeiNo} updated to ${targetVersion}!`, { position: "top-center" });
                    
                    onUpdateComplete(imeiEntry._id); 

                }, 2000);
                return 100;
            }
            return prev + 10;
        });
    }, 300);
    // --- END: SIMULATION LOGIC ---
  };

  return (
    <div className="p-4 bg-white border-t border-purple-200">
      <form onSubmit={handleUpdate} className="bg-white p-4 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Firmware Version
            </label>
            <input
              type="text"
              value={currentVersion}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
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
              disabled={isLoading || isCompletedLocally}
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
                ⚠ Device: **{imeiEntry.imeiNo}**. Ensure connection before updating.
            </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
            disabled={isLoading || isCompletedLocally}
          >
            {isLoading ? 'Updating...' : <><Cpu size={20} /> Start Firmware Update</>}
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
  
  // >>> NEW STATE FOR FILTERING <<<
  const [filterImei, setFilterImei] = useState(''); 

  const fetchIMEIList = async () => {
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
        // CORRECTION: Use imeiNo as the unique ID since the API response structure is flat
        const uniqueId = item.imeiNo; 
        
        // ASSUMPTION: isComplete is based on a future 'firmwareStatus' field, 
        // which we assume is initially false unless the API adds it later.
        const isComplete = item.firmwareStatus === true; 

        return {
          ...item,
          // Map unique identifier
          _id: uniqueId, 
          imeiNo: item.imeiNo || "N/A",
          // Use hardcoded version/placeholder since API lacks a current version field
          currentVersion: 'v1.0.0', 
          isComplete: isComplete,
          // Only show devices that completed the battery connection (as required by context)
          isReady: item.batteryConnectedStatus === true, 
        };
      }).filter(item => item.isReady); // Filter only devices that passed the previous step

      setImeiData(mapped);
      
    } catch (error) {
      console.error("Device List Fetch Error:", error);
      toast.error(`Failed to fetch IMEI list: ${error.message}`);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchIMEIList();
  }, [refreshTrigger]);

  const handleUpdateComplete = (completedImeiId) => {
    // Optimistically update the list without re-fetching everything
    setImeiData(prevData => prevData.map(item => 
        item._id === completedImeiId ? { ...item, isComplete: true } : item
    ));
    setActiveImeiId(null);
    toast.success("Firmware status updated locally. List refreshed.");
  };

  const handleAccordionToggle = (id) => {
    setActiveImeiId((prev) => (prev === id ? null : id));
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Cpu size={28} />
            Firmware Update Workstation
          </h3>
          <p className="text-purple-100 mt-2">Manage firmware updates for units that passed Battery Connection.</p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
          
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-150"
              />
          </div>
          {/* END NEW IMEI Filter Input Field */}

          {listLoading ? (
            <div className="text-center py-10">Loading device list...</div>
          ) : filteredImeis.length === 0 ? ( // Check filteredImeis length
            <div className="text-center py-10 text-gray-500">
                {filterImei ? `No IMEI found matching "${filterImei}".` : 'No units are ready for firmware update.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImeis.map((imei) => { // Map over filteredImeis
                const id = imei._id;
                const isOpen = activeImeiId === id;
                const isComplete = imei.isComplete;

                let headerClass = isComplete ? "bg-green-100 cursor-default" : "bg-gray-50 hover:bg-gray-100 cursor-pointer";
                let icon = isComplete ? <CheckCircle className="text-green-700" /> : <Zap className="text-purple-500" />;
                let statusText = isComplete ? "Update Passed" : "Pending Update";


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
                                Current: {imei.currentVersion}
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

                    {/* FORM */}
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
                            <span>Firmware update </span>
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