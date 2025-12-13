// StickerApp.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
// If you're using a bundler, ensure these are installed and imported:
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

// NEW PDF DEPENDENCIES
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from '../Images/logo.png'; // Traxo Logo imported here
import {
  Printer,
  Download,
  AlertTriangle,
  Loader,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";

// --- Constants ---
const API_URL = "https://vanaras.onrender.com/api/v1/superadmin/FetchallQualityCheck";
// Renamed constant to reflect "Work Report"
const TODAY_WORK_REPORT_API_URL = "https://vanaras.onrender.com/api/v1/superadmin/getTodayFirmwareReport";
const AUTH_TOKEN_KEY = 'token';

// A simple function to format date from ISO string to 'DD-MMM-YYYY'
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    // Modified to handle the date format for the report component's logic 
    // which relies on the raw date for the report title.
    if (isoString.includes('T')) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '-').toUpperCase();
    }
    // For ISO date strings like "2025-12-13" which come from report._id.day
    return isoString.split('T')[0];

  } catch {
    return 'N/A';
  }
};

// --- Traxo Logo (simple img) ---
const TraxoLogoSvg = () => (
  <img width="144" src={logo} height="40" alt="Traxo Logo" />
);

// Fallback single-item template (used when API fails)
const FALLBACK_STICKER_DATA = {
  id: 'fallback',
  productName: "TRAXO ELITE (Fallback)",
  modelNo: "ELITE",
  partNo: "TRAXO101",
  tacNo: "CN8737",
  slNo: "TIA/00000000000",
  imei: "000000000000000",
  iccidNo: "00000000000000000",
  mfgDate: "JAN-2000",
  helpLine: "00000-000000 / 00000000000 / 00000000000",
  email: "info@traxoindia.in",
  firmwareDetails: {
    firmWareStatus: false,
    iccidNo: "000000000000",
    imeiNo: "000000000000000",
    slNo: "TIA/00000000000",
    createdAt: "2025-01-01T00:00:00.000Z",
  }
};


// --- Map API item to sticker data ---
const mapApiDataToSticker = (apiItem) => {
  if (!apiItem) return { ...FALLBACK_STICKER_DATA };

  const { firmwareDetails = {} } = apiItem;
  const {
    iccidNo: fwIccid,
    imeiNo: fwImei,
    slNo: fwSlNo,
    ...restFirmware
  } = firmwareDetails || {};

  return {
    id: apiItem._id || apiItem.id || `${fwImei || fwSlNo || Math.random()}`,
    productName: apiItem.productName || "TRAXO ELITE",
    modelNo: apiItem.modelNo || "ELITE",
    partNo: apiItem.partNo || "TRAXO101",
    tacNo: apiItem.tacNo || "CN8737",
    helpLine: "06782-260196 /Toll free:18008911545",
    email: apiItem.email || "info@traxoindia.in",
    slNo: fwSlNo || apiItem.slNo || FALLBACK_STICKER_DATA.slNo,
    imei: fwImei || apiItem.imeiNo || FALLBACK_STICKER_DATA.imei,
    iccidNo: fwIccid || apiItem.iccidNo || FALLBACK_STICKER_DATA.iccidNo,
    mfgDate: formatDate(apiItem.createdAt),
    firmwareDetails: {
      ...restFirmware,
      iccidNo: fwIccid,
      imeiNo: fwImei,
      slNo: fwSlNo,
      createdAt: firmwareDetails?.createdAt,
      updatedAt: apiItem.updatedAt || firmwareDetails?.updatedAt,
      firmWareStatus: firmwareDetails?.firmWareStatus ?? false
    }
  };
};


