import React, { useState } from "react";
import { Download, Calendar, Upload, Printer, AlertCircle, FileText, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../Images/logo.png";

const CHECKLIST_ITEMS = [
  { id: 1, text: "No solder defect on Elite PCB", employee: "Rajat Barik" },
  { id: 2, text: "No electrical and physical damage component Elite Tracking PCB", employee: "Rajat Barik" },
  { id: 3, text: "Wire harnessing check", employee: "Rajat Barik" },
  { id: 4, text: "Manual components post-soldering worksheet implementation", employee: "Satya Jena" },
  { id: 5, text: "Check soldering of cable as per sequence (Green, Yellow, Red & Blue)", employee: "Susanta Dalei" },
  { id: 6, text: "Battery Connection to board – LED should be glow as red color.", employee: "Srikanta Dalei" },
  { id: 7, text: "No shorting of any component.", employee: "Srikanta Dalei" },
  { id: 8, text: "Power / Voltage Testing- overall assembly check – All Components should be in right polarity.", employee: "Srikanta Dalei" },
  { id: 9, text: "Firmware Flashing and IMEI to ICCID Mapping Request Raised", employee: "Ramchandra Ghantayat" },
  { id: 10, text: "Embedded SIM Activation", employee: "M Bhoi" },
  { id: 11, text: "Final QC Manual Check – All Steps Followed for Out of Box Audit", employee: "Chinmay Puhan" },
  { id: 12, text: "Final QC System Check – Report Downloaded", employee: "Shashikanta Rout" },
  { id: 13, text: "Packaging and Enclosure Sealing", employee: "Chinmay Jena" }
];

// Document Header Component (UI Preview)
const DocumentHeader = ({ 
  logoSrc = logo, 
  title = "PANIC SWITCH SOLDERING ASSEMBLY CHECKLIST & TEST RECORD", 
  docNo = "F-TIA/102/01A", 
  revNo = "2", 
  date = "10.04.2026" 
}) => (
  <div className="">
    
      
      
      
    
  </div>
);

function AssemblyChecklist() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [imeiData, setImeiData] = useState([]);
  const [selectedImeis, setSelectedImeis] = useState([]);
  const [error, setError] = useState("");

  const formatApiDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '10.04.2026';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  const fetchImeiData = async () => {
    if (!date) {
      toast.error("Please select a date first");
      return;
    }
    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("https://vanaras.onrender.com/api/v1/superadmin/showAllDateReports", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: formatApiDate(date) })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to fetch");
      const reports = result.reports || result.qcReport || [];
      if (reports.length === 0) {
        setError("No records found for selected date");
        setImeiData([]);
      } else {
        setImeiData(reports);
        setSelectedImeis([...new Set(reports.map(r => r.imeiNo).filter(Boolean))]);
        toast.success(`Loaded ${reports.length} records`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  const addPDFHeader = (doc, pageWidth, imeiIndex, total, currentSelectedDate) => {
    const margin = 10;
    const boxW = pageWidth - 20;
    const topY = 10;
    const headerH = 28;

    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(margin, topY, boxW, headerH);

    const col1 = 35; 
    const col3 = 40; 
    const col2 = boxW - col1 - col3;

    doc.line(margin + col1, topY, margin + col1, topY + headerH);
    doc.line(margin + col1 + col2, topY, margin + col1 + col2, topY + headerH);
    doc.line(margin + col1, topY + 12, margin + col1 + col2, topY + 12);
    doc.line(margin + col1, topY + 20, margin + col1 + col2, topY + 20);

    doc.addImage(logo, 'PNG', margin + 5, topY + 5, 25, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PANIC SWITCH SOLDERING ASSEMBLY CHECKLIST & TEST RECORD", margin + col1 + (col2/2), topY + 7, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`FORMAT NO. F-TIA/102/01A`, margin + col1 + (col2/2), topY + 17, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Approved by: In charge production", margin + col1 + 4, topY + 25);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Rev: 2`, margin + col1 + col2 + 5, topY + 10);
    doc.text(`Date: 10.04.2026`, margin + col1 + col2 + 5, topY + 18);
    doc.text(`Page ${imeiIndex + 1} of ${total}`, margin + col1 + col2 + 5, topY + 22, );

    doc.setFontSize(10);
    doc.text("Traxo AIS-140 Tracker (Elite)", pageWidth / 2, topY + 38, { align: 'center' });
    doc.text("Assembly Checklist & Test Record", pageWidth / 2, topY + 45, { align: 'center' });
    doc.setFontSize(9);
    
    
    return topY + 50; 
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      selectedImeis.forEach((imei, idx) => {
        if (idx > 0) doc.addPage();
        const startY = addPDFHeader(doc, pageWidth, idx, selectedImeis.length, date);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
       
        doc.text(`DATE:`, pageWidth - 30, startY, { align: 'right' });

        autoTable(doc, {
          startY: startY + 5,
          head: [["No.", "CHECK POINT", "IMEI", "Tested By", "Status"]],
          body: CHECKLIST_ITEMS.map(item => [item.id, item.text, imei, item.employee, "OK"]),
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], fontSize: 8, halign: 'center' },
          styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
          columnStyles: { 
            0: { cellWidth: 10, halign: 'center' }, 
            1: { cellWidth: 85 }, 
            2: { cellWidth: 40, halign: 'center' }, 
            3: { cellWidth: 35, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' }
          }
        });

        const finalY = doc.lastAutoTable.finalY + 30; // Spacing for signatures
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
       
        // Verified By Section
        doc.line(20, finalY, 70, finalY);
        doc.text("VERIFIED BY (QC)", 45, finalY + 7, { align: 'center' });
      
        // Approved By Section
        doc.line(pageWidth - 70, finalY, pageWidth - 20, finalY);
        doc.text("APPROVED BY", pageWidth - 45, finalY + 7, { align: 'center' });
      });

      doc.save(`Checklist-${date}.pdf`);
      toast.success("PDF Generated");
    } catch (err) {
      toast.error("Generation failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-4 md:p-8">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="mt-4 font-semibold text-gray-700">Syncing Production Data...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 shadow-md rounded-sm overflow-hidden">
          <DocumentHeader date="10.04.2026" />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Production Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={fetchImeiData} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Upload size={18} /> Fetch IMEIs
              </button>
            </div>
            <div className="flex items-end">
              <button 
                onClick={generatePDF} 
                disabled={selectedImeis.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Printer size={18} /> Download PDFs
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-red-500 text-sm font-medium">⚠️ {error}</p>}
        </div>

        {imeiData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={18} />
                Selected Devices ({selectedImeis.length})
              </h2>
              <button 
                onClick={() => setSelectedImeis(selectedImeis.length === imeiData.length ? [] : imeiData.map(i => i.imeiNo))}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {selectedImeis.length === imeiData.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
              {imeiData.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedImeis(prev => prev.includes(item.imeiNo) ? prev.filter(i => i !== item.imeiNo) : [...prev, item.imeiNo])}
                  className={`p-3 border rounded-xl cursor-pointer text-sm font-mono transition-all ${
                    selectedImeis.includes(item.imeiNo) ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {item.imeiNo}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssemblyChecklist;