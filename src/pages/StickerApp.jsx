import React, { useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Printer,
  Download,
  AlertTriangle,
  Loader,
  RefreshCw,
  FileText,
  CheckSquare,
  Square,
  Search,
  LayoutGrid,
  Scissors,
  BarChart3,
  CheckCircle2
} from "lucide-react";

// IMPORTANT: Ensure this path is correct for your project
import logo from '../Images/logo.png';

// --- Constants ---
const API_URL = "https://vanaras.onrender.com/api/v1/superadmin/FetchallQualityCheck";
const TODAY_WORK_REPORT_API_URL = "https://vanaras.onrender.com/api/v1/superadmin/getTodayFirmwareReport";
const AUTH_TOKEN_KEY = 'token';

// --- Helpers ---
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isoString.includes('T')) {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-').toUpperCase();
    }
    return isoString.split('T')[0];
  } catch { return 'N/A'; }
};

const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
};

// --- Fallback Data ---
const FALLBACK_STICKER_DATA = {
  id: 'fallback',
  productName: "TRAXO ELITE",
  modelNo: "ELITE",
  partNo: "TRAXO104",
  tacNo: "CN8737",
  slNo: "TIA/06012026A8137",
  imei: "868329081621363",
  iccidNo: "89915309040286778383",
  mfgDate: "07-JAN-2026",
  helpLine: "06782-260196 / Toll free: 1800 891 1545",
  email: "info@traxoindia.in",
  firmwareDetails: { firmWareStatus: false }
};

const mapApiDataToSticker = (apiItem) => {
  if (!apiItem) return { ...FALLBACK_STICKER_DATA };
  const { firmwareDetails = {} } = apiItem;
  return {
    id: apiItem._id || apiItem.id || `${Math.random()}`,
    productName: apiItem.productName || "TRAXO ELITE",
    modelNo: apiItem.modelNo || "ELITE",
    partNo: apiItem.partNo || "TRAXO104",
    tacNo: apiItem.tacNo || "CN8737",
    helpLine: "06782-260196 / Toll free: 1800 891 1545",
    email: "info@traxoindia.in",
    slNo: firmwareDetails.slNo || apiItem.slNo || FALLBACK_STICKER_DATA.slNo,
    imei: firmwareDetails.imeiNo || apiItem.imeiNo || FALLBACK_STICKER_DATA.imei,
    iccidNo: firmwareDetails.iccidNo || apiItem.iccidNo || FALLBACK_STICKER_DATA.iccidNo,
    mfgDate: formatDate(apiItem.createdAt),
    firmwareDetails: { ...firmwareDetails, firmWareStatus: firmwareDetails?.firmWareStatus ?? false }
  };
};

// --- Components ---

// 1. Sticker Preview Card
const StickerPreview = ({ data, logoSrc }) => {
  if (!data) return <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded border">Select an item to preview</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Preview</span>
        <span className="text-xs text-gray-400">10.5cm × 6.5cm</span>
      </div>
      <div className="p-6 flex justify-center bg-gray-100">
        {/* Visual scale for screen only */}
        <div style={{ transform: 'scale(0.60)', transformOrigin: 'top center', marginBottom: '-90px' }}> 
          {/* UPDATED WIDTH: 505px to match print logic */}
          <div style={{
            width: '505px',
            height: '312px',
            fontFamily: "Arial, sans-serif",
            backgroundColor: '#ffffff',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Top Section */}
            <div style={{ padding: '4px 20px 0px 20px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>
                <img src={logoSrc || logo} alt="Logo" style={{ width: '130px', height: 'auto', display: 'block' }} />
              </div>
              <h2 style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '15px', marginBottom: '6px', lineHeight: '1.2', color: '#000' }}>
                AIS 140 WITH IRNSS ICAT APPROVED VLTD
              </h2>
              <div style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '1.3', color: '#000' }}>
                <p style={{ margin: '1px 0' }}>PRODUCT NAME : {data.productName}</p>
                <p style={{ margin: '1px 0' }}>MODEL NO : {data.modelNo}</p>
                <p style={{ margin: '1px 0' }}>PART NO : {data.partNo}</p>
                <p style={{ margin: '1px 0' }}>TAC NO : {data.tacNo}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                  <p style={{ margin: 0 }}>SL NO : {data.slNo}</p>
                  <p style={{ margin: 0 }}>MFG. DATE : {data.mfgDate}</p>
                </div>
                <p style={{ margin: '1px 0' }}>IMEI : {data.imei}</p>
                <p style={{ margin: '1px 0' }}>ICCID NO : {data.iccidNo}</p>
              </div>
            </div>
            {/* Footer Section - BLACK */}
            <div style={{ backgroundColor: '#000000', color: 'white', textAlign: 'center', padding: '8px 10px 10px 10px', fontWeight: 'bold', flexShrink: 0 }}>
              <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', lineHeight: '1.1' }}>TRAXO (INDIA) AUTOMATION PRIVATE LIMITED.</h2>
              <p style={{ fontSize: '14px', margin: '2px 0', lineHeight: '1.1' }}>HELP LINE NO : {data.helpLine}</p>
              <p style={{ fontSize: '15px', textDecoration: 'underline', margin: '3px 0 0 0', lineHeight: '1.1' }}>{data.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Table Component
const StickerTable = ({ items, selectedItems, onToggle, onSelectAll, onClear, searchTerm, setSearchTerm }) => {
  const filteredItems = items.filter(item => 
    item.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.slNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50/50 rounded-t-xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search IMEI / SL No..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={onSelectAll} className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-2 transition-colors">
            <CheckSquare size={14} /> Select All
          </button>
          <button onClick={onClear} className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-2 transition-colors">
            <Square size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 w-12 text-center">#</th>
              <th className="px-6 py-3">IMEI</th>
              <th className="px-6 py-3">SL No</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.length > 0 ? filteredItems.map((item) => {
              const isSelected = selectedItems.some(s => s.id === item.id);
              return (
                <tr 
                  key={item.id} 
                  onClick={() => onToggle(item)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <td className="px-6 py-3 text-center">
                    <div className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <CheckSquare size={14} className="text-white" />}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono font-medium text-gray-700">{item.imei}</td>
                  <td className="px-6 py-3 font-mono text-gray-500">{item.slNo}</td>
                  <td className="px-6 py-3 text-gray-500">{item.mfgDate}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.firmwareDetails?.firmWareStatus ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.firmwareDetails?.firmWareStatus ? 'Ready' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} />
                    <p>No stickers found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 text-xs text-gray-500 flex justify-between">
        <span>Showing {filteredItems.length} items</span>
        <span>Total loaded: {items.length}</span>
      </div>
    </div>
  );
};

// 3. Reports Tab Content
const ReportsTab = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(TODAY_WORK_REPORT_API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const result = await res.json();
        setReportData(result.data?.[0] || null);
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const downloadPDF = async () => {
    if (!reportData) return;
    const doc = new jsPDF();
    try {
      const logoBase64 = await getBase64FromUrl(logo);
      doc.addImage(logoBase64, 'PNG', 14, 10, 36, 10);
    } catch (e) {}
    doc.text("Today Work Report", 55, 17);
    doc.text(`Date: ${reportData._id.day}`, 14, 30);
    autoTable(doc, {
      startY: 35,
      head: [["Status", "IMEI", "ICCID", "Time"]],
      body: reportData.imeis.map(item => [item.firmWareStatus ? "Completed" : "Pending", item.imeiNo, item.iccidNo, new Date(item.createdAt).toLocaleTimeString()])
    });
    doc.save(`Traxo-Report-${reportData._id.day}.pdf`);
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader className="animate-spin text-blue-600" /></div>;
  if (!reportData) return <div className="h-64 flex flex-col items-center justify-center text-gray-500"><FileText size={48} className="mb-2 opacity-50" /><p>No work data recorded for today yet.</p></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Devices</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.totalFirmware}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm bg-green-50/30">
          <p className="text-green-600 text-sm font-medium uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{reportData.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
          <p className="text-red-600 text-sm font-medium uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{reportData.pending}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Detailed Logs</h3>
          <button onClick={downloadPDF} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"><Download size={16} /> Download PDF</button>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">IMEI</th>
                <th className="px-6 py-3">ICCID</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.imeis.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {item.firmWareStatus ? 
                      <span className="flex items-center gap-1.5 text-green-600 font-medium"><CheckCircle2 size={14} /> Done</span> : 
                      <span className="flex items-center gap-1.5 text-red-500 font-medium"><AlertTriangle size={14} /> Pending</span>
                    }
                  </td>
                  <td className="px-6 py-3 font-mono text-gray-600">{item.imeiNo}</td>
                  <td className="px-6 py-3 font-mono text-gray-500 text-xs">{item.iccidNo}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(item.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('stickers');
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => { getBase64FromUrl(logo).then(setLogoBase64); }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) { setItems([FALLBACK_STICKER_DATA]); setLoading(false); return; }
    try {
      const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setItems(data.allQualityCheckData?.length ? data.allQualityCheckData.map(mapApiDataToSticker) : [FALLBACK_STICKER_DATA]);
    } catch { setItems([FALLBACK_STICKER_DATA]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDownload = async () => {
    if (selectedItems.length === 0) return;
    setIsPrinting(true);
    
    // Create Pages Logic
    // 8 items per page
    const chunks = Array.from({ length: Math.ceil(selectedItems.length / 8) }, (v, i) => selectedItems.slice(i * 8, i * 8 + 8));
    const container = document.createElement('div');
    Object.assign(container.style, { position: 'fixed', left: '-10000px', top: '0', background: '#fff' });
    document.body.appendChild(container);

    for (const chunk of chunks) {
      const page = document.createElement('div');
      // UPDATED: Padding sides set to 0 to maximize width and remove gap
      Object.assign(page.style, { width: '794px', height: '1123px', padding: '70px 0px', background: '#fff', boxSizing: 'border-box' });
      
      const grid = document.createElement('div');
      // UPDATED: Grid uses 50% width columns (approx 397px each)
      Object.assign(grid.style, { display: 'grid', gridTemplateColumns: '50% 50%', gridTemplateRows: 'repeat(4, 246px)', gap: '0', width: '100%', margin: '0 auto' });

      chunk.forEach(data => {
        const cell = document.createElement('div');
        Object.assign(cell.style, { width: '100%', height: '246px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
        
        // --- PRINT TEMPLATE UPDATED ---
        // Internal Width: Increased to 505px to fill the gap
        // Scale: 0.785 (Produces approx 396px width, which fits perfectly in 50% of A4)
        // Footer: Black background
cell.innerHTML = `
<style>
  @page {
    margin: 0;
    padding: 0;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
  
  .label {
    page-break-inside: avoid;
    break-inside: avoid;
  }
</style>

<div class="label"
  style="
    width: 505px;
    height: 246px;
    margin: 0;
    font-family: Arial, sans-serif;
    background: #fff;
    border: 1px solid #000;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  "
>
  <!-- TOP CONTENT -->
  <div style="padding: 0px 18px 2px 18px; flex: 1;">
    
    <!-- LOGO (perfect center) -->
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2px;
      padding-top: 4px;
    ">
      <img src="${logoBase64 || logo}" style="width: 115px; height: auto;" />
    </div>

    <!-- AIS 140 HEADER -->
    <div style="
      text-align: center;
      font-weight: bold;
      font-size: 12.5px;
      margin: 2px 0 6px 0;
      line-height: 1.2;
    ">
      AIS 140 WITH IRNSS ICAT APPROVED VLTD
    </div>

    <!-- PRODUCT DETAILS -->
    <div style="font-size: 12.5px; font-weight: bold; line-height: 1.25;">
      <!-- PRODUCT NAME -->
      <p style="margin: 1px 0 1px 0; padding: 0;">
        PRODUCT NAME : ${data.productName}
      </p>
      
      <!-- MODEL NO -->
      <p style="margin: 1px 0 1px 0; padding: 0;">
        MODEL NO : ${data.modelNo}
      </p>
      
      <!-- PART NO -->
      <p style="margin: 1px 0 1px 0; padding: 0;">
        PART NO : ${data.partNo}
      </p>
      
      <!-- TAC NO -->
      <p style="margin: 1px 0 1px 0; padding: 0;">
        TAC NO : ${data.tacNo}
      </p>
      
      <!-- SL NO & MFG DATE -->
      <div style="
        display: flex;
        justify-content: space-between;
        margin: 2px 0 2px 0;
      ">
        <span>SL NO : ${data.slNo}</span>
        <span>MFG. DATE : ${data.mfgDate}</span>
      </div>
      
      <!-- IMEI -->
      <p style="margin: 1px 0 0px 0; padding: 0;">
        IMEI : ${data.imei}
      </p>
      
      <!-- ICCID - MOVED UP -->
      <p style="
        margin: 0px 0 1px 0;
        padding: 0;
        position: relative;
        top: -2px;
      ">
        ICCID NO : ${data.iccidNo}
      </p>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="
    background: #ff9900;
    color: #000;
    text-align: center;
    padding: 5px 6px;
    font-weight: bold;
    flex-shrink: 0;
  ">
    <!-- COMPANY NAME -->
    <div style="
      font-size: 11.5px;
      margin-bottom: 1px;
      line-height: 1.2;
    ">
      TRAXO (INDIA) AUTOMATION PRIVATE LIMITED.
    </div>

    <!-- HELPLINE -->
    <div style="
      font-size: 10.5px;
      margin: 1px 0;
      line-height: 1.2;
    ">
      HELP LINE NO : 06782-260196 / Toll free: 1800 891 1545
    </div>

    <!-- EMAIL -->
    <div style="
      font-size: 11px;
      text-decoration: underline;
      margin-top: 1px;
      line-height: 1.2;
    ">
      info@traxoindia.in
    </div>
  </div>
</div>
`;



        grid.appendChild(cell);
      });
      page.appendChild(grid);
      container.appendChild(page);
    }

    const pages = container.querySelectorAll('div[style*="width: 794px"]');
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true });
      canvas.toBlob(blob => saveAs(blob, `Traxo-Stickers-Page-${i + 1}.png`));
      await new Promise(r => setTimeout(r, 100));
    }
    document.body.removeChild(container);
    setIsPrinting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg text-white">
              <Scissors size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Traxo Print System</h1>
              <p className="text-xs text-gray-500">Sticker Management v4.0</p>
            </div>
          </div>
          
          <nav className="hidden md:flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('stickers')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'stickers' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Print Stickers
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Daily Report
            </button>
          </nav>
          
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Refresh Data">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'stickers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Available Stickers</h2>
                  <p className="text-sm text-gray-500">Select items to generate printable A4 sheets.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                  <p className="text-xl font-bold text-gray-700">{items.length}</p>
                </div>
              </div>

              {loading ? (
                <div className="bg-white h-[600px] rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                  <Loader size={32} className="animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-500 font-medium">Fetching sticker data...</p>
                </div>
              ) : (
                <StickerTable 
                  items={items} 
                  selectedItems={selectedItems} 
                  onToggle={(i) => setSelectedItems(prev => prev.some(x => x.id === i.id) ? prev.filter(x => x.id !== i.id) : [...prev, i])}
                  onSelectAll={() => setSelectedItems(items)}
                  onClear={() => setSelectedItems([])}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <LayoutGrid size={16} /> Preview
                  </h3>
                  <StickerPreview 
                    data={selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : items[0]} 
                    logoSrc={logoBase64}
                  />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Printer size={20} className="text-blue-600" /> Print Queue
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Selected Stickers</span>
                      <span className="font-medium">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Format</span>
                      <span className="font-medium">10.5cm × 6.5cm</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                      <span className="text-gray-500">Total A4 Pages</span>
                      <span className="font-bold text-blue-600">{Math.ceil(selectedItems.length / 8)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownload}
                    disabled={selectedItems.length === 0 || isPrinting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPrinting ? <Loader className="animate-spin" size={20} /> : <Download size={20} />}
                    {isPrinting ? 'Generating...' : 'Download Pages'}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Prints 8 stickers per page (2 columns × 4 rows)
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Today's Work Report</h2>
                <p className="text-gray-500">Real-time firmware update statistics.</p>
              </div>
            </div>
            <ReportsTab />
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
