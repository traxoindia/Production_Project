import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  CheckCircle,
  ChevronDown,
  Zap,
  RefreshCw,
  Edit3,
  Trash2,
  XCircle,
  ChessKing
} from "lucide-react";
import { toast } from "react-toastify";

// --- API Endpoints ---
const FETCH_BATTERY_DETAILS_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchBatteryConnectionDetails";
const CREATE_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/createFirmWare";
const FETCH_FIRMWARE_BY_IMEI_API = "https://vanaras.onrender.com/api/v1/superadmin/fetchFirmwareByImeiNo";
const EDIT_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/editFirmWareDetails";
const DELETE_FIRMWARE_API = "https://vanaras.onrender.com/api/v1/superadmin/deleteFirmWareDetails";

// --- Constants ---
const SERIAL_PREFIX = "TIA/";
const SERIAL_SUFFIX_START = 8509;
const SESSION_SL_COUNTER_KEY = "traxo_sl_counter";

const getFormattedDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// ----------------------------------------------------------------------
// ## 1. Individual Device Update Form
// ----------------------------------------------------------------------
const FirmwareUpdateForm = ({ imeiEntry, onUpdateComplete, editModeData, onCancelEdit }) => {
  const [iccidNo, setIccidNo] = useState("");
  const [slNo, setSlNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editModeData) {
      setIccidNo(editModeData.iccidNo || "");
      setSlNo(editModeData.slNo || "");
    } else {
      const storedCounter = sessionStorage.getItem(SESSION_SL_COUNTER_KEY);
      let nextCounter = storedCounter ? parseInt(storedCounter, 10) : SERIAL_SUFFIX_START;
      const datePart = getFormattedDate();
      const generatedSlNo = `${SERIAL_PREFIX}${datePart}A${String(nextCounter).padStart(4, '0')}`;
      setSlNo(generatedSlNo);
    }
  }, [editModeData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const url = editModeData ? EDIT_FIRMWARE_API : CREATE_FIRMWARE_API;
    
    // Payload for Edit: { firmWareId, imeiNo, iccidNo, slNo }
    // Payload for Create: { imeiNo, iccidNo, slNo }
    const payload = editModeData 
      ? { 
          firmWareId: editModeData._id, 
          imeiNo: imeiEntry.imeiNo, 
          iccidNo, 
          slNo 
        }
      : { 
          imeiNo: imeiEntry.imeiNo, 
          iccidNo, 
          slNo 
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Request failed");

      toast.success(editModeData ? "Details updated!" : "Firmware created!");
      
      if (!editModeData) {
        const current = parseInt(sessionStorage.getItem(SESSION_SL_COUNTER_KEY) || SERIAL_SUFFIX_START);
        sessionStorage.setItem(SESSION_SL_COUNTER_KEY, current + 1);
      }
      
      onUpdateComplete();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-purple-100">
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
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">SERIAL NO (SL)</label>
            <input
              type="text"
              value={slNo}
              onChange={(e) => setSlNo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono font-bold"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {isLoading ? "Processing..." : editModeData ? "Update Record" : "Confirm & Send"}
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
        // Using imeiNo as local identifier, but keeping the record _id for deletion if available
        _id: item.imeiNo, 
        firmware_record_id: item.firmWareId, // This is the ID used for deletion
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
      console.log(result)
      
      if (result.success && result.firmWareDetails) {
        setEditingData(result.firmWareDetails);
        setActiveImeiId(imeiNo);
      } else {
        toast.error(result.message || "No record found.");
      }
    } catch (err) {
      toast.error("Failed to fetch record details");
    }
  };

  const handleDelete = async (recordId) => {
    console.log(recordId)
    if (!recordId) return toast.error("No record ID found to delete.");
    if (!window.confirm("Are you sure you want to delete this firmware record?")) return;


    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(DELETE_FIRMWARE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // Passing the ID as {_id} as per your requirement
        body: JSON.stringify({imeiNo:recordId})
      });
      console.log(recordId)
      const result = await resp.json();
      console.log(result)
      if (resp.ok) {
        toast.success(result.message || "Record deleted successfully");
        fetchIMEIList();
      } else {
        throw new Error(result.message || "Deletion failed");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-2xl shadow-lg flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3"><Cpu /> Firmware Workstation</h3>
          <p className="text-purple-100 text-sm opacity-90">Manage firmware updates for battery-connected units.</p>
        </div>
        <button onClick={() => setRefreshTrigger(t => t + 1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
          <RefreshCw className={listLoading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-2xl shadow-xl">
        <input
          type="text"
          placeholder="Filter by IMEI..."
          className="w-full p-3 mb-6 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition"
          value={filterImei}
          onChange={(e) => setFilterImei(e.target.value)}
        />

        <div className="space-y-3">
          {imeiData.filter(i => i.imeiNo.includes(filterImei)).map((imei) => (
            <div key={imei._id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className={`p-4 flex justify-between items-center ${imei.isComplete ? "bg-green-50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-4">
                  {imei.isComplete ? <CheckCircle className="text-green-600" /> : <Zap className="text-purple-500" />}
                  <span className="font-mono text-lg font-bold text-gray-800">{imei.imeiNo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditInit(imei.imeiNo)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    title="Edit Record"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(imei._id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                    title="Delete Record"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  {!imei.isComplete && (
                    <button 
                      onClick={() => {setActiveImeiId(activeImeiId === imei._id ? null : imei._id); setEditingData(null);}}
                      className="ml-2 p-1 text-gray-400 hover:text-purple-600"
                    >
                      <ChevronDown className={activeImeiId === imei._id ? "rotate-180" : ""} />
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
      </div>
    </div>
  );
};

export default FirmwareUpdateWorkstation;