// --- Sticker Template (off-screen capture target) ---
const TraxoStickerTemplate = React.forwardRef(({ data }, ref) => {
  // Slight CSS tweaks: iccid moved up using negative margin class; template is fixed off-screen
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 -translate-x-full w-[480px] bg-white border border-gray-300 shadow-sm text-black"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="px-5 pt-3 pb-1">
        <div className="flex justify-center mb-1">
          <div className="w-36 h-auto">
            <TraxoLogoSvg />
          </div>
        </div>

        <h2 className="font-bold text-center text-[15px] mb-3">
          AIS 140 WITH IRNSS ICAT APPROVED VLTD
        </h2>

        <div className="space-y-[2px] text-[13px] font-semibold leading-tight">
          <p>PRODUCT NAME : {data.productName}</p>
          <p>MODEL NO : {data.modelNo}</p>
          <p>PART NO : {data.partNo}</p>
          <p>TAC NO : {data.tacNo}</p>

          <div className="flex justify-between pt-1">
            <p>SL NO : {data.slNo}</p>
            <p>MFG. DATE : {data.mfgDate}</p>
          </div>

          <p>IMEI : {data.imei}</p>
          {/* ICCID slightly raised: using negative margin to sit a little higher */}
          <p className="-mt-1">ICCID NO : {data.iccidNo}</p>
        </div>
      </div>

      <div className="bg-[#ff9900] text-white text-center py-2.5 font-bold leading-tight">
        <h2 className="text-[15px] mb-[2px]">TRAXO (INDIA) AUTOMATION PRIVATE LIMITED.</h2>
        <p className="text-[14px] mb-[2px]">
          HELP LINE NO : {data.helpLine}
        </p>
        <p className="underline text-[15px]">{data.email}</p>
      </div>
    </div>
  );
});


