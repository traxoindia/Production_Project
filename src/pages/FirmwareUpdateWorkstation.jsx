import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  CheckCircle,
  ChevronDown,
  Zap,
  RefreshCw,
  Edit3,
  Trash2,
  XCircle
} from "lucide-react";
import { toast } from "react-toastify";

// --- API Endpoints ---
const FETCH_BATTERY_DETAILS_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchBatteryConnectionDetails";
const CREATE_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/createFirmWare";
const FETCH_FIRMWARE_BY_IMEI_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchFirmwareByImeiNo";
const EDIT_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/editFirmWareDetails";
const DELETE_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/deleteFirmWareDetails";
const GET_NEXT_SL_API = "https://vanaras.onrender.com/api/v1/superadmin/getNextFirmwareSlNo";

// ----------------------------------------------------------------------
// ## 1. Individual Device Update Form
// ----------------------------------------------------------------------
const FirmwareUpdateForm = ({ imeiEntry, onUpdateComplete, editModeData, onCancelEdit }) => {
  const [iccidNo, setIccidNo] = useState("");
  const [slNo, setSlNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSl, setIsFetchingSl] = useState(false);

  // Fetch Next Serial Number from API for New Requests
  const fetchNextSlNo = useCallback(async () => {
    setIsFetchingSl(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(GET_NEXT_SL_API, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      // console.log(result)
      
      console.log("Next SL No API Response:", result);
      
      if (result.success) {
        setSlNo(result.nextSlNo || ""); // Adjust key based on your exact API response
      }
    } catch (error) {
      console.error("Error fetching next SL No:", error);
      setSlNo("ERROR-FETCHING-SL");
    } finally {
      setIsFetchingSl(false);
    }
  }, []);

  useEffect(() => {
    if (editModeData) {
      setIccidNo(editModeData.iccidNo || "");
      setSlNo(editModeData.slNo || "");
    } else {
      setIccidNo("");
      fetchNextSlNo(); // Fetch from your new API
    }
  }, [editModeData, fetchNextSlNo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const url = editModeData ? EDIT_FIRMWARE_API : CREATE_FIRMWARE_API;
    
    const payload = editModeData 
      ? { 
          firmWareId: editModeData._id, 
          imeiNo: imeiEntry.imeiNo, 
          iccidNo, 
          slNo 
        }
      : { 
          imeiNo: imeiEntry.imeiNo, 
          iccidNo 
          // slNo is generated on backend in your createFirmWare logic
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Request failed");

      toast.success(result.message || "Action Successful");
      onUpdateComplete();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-purple-100 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider">
          {editModeData ? "Edit Firmware Details" : "New Firmware Request"}
        </h4>
        {editModeData && (
          <button onClick={onCancelEdit} className="text-gray-400 hover:text-red-500">
            <XCircle size={20} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">ICCID NO</label>
            <input
              type="text"
              value={iccidNo}
              onChange={(e) => setIccidNo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter ICCID"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex justify-between">
              SERIAL NO (SL)
              {isFetchingSl && <RefreshCw size={12} className="animate-spin text-purple-500" />}
            </label>
            <input
              type="text"
              value={slNo}
              readOnly
              className="w-full px-4 py-2 border rounded-lg font-mono font-bold bg-gray-100 text-gray-500"
              placeholder={isFetchingSl ? "Fetching..." : "Auto-generated"}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || isFetchingSl}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md ${editModeData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50`}
        >
          {isLoading ? <RefreshCw className="animate-spin mx-auto" /> : (editModeData ? "Update Record" : "Confirm & Send to Server")}
        </button>
      </form>
    </div>
  );
};

// ----------------------------------------------------------------------
// ## 2. Main Workstation
// ----------------------------------------------------------------------
const FirmwareUpdateWorkstation = () => {
  const [imeiData, setImeiData] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeImeiId, setActiveImeiId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterImei, setFilterImei] = useState("");
  const [editingData, setEditingData] = useState(null);

  const fetchIMEIList = useCallback(async () => {
    setListLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(FETCH_BATTERY_DETAILS_API, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const mapped = (data.batteryConnectionDetailsList || []).map((item) => ({
        ...item,
        _id: item.imeiNo, 
        isComplete: item.overAllassemblyStatus === true,
        isReady: item.batteryConnectedStatus === true,
      })).filter(item => item.isReady);
      setImeiData(mapped);
    } catch (error) {
      toast.error("Failed to load device list");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIMEIList();
  }, [refreshTrigger, fetchIMEIList]);

  const handleEditInit = async (imeiNo) => {
    const token = localStorage.getItem("token");
    setEditingData(null);
    try {
      const resp = await fetch(FETCH_FIRMWARE_BY_IMEI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imeiNo })
      });
      const result = await resp.json();
      
      if (result.success && result.firmWareDetails) {
        setEditingData(result.firmWareDetails);
        setActiveImeiId(imeiNo);
      } else {
        toast.error(result.message || "Record not found.");
      }
    } catch (err) {
      toast.error("Network error fetching details");
    }
  };

  const handleDelete = async (imeiNo) => {
    if (!window.confirm(`Permanently delete firmware record for ${imeiNo}?`)) return;

    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(DELETE_FIRMWARE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imeiNo })
      });
      const result = await resp.json();
      if (resp.ok) {
        toast.success(result.message);
        fetchIMEIList();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 rounded-t-2xl shadow-xl flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3"><Cpu size={28} /> Firmware Workstation</h3>
          <p className="text-purple-100 text-sm opacity-90">Backend-integrated firmware control panel.</p>
        </div>
        <button onClick={() => setRefreshTrigger(t => t + 1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
          <RefreshCw className={listLoading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-2xl shadow-xl">
        <input
          type="text"
          placeholder="Search by IMEI Number..."
          className="w-full p-4 mb-6 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-all shadow-sm"
          value={filterImei}
          onChange={(e) => setFilterImei(e.target.value)}
        />

        {listLoading ? (
           <div className="py-20 text-center text-gray-400 animate-pulse">Fetching devices...</div>
        ) : (
          <div className="space-y-3">
            {imeiData.filter(i => i.imeiNo.includes(filterImei)).map((imei) => (
              <div key={imei._id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-purple-200 transition-colors">
                <div className={`p-4 flex justify-between items-center ${imei.isComplete ? "bg-green-50/50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-4">
                    {imei.isComplete ? <CheckCircle className="text-green-600" /> : <Zap className="text-purple-500" />}
                    <div>
                        <span className="font-mono text-lg font-bold text-gray-800">{imei.imeiNo}</span>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Status: {imei.isComplete ? 'Complete' : 'Ready'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditInit(imei.imeiNo)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(imei.imeiNo)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition" title="Delete">
                      <Trash2 size={18} />
                    </button>
                    {!imei.isComplete && (
                      <button 
                        onClick={() => {setActiveImeiId(activeImeiId === imei._id ? null : imei._id); setEditingData(null);}}
                        className={`ml-2 p-1 rounded-full transition-transform ${activeImeiId === imei._id ? "rotate-180 bg-purple-100 text-purple-600" : "text-gray-400 hover:bg-gray-200"}`}
                      >
                        <ChevronDown size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {activeImeiId === imei._id && (
                  <FirmwareUpdateForm 
                    imeiEntry={imei} 
                    editModeData={editingData}
                    onCancelEdit={() => {setActiveImeiId(null); setEditingData(null);}}
                    onUpdateComplete={() => {fetchIMEIList(); setActiveImeiId(null); setEditingData(null);}}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirmwareUpdateWorkstation;