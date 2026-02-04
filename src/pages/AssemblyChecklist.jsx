import React, { useState } from "react";
import { Download, Calendar, Upload, Printer, AlertCircle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../Images/logo.png";

// Checklist items with fixed employee assignments
const CHECKLIST_ITEMS = [
  { 
    id: 1,
    text: "No solder defect on Elite PCB",
    employee: "Rajat Barik"
  },
  { 
    id: 2,
    text: "No electrical and physical damage component Elite Tracking PCB",
    employee: "Rajat Barik"
  },
  { 
    id: 3,
    text: "Wire harnessing check",
    employee: "Rajat Barik"
  },
  { 
    id: 4,
    text: "Manual components post-soldering worksheet implementation",
    employee: "Satya Jena"
  },
  { 
    id: 5,
    text: "Check soldering of cable as per sequence (Green, Yellow, Red & Blue)",
    employee: "Susanta Dalei"
  },
  { 
    id: 6,
    text: "Battery Connection to board – LED should be glow as red color.",
    employee: "Srikanta Dalei"
  },
  { 
    id: 7,
    text: "No shorting of any component.",
    employee: "Srikanta Dalei"
  },
  { 
    id: 8,
    text: "Power / Voltage Testing- overall assembly check – All Components should be in right polarity.",
    employee: "Srikanta Dalei"
  },
  { 
    id: 9,
    text: "Firmware Flashing and IMEI to ICCID Mapping Request Raised",
    employee: "Ramchandra Ghantayat"
  },
  { 
    id: 10,
    text: "Embedded SIM Activation",
    employee: "M Bhoi"
  },
  { 
    id: 11,
    text: "Final QC Manual Check – All Steps Followed for Out of Box Audit",
    employee: "Chinmay Puhan"
  },
  { 
    id: 12,
    text: "Final QC System Check – Report Downloaded",
    employee: "Shashikanta Rout"
  },
  { 
    id: 13,
    text: "Packaging and Enclosure Sealing",
    employee: "Chinmay Jena"
  }
];

function AssemblyChecklist() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [imeiData, setImeiData] = useState([]);
  const [selectedImeis, setSelectedImeis] = useState([]);
  const [error, setError] = useState("");

  // Format date for API
  const formatApiDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  // Fetch IMEI data from API
  const fetchImeiData = async () => {
    if (!date) {
      toast.error("Please select a date first");
      setError("Please select a date");
      return;
    }

    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const formattedDate = formatApiDate(date);

    try {
      const response = await fetch("https://vanaras.onrender.com/api/v1/superadmin/showAllDateReports", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: formattedDate })
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok || !result.success) {
        const errorMsg = result.message || "Failed to fetch data";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const reports = result.reports || result.qcReport || [];
      
      if (reports.length === 0) {
        const noDataMsg = "No records found for selected date";
        setError(noDataMsg);
        toast.error(noDataMsg);
        setImeiData([]);
        setSelectedImeis([]);
        return;
      }

      setImeiData(reports);
      setError("");
      
      // Get all unique IMEIs
      const uniqueImeis = [...new Set(reports.map(report => report.imeiNo).filter(Boolean))];
      
      // Auto-select all IMEIs
      setSelectedImeis(uniqueImeis);
      
      toast.success(`Loaded ${reports.length} records with ${uniqueImeis.length} unique IMEIs`);

    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "Failed to fetch data");
      toast.error(error.message || "Failed to fetch data");
      setImeiData([]);
      setSelectedImeis([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF for multiple IMEIs
  const generatePDF = () => {
    if (selectedImeis.length === 0) {
      toast.error("No IMEI data available. Please fetch data first.");
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Process each selected IMEI
      selectedImeis.forEach((imei, imeiIndex) => {
        // Add new page for each IMEI after the first one
        if (imeiIndex > 0) {
          doc.addPage();
        }

        // Add header with logo
        doc.addImage(logo, 'PNG', 10, 5, 40, 15);
        
        // Main title - Reduced font size
        doc.setFontSize(8); // Reduced from 16
        doc.setFont("helvetica", "bold");
        const mainTitle = "PANIC SWITCH SOLDERING ASSEMBLY CHECKLIST & TEST RECORD";
        doc.text(mainTitle, pageWidth / 2, 15, { align: 'center' });
        
        // Format info
        doc.setFontSize(9); // Reduced from 10
        doc.setFont("helvetica", "normal");
        doc.text("FORMAT NO. F-TIA/102/01A", 10, 25);
        doc.text(`Rev. 1`, pageWidth - 20, 25, { align: 'right' });
        
        doc.text("Date : 22.12.2025", 10, 32);
        doc.text("Approved by : in charge production", pageWidth - 20, 32, { align: 'right' });
        
        doc.text(`Page ${imeiIndex + 1} of ${selectedImeis.length}`, pageWidth / 2, 32, { align: 'center' });
        
        // Product title
        doc.setFontSize(12); // Reduced from 14
        doc.setFont("helvetica", "bold");
        doc.text("Traxo AIS-140 Tracker (Elite)", pageWidth / 2, 45, { align: 'center' });
        
        doc.setFontSize(11); // Reduced from 12
        doc.text("Assembly Checklist & Test Record", pageWidth / 2, 52, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`DATE: ${date}`, 10, 60);

        // Table data for this IMEI
        const tableData = CHECKLIST_ITEMS.map((item) => [
          item.id,
          item.text,
          imei,
          item.employee,
          "OK"
        ]);

        // Create table with adjusted column widths
        autoTable(doc, {
          startY: 65,
          head: [["No.", "CHECK POINT", "IMEI", "Tested By", "Assembly Note"]],
          body: tableData,
          headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontSize: 9, // Reduced
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 8, // Reduced
            cellPadding: 2,
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, // No.
            1: { cellWidth: 75 }, // CHECK POINT (increased)
            2: { cellWidth: 35, halign: 'center' }, // IMEI
            3: { cellWidth: 30, halign: 'center' }, // Tested By
            4: { cellWidth: 25, halign: 'center' } // Assembly Note
          },
          margin: { left: 10, right: 10 },
          styles: {
            overflow: 'linebreak',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
          },
          theme: 'grid'
        });

        // Get final Y position after table
        const finalY = doc.lastAutoTable.finalY + 15;
        
        // Signature sections - empty lines only
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("VERIFIED BY", 20, finalY);
        doc.line(20, finalY + 10, 70, finalY + 10);
        
        doc.text("APPROVED BY", pageWidth - 70, finalY);
        doc.line(pageWidth - 70, finalY + 10, pageWidth - 20, finalY + 10);
        
        // Footer
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text("© TRAXO (INDIA) AUTOMATION PVT. LTD.", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      });

      // Save the PDF
      const formattedDate = date.replace(/-/g, '');
      const pdfName = `Assembly-Checklist-${formattedDate}.pdf`;
      doc.save(pdfName);
      
      toast.success(`PDF generated with ${selectedImeis.length} IMEI pages!`);
      
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF");
    }
  };
  

  // Select/Deselect all IMEIs
  const toggleAllImeis = () => {
    if (selectedImeis.length === imeiData.length) {
      setSelectedImeis([]);
      toast.info("All IMEIs deselected");
    } else {
      const allImeis = [...new Set(imeiData.map(item => item.imeiNo).filter(Boolean))];
      setSelectedImeis(allImeis);
      toast.success(`All ${allImeis.length} IMEIs selected`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Assembly Checklist Generator
              </h1>
              <p className="text-gray-600">
                Generate assembly checklist PDFs for multiple IMEIs
              </p>
            </div>
            <img 
              src={logo} 
              alt="Traxo Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Main Controls Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Select Production Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                  setImeiData([]);
                  setSelectedImeis([]);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchImeiData}
                disabled={isLoading || !date}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Fetch IMEI Data
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generatePDF}
                disabled={selectedImeis.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-800 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer size={20} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-800">Error</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                  <div className="text-xs text-red-600 mt-2">
                    Please check the date and try again, or contact support if the issue persists.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* IMEI Selection Card - Only show when data exists */}
        {imeiData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Select IMEIs for PDF Generation
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {imeiData.length} records found • {selectedImeis.length} selected
                </p>
              </div>
              <button
                type="button"
                onClick={toggleAllImeis}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
              >
                {selectedImeis.length === imeiData.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {imeiData.map((item, index) => {
                  const isSelected = selectedImeis.includes(item.imeiNo);
                  return (
                    <div 
                      key={index}
                      onClick={() => {
                        setSelectedImeis(prev => 
                          prev.includes(item.imeiNo) 
                            ? prev.filter(i => i !== item.imeiNo)
                            : [...prev, item.imeiNo]
                        );
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500 shadow-sm' 
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="font-mono font-semibold text-gray-900">{item.imeiNo}</div>
                          <div className="text-xs text-gray-500 mt-1 flex gap-2">
                            {item.firmwareDetails?.slNo && (
                              <span>SN: {item.firmwareDetails.slNo}</span>
                            )}
                            {item.firmwareDetails?.iccidNo && (
                              <span>ICCID: {item.firmwareDetails.iccidNo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Download size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">How It Works</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>1. Select a production date from the calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>2. Click "Fetch IMEI Data" to load IMEI numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>3. Select IMEIs you want in the PDF (auto-selects all)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>4. Click "Download PDF" to generate checklist</span>
                </li>
              </ul>
              <div className="mt-4 text-xs text-blue-600">
                <strong>Note:</strong> Each selected IMEI creates a separate page with all 13 checklist items.
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Preview - Minimal */}
        {imeiData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Checklist Preview
              </h3>
              <div className="text-sm text-gray-600">
                13 fixed checklist items
              </div>
            </div>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {item.id}
                  </div>
                  <div className="text-sm text-gray-700">{item.text}</div>
                  <div className="ml-auto text-xs font-medium text-gray-600">
                    {item.employee}
                  </div>
                </div>
              ))}
              <div className="text-center text-sm text-gray-500 pt-2">
                + {CHECKLIST_ITEMS.length - 5} more items...
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AssemblyChecklist;
