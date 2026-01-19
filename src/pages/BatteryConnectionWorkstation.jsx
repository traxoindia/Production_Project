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
} from "lucide-react";
import { toast } from "react-toastify";

// --- API Endpoints ---
const FETCH_IMEI_LIST_API =
  "https://vanaras.onrender.com/api/v1/superadmin/fetchSolderingDetailsandImeiNo";
const MARK_BATTERY_COMPLETE_API =
  "https://vanaras.onrender.com/api/v1/superadmin/addBatteryConnectionDetails";
const VERIFY_SOLDERING_API =
  "https://vanaras.onrender.com/api/v1/superadmin/verifySolderingDetails";

// ----------------------------------------------------------------------
// ## 1. Task UI Component: Battery Connection & Capacitor (The Form)
// ----------------------------------------------------------------------
const BatteryConnectionForm = ({ imeiEntry, onStatusChange }) => {
  const [voltage, setVoltage] = useState("");
  const [batteryType, setBatteryType] = useState("");
  const [connectionChecks, setConnectionChecks] = useState({
    batteryConnected: false,
    capacitorConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletedLocally, setIsCompletedLocally] = useState(
    imeiEntry.isComplete
  );

  const handleCheckChange = (key) => {
    if (isCompletedLocally) return;
    setConnectionChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksComplete = Object.values(connectionChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!voltage || !batteryType || !allChecksComplete) {
      toast.error("Please enter the voltage, battery type, and confirm both connections.", {
        position: "bottom-right",
      });
      return;
    }
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        imeiNo: imeiEntry.imeiNo,
        batteryType: batteryType,
        voltage: parseFloat(voltage),
        batteryConnectedStatus: connectionChecks.batteryConnected,
        capacitorConnectedStatus: connectionChecks.capacitorConnected,
      };

      const response = await fetch(MARK_BATTERY_COMPLETE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit battery data.");
      }

      toast.success(`Battery data saved for IMEI ${imeiEntry.imeiNo}!`, {
        position: "top-center",
      });

      setIsCompletedLocally(true);
      onStatusChange(imeiEntry._id);
    } catch (error) {
      console.error("Battery Submission Error:", error);
      toast.error(`Submission failed: ${error.message}`, {
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkboxDisabled = isLoading || isCompletedLocally;

  return (
    <div className="p-4 bg-white border-t border-green-200">
      <form onSubmit={handleSubmit} className="bg-white p-4 space-y-6">
        <div
          className="grid md:grid-cols-2 gap-6"
          style={{ opacity: checkboxDisabled ? 0.6 : 1 }}
        >
          {/* Battery Type Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Battery Type <span className="text-red-500">*</span>
            </label>
            <select
              value={batteryType}
              onChange={(e) => setBatteryType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              required
              disabled={checkboxDisabled}
            >
              <option value="">Select Battery Type</option>
              <option value="Lithium-Ion">Lithium-Ion</option>
             
            </select>
          </div>

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
        </div>

        {/* Checkboxes */}
        <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-4">
            Connection Checklist
          </h4>

          <div className="space-y-3">
            {/* Battery Connected */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={connectionChecks.batteryConnected}
                onChange={() => handleCheckChange("batteryConnected")}
                id={`battery-${imeiEntry._id}`}
                className="h-5 w-5 text-green-600 border-gray-300 rounded"
                disabled={checkboxDisabled}
              />
              <label
                htmlFor={`battery-${imeiEntry._id}`}
                className="text-sm text-gray-700 font-medium cursor-pointer"
              >
                <b>Battery Connected</b> (Polarity Checked)
              </label>
            </div>

            {/* Capacitor Connected */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={connectionChecks.capacitorConnected}
                onChange={() => handleCheckChange("capacitorConnected")}
                id={`capacitor-${imeiEntry._id}`}
                className="h-5 w-5 text-green-600 border-gray-300 rounded"
                disabled={checkboxDisabled}
              />
              <label
                htmlFor={`capacitor-${imeiEntry._id}`}
                className="text-sm text-gray-700 font-medium cursor-pointer"
              >
                <b>Capacitor Connected</b>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          {isCompletedLocally ? (
            <span className="px-6 py-3 text-sm font-bold text-green-700 border border-green-300 rounded-lg">
              Passed
            </span>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2"
              disabled={isLoading || !allChecksComplete || !batteryType}
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle size={20} /> Complete Installation
                </>
              )}
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

  const [verifyingImeis, setVerifyingImeis] = useState({});

  // >>> NEW STATE FOR FILTERING <<<
  const [filterImei, setFilterImei] = useState('');

  const fetchIMEIList = async () => {
    setListLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(FETCH_IMEI_LIST_API, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      const allImeis = data.solderingDetailsList || [];
      let firstOpen = null;

      const mapped = allImeis.map((item) => {
        const imeiId = item.barcodeImeiId?._id || item._id;

        const formatted = {
          ...item,
          _id: imeiId,
          imeiNo: item.barcodeImeiId?.imeiNo || "N/A",
          isReady: item.status_Soldering === true,
          isComplete: item.batteryConnectionStatus === true,
        };

        if (formatted.isReady && !formatted.isComplete && !firstOpen) {
          firstOpen = imeiId;
        }

        return formatted;
      });

      setImeiData(mapped);

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

  const handleVerifySoldering = async (imeiEntry) => {
    const id = imeiEntry._id;
    const imeiNo = imeiEntry.imeiNo;

    setVerifyingImeis(prev => ({ ...prev, [id]: true }));

    try {
      const token = localStorage.getItem("token");

      const payload = { imeiNo };

      const response = await fetch(VERIFY_SOLDERING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || "Failed to verify soldering.";
        if (errorMessage.includes("Some fields are not true")) {
          toast.error(
            `IMEI ${imeiNo}: Verification failed. Not all 17 soldering fields were completed in the previous step.`,
            { position: "top-center", autoClose: 5000 }
          );
        } else {
          throw new Error(errorMessage);
        }
      } else {
        toast.success(`Soldering verified for IMEI ${imeiNo}. Ready for battery!`, {
          position: "top-center",
          autoClose: 3000,
        });

        // Update isReady status locally to allow the form to open
        setImeiData(prevData => prevData.map(item =>
          item._id === id ? { ...item, isReady: true } : item
        ));

        setActiveImeiId(id);
      }

    } catch (error) {
      console.error("Soldering Verification Error:", error);
      if (!error.message.includes("Some fields are not true")) {
        toast.error(`Verification failed for IMEI ${imeiNo}: ${error.message}`, {
          position: "bottom-right",
        });
      }
    } finally {
      setVerifyingImeis(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleAccordionToggle = (imeiEntry) => {
    const id = imeiEntry._id;

    if (imeiEntry.isComplete) {
      return; // Do nothing if complete
    }

    if (imeiEntry.isReady) {
      setActiveImeiId((prev) => (prev === id ? null : id));
    } else {
      toast.info("Please click the 'Verify Soldering' button to confirm 17 points are done.", {
        position: "bottom-right",
      });
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
        <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <BatteryCharging size={28} />
            Battery & Capacitor Workstation
          </h3>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
            />
          </div>
          {/* END NEW IMEI Filter Input Field */}

          {listLoading ? (
            <div className="text-center py-10">Loading IMEI list...</div>
          ) : filteredImeis.length === 0 ? ( // Check filteredImeis length
            <div className="text-center py-10 text-gray-500">
              {filterImei ? `No IMEI found matching "${filterImei}".` : 'No units found requiring battery connection.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImeis.map((imei) => { // Map over filteredImeis
                const id = imei._id;
                const isOpen = activeImeiId === id;
                const isImeiVerifying = verifyingImeis[id] === true;
                const isBatteryPassed = imei.isComplete;

                let headerClass = "bg-gray-50";
                let icon = <Clock className="text-gray-500" />;
                let statusText = "Soldering Pending";

                if (isBatteryPassed) {
                  headerClass = "bg-green-100 cursor-default";
                  icon = <CheckCircle className="text-green-700" />;
                  statusText = "Passed";
                } else if (imei.isReady) {
                  headerClass = "bg-yellow-50 hover:bg-yellow-100 cursor-pointer";
                  icon = <Lightbulb className="text-yellow-600" />;
                  statusText = "Ready for Battery Connection";
                } else {
                  headerClass = "bg-red-50 cursor-default";
                  icon = <XCircle className="text-red-700" />;
                }


                return (
                  <div
                    key={id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* HEADER */}
                    <div
                      onClick={() => imei.isReady && !isBatteryPassed ? handleAccordionToggle(imei) : null}
                      className={`p-3 flex justify-between items-center transition-all ${headerClass} 
                                ${imei.isReady && !isBatteryPassed ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <span className="font-mono text-lg font-bold">{imei.imeiNo}</span>
                        <span className="ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                          {statusText}
                        </span>
                      </div>

                      {/* RIGHT SIDE CONTENT */}
                      <div className="flex items-center gap-4">
                        {/* 1. VERIFY BUTTON (Only shown if NOT ready and NOT complete) */}
                        {!isBatteryPassed && !imei.isReady && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifySoldering(imei);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                            disabled={isImeiVerifying}
                          >
                            {isImeiVerifying ? (
                              "Verifying..."
                            ) : (
                              <>
                                <CheckSquare size={18} />
                                Verify Soldering (17 Points)
                              </>
                            )}
                          </button>
                        )}

                        {/* 2. CHEVRON (Only shown if ready and not complete) */}
                        {imei.isReady && !isBatteryPassed && (
                          <ChevronDown
                            className={`transform transition-transform ${isOpen ? "rotate-180" : ""
                              }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* FORM */}
                    {isOpen && !isBatteryPassed && imei.isReady && (
                      <BatteryConnectionForm
                        imeiEntry={imei}
                        onStatusChange={handleImeiComplete}
                      />
                    )}

                    {/* Completion Message */}
                    {isBatteryPassed && (
                      <div className="p-4 bg-green-50 text-green-700 text-sm border-t border-green-300 flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>This step is **Passed**.</span>
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

export default BatteryConnectionWorkstation;