// --- Today Work Report Component (Renamed) ---
const TodayWorkReport = () => {
  const [reportData, setReportData] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchReport = useCallback(async () => {
    setIsReportLoading(true);
    setError(null);
    setReportData(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) {
      setError(`Authentication token not found. Cannot fetch report.`);
      setIsReportLoading(false);
      return;
    }

    try {
      const response = await fetch(TODAY_WORK_REPORT_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        let msg = `API Request failed with status ${response.status}.`;
        try {
          const parsed = JSON.parse(errText);
          msg = parsed.message || parsed.error || errText;
        } catch {
          msg = errText;
        }
        throw new Error(msg);
      }

      const result = await response.json();
      
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        setReportData(result.data[0]);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.error("Fetch Report Error:", err);
      setError(`Failed to fetch report: ${err.message}`);
    } finally {
      setIsReportLoading(false);
    }
  }, []);

  // Fetch report on component mount
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // --- FRONTEND PDF GENERATION FUNCTION (Logo Added) ---
  const handleDownloadReport = () => {
    if (!reportData) {
      alert("No report data available to generate PDF.");
      return;
    }

    try {
      setIsDownloadLoading(true);

      const dateStr = reportData._id.day; // e.g., "2025-12-13"

      const doc = new jsPDF();
      let finalY = 0; // Tracks the vertical position in the PDF

      // 1. Add Traxo Logo
      // Note: This relies on the imported 'logo' being correctly recognized by jsPDF, 
      // often requiring the logo to be base64 encoded, which is generally handled
      // by modern bundlers when importing small images.
      doc.addImage(logo, 'PNG', 14, 10, 36, 10); // x, y, width, height

      // 2. Title
      doc.setFontSize(16);
      doc.text("Today Work Report", 55, 17); // Shifted title next to logo

      // 3. Summary
      doc.setFontSize(11);
      doc.text(`Report Date: ${dateStr}`, 14, 30);
      doc.text(`Total Devices: ${reportData.totalFirmware}`, 14, 36);
      doc.text(`Completed: ${reportData.completed}`, 14, 42);
      doc.text(`Pending: ${reportData.pending}`, 14, 48);
      finalY = 54; // Starting Y for table

      // 4. Autotable for detailed IMEIs
      autoTable(doc, {
        startY: finalY,
        head: [["Status", "IMEI", "ICCID", "SL No", "Time"]],
        body: reportData.imeis.map(item => [
          item.firmWareStatus ? "Completed" : "Pending",
          item.imeiNo,
          item.iccidNo,
          item.slNo,
          new Date(item.createdAt).toLocaleTimeString('en-US')
        ]),
        headStyles: { fillColor: [52, 58, 64] },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 },
        }
      });
      
      // Save the generated PDF
      doc.save(`Traxo-Work-Report-${dateStr}.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsDownloadLoading(false);
    }
  };


  const report = reportData;
  const total = report?.totalFirmware ?? 0;
  const completed = report?.completed ?? 0;
  const pending = report?.pending ?? 0;
  const dateStr = report?._id?.day ? report._id.day : 'N/A';
  const dataPresent = total > 0;

  return (
    <div className="mt-8 max-w-5xl mx-auto w-full border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <div 
        className="bg-gray-800 text-white p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-bold flex items-center gap-3">
          <FileText size={24} />
          Today Work Report ({dateStr !== 'N/A' ? formatDate(dateStr + 'T00:00:00.000Z') : 'N/A'})
        </h3>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {/* Accordion Content */}
      <div className={`transition-max-height ease-in-out duration-500 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} style={{ transitionProperty: 'max-height, opacity' }}>
        <div className="p-6 bg-white">
          {isReportLoading && (
            <div className="text-center p-4">
              <Loader className="animate-spin text-gray-500 mx-auto" size={20} />
              <p className="text-sm text-gray-600 mt-2">Fetching report data...</p>
            </div>
          )}

          {error && !isReportLoading && (
            <div className="bg-red-100 border-2 border-red-300 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-red-600" size={20} />
                <h4 className="font-bold text-red-800">Report Error</h4>
              </div>
              <p className="text-sm text-red-700 font-medium whitespace-pre-wrap">{error}</p>
              <button
                onClick={fetchReport}
                className="mt-3 text-sm flex items-center gap-1 text-red-600 hover:underline font-semibold"
              >
                <RefreshCw size={14} /> Retry Fetch
              </button>
            </div>
          )}

          {!isReportLoading && !error && !dataPresent && (
            <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded-xl text-center text-sm font-medium text-yellow-800">
                No work activity reported for today ({dateStr}).
            </div>
          )}
          
          {report && dataPresent && (
            <div className="space-y-6">
              {/* Summary and Download Button */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">{total}</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{completed}</p>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{pending}</p>
                      <p className="text-sm text-gray-500">Pending</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloadLoading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition flex items-center gap-2 disabled:bg-red-300"
                >
                  {isDownloadLoading ? (
                    <><Loader size={18} className="animate-spin" /> Generating PDF...</>
                  ) : (
                    <><Download size={18} /> Download PDF Report</>
                  )}
                </button>
              </div>

              {/* Detailed IMEI Table */}
              <div className="pt-4">
                <h4 className="text-lg font-bold mb-3 text-gray-700">Detailed IMEIs ({report.imeis.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICCID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.imeis.map((item, index) => (
                        <tr key={item.imeiNo || index} className={item.firmWareStatus ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                            <span className={`flex items-center gap-2 ${item.firmWareStatus ? 'text-green-600' : 'text-red-600'}`}>
                              {item.firmWareStatus ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              {item.firmWareStatus ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">{item.imeiNo}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">{item.iccidNo}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">{item.slNo}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main form that lists all records and supports download per-record ---
const PrintStickerForm = () => {
  const stickerRefs = useRef({}); // map of id -> node
  const [items, setItems] = useState([]); // array of mapped sticker data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state per item
  const [openMap, setOpenMap] = useState({}); // id -> boolean
  const [quantityMap, setQuantityMap] = useState({}); // id -> string
  const [printQualityMap, setPrintQualityMap] = useState({}); // id -> quality
  const [isPrintingMap, setIsPrintingMap] = useState({}); // id -> boolean

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOpenMap({});
    setItems([]);

    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) {
      setError(`Authentication token not found in localStorage. Please log in and save token under '${AUTH_TOKEN_KEY}'.`);
      setItems([FALLBACK_STICKER_DATA]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        let msg = `API Request failed with status ${response.status}.`;
        try {
          const parsed = JSON.parse(errText);
          msg = parsed.message || parsed.error || errText;
        } catch {
          msg = errText;
        }
        throw new Error(msg);
      }

      const result = await response.json();

      if (result.allQualityCheckData && Array.isArray(result.allQualityCheckData) && result.allQualityCheckData.length > 0) {
        const mapped = result.allQualityCheckData.map(mapApiDataToSticker);
        setItems(mapped);
        // initialize per-item UI state (quantity default 1, quality 'high')
        const qMap = {};
        const pqMap = {};
        const openInit = {};
        mapped.forEach(item => {
          qMap[item.id] = '1';
          pqMap[item.id] = 'high';
          openInit[item.id] = false;
        });
        setQuantityMap(qMap);
        setPrintQualityMap(pqMap);
        setOpenMap(openInit);
      } else {
        setError("Connected to API, but no quality-check data was returned. Using fallback data.");
        setItems([FALLBACK_STICKER_DATA]);
        setQuantityMap({ [FALLBACK_STICKER_DATA.id]: '1' });
        setPrintQualityMap({ [FALLBACK_STICKER_DATA.id]: 'high' });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(`Failed to fetch data: ${err.message}. Using fallback data.`);
      setItems([FALLBACK_STICKER_DATA]);
      setQuantityMap({ [FALLBACK_STICKER_DATA.id]: '1' });
      setPrintQualityMap({ [FALLBACK_STICKER_DATA.id]: 'high' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler to capture and download sticker for a single item
  const handleDownloadForItem = async (itemId) => {
    const node = stickerRefs.current[itemId];
    const item = items.find(it => it.id === itemId) || FALLBACK_STICKER_DATA;
    const qty = parseInt(quantityMap[itemId], 10) || 1;

    if (!node) {
      setError("Sticker DOM node not available for capture.");
      return false;
    }

    if (typeof html2canvas === 'undefined' || typeof saveAs === 'undefined') {
      setError("Dependency error: html2canvas or file-saver missing.");
      return false;
    }

    try {
      setIsPrintingMap(prev => ({ ...prev, [itemId]: true }));

      // capture
      const canvas = await html2canvas(node, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
      });

      await new Promise((res) => setTimeout(res, 120)); // tiny debounce

      // create blob and save multiple files if qty>1 (append index)
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to create image blob.");
          setIsPrintingMap(prev => ({ ...prev, [itemId]: false }));
          return;
        }

        // If quantity >1, save multiple files (or you could zip; here we save multiple PNGs)
        for (let i = 1; i <= qty; i++) {
          const suffix = qty > 1 ? `-x${i}` : '';
          saveAs(blob, `Traxo-Sticker${suffix}-${item.imei || item.slNo || item.id}.png`);
        }

        setIsPrintingMap(prev => ({ ...prev, [itemId]: false }));
      }, 'image/png');
      return true;
    } catch (err) {
      console.error("Error creating sticker image:", err);
      setError(`Sticker generation failed: ${err.message}`);
      setIsPrintingMap(prev => ({ ...prev, [itemId]: false }));
      return false;
    }
  };

  const toggleAccordion = (id) => {
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setQuantityFor = (id, value) => {
    setQuantityMap(prev => ({ ...prev, [id]: value }));
    // Optionally persist per-item quantities to localStorage
    try {
      localStorage.setItem(`qty_${id}`, value);
    } catch {}
  };

  const setQualityFor = (id, value) => {
    setPrintQualityMap(prev => ({ ...prev, [id]: value }));
    try {
      localStorage.setItem(`quality_${id}`, 'high'); // Keep 'high' as default if not explicitly changed
      localStorage.setItem(`quality_${id}`, value);
    } catch {}
  };

  const resetItemForm = (id) => {
    setQuantityMap(prev => ({ ...prev, [id]: '1' }));
    setPrintQualityMap(prev => ({ ...prev, [id]: 'high' }));
    try {
      localStorage.removeItem(`qty_${id}`);
      localStorage.setItem(`quality_${id}`, 'high');
    } catch {}
  };

  return (
    <div className="p-4 sm:p-8">
      {/* render sticker templates off-screen for each item */}
      {items.map(item => (
        <TraxoStickerTemplate
          key={`template-${item.id}`}
          ref={(el) => {
            if (el) stickerRefs.current[item.id] = el;
          }}
          data={item}
        />
      ))}

      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Printer size={28} />
            Label & Sticker Printing System
          </h3>
          <p className="text-indigo-100 mt-2">Product labeling and identification based on live API data.</p>
        </div>

        <div className="bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
          {/* Status */}
          {isLoading ? (
            <div className="bg-blue-100 border-2 border-blue-300 p-5 rounded-xl text-center flex items-center justify-center gap-3">
              <Loader className="animate-spin text-blue-600" size={20} />
              <span className="text-sm font-semibold text-blue-800">Fetching product data...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-2 border-red-300 p-5 rounded-xl text-left">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-red-600" size={20} />
                <h4 className="font-bold text-red-800">Error</h4>
              </div>
              <p className="text-sm text-red-700 font-medium whitespace-pre-wrap">{error}</p>
              <button
                onClick={fetchData}
                className="mt-3 text-sm flex items-center gap-1 text-red-600 hover:underline font-semibold"
              >
                <RefreshCw size={14} /> Retry Fetch
              </button>
            </div>
          ) : (
            <div className="bg-green-100 border-2 border-green-300 p-3 rounded-xl text-sm text-green-800 font-medium text-center">
              Loaded {items.length} record{items.length > 1 ? 's' : ''}.
            </div>
          )}

          {/* Records list */}
          <div className="space-y-5 pt-4">
            {items.map((item) => {
              const fw = item.firmwareDetails || {};
              const isOpen = !!openMap[item.id];
              const isPrinting = !!isPrintingMap[item.id];
              const qtyVal = quantityMap[item.id] ?? '1';
              const pqVal = printQualityMap[item.id] ?? 'high';
              const isDataReady = item.imei && item.imei !== FALLBACK_STICKER_DATA.imei;

              return (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">IMEI: <span className="font-mono font-bold">{item.imei || 'N/A'}</span></div>
                      <div className="text-xs text-gray-500">SL No: <span className="font-mono">{item.slNo || 'N/A'}</span> • ICCID: <span className="font-mono">{item.iccidNo || 'N/A'}</span></div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAccordion(item.id)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
                      >
                        <span className="text-sm font-semibold">Details</span>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      <button
                        onClick={() => handleDownloadForItem(item.id)}
                        disabled={isPrinting || !isDataReady}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${isPrinting ? 'bg-indigo-200 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'}`}
                      >
                        {isPrinting ? 'Generating...' : <><Download size={16} /> Download Sticker</>}
                      </button>
                    </div>
                  </div>

                  {/* Accordion content */}
                  <div className={`transition-max-height ease-in-out duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`} style={{ transitionProperty: 'max-height, opacity' }}>
                    {isOpen && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-medium text-gray-600">Product</div>
                            <div className="text-sm font-bold text-gray-800">{item.productName} — {item.modelNo}</div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-600">Identifiers</div>
                            <div className="text-sm font-mono text-gray-800">{item.slNo} • {item.imei} • {item.iccidNo}</div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-600">MFG / QC</div>
                            <div className="text-sm text-gray-800">{item.mfgDate} • Updated: {formatDate(item.firmwareDetails?.updatedAt)}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={qtyVal}
                              onChange={(e) => setQuantityFor(item.id, e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                              placeholder="Number of stickers"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Print Quality</label>
                            <div className="flex gap-3">
                              {['standard', 'high', 'premium'].map(q => (
                                <label key={q} className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer ${pqVal === q ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                                  <input
                                    type="radio"
                                    name={`quality_${item.id}`}
                                    value={q}
                                    checked={pqVal === q}
                                    onChange={() => setQualityFor(item.id, q)}
                                    className="h-4 w-4"
                                  />
                                  <span className="text-sm font-medium capitalize">{q}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end">
                            <button
                              type="button"
                              onClick={() => resetItemForm(item.id)}
                              className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200"
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadForItem(item.id)}
                              disabled={isPrinting || !isDataReady}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center gap-2"
                            >
                              {isPrinting ? 'Generating...' : <><Printer size={16} /> Print (Download)</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};


function StickerApp() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Traxo Product Sticker System</h1>
      <PrintStickerForm />
      {/* New Work Report Component */}
      <TodayWorkReport />
    </div>
  );
}

export default StickerApp;