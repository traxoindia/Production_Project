import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import logo from "../Images/logo.png"; // Make sure to add your logo in the same folder or update the path

// Import autoTable function separately
import autoTable from "jspdf-autotable";

function EmployeeReport() {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef();

  // Fetch report data on component mount
  useEffect(() => {
    fetchReportData();
  }, []);

  // --- API CALL: Get Report Data (GET) ---
  const fetchReportData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "https://vanaras.onrender.com/api/v1/superadmin/getTodayReport",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);

      if (response.data?.success) {
        setReportData(response.data.data || []);
        toast.success(response.data.message || "Report loaded successfully");
      } else {
        setReportData([]);
        toast.error(response.data?.message || "Failed to load report");
      }
    } catch (error) {
      console.error("Report fetch error:", error);
      toast.error("Error fetching report data");
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'failed':
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'in progress':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

const generatePDF = () => {
    if (reportData.length === 0) {
      toast.error("No data available to download");
      return;
    }

    try {
      // 1. Create PDF document (Landscape)
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // 2. Add Logo (Optional)
      try {
        if (logo) {
          doc.addImage(logo, 'PNG', 10, 5, 25, 10); // Adjusted size/pos for better layout
        }
      } catch (error) {
        console.warn("Logo not found");
      }

      // 3. Header Information
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("IMEI Workflow Daily Report", pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      doc.text(`Report Date: ${today}`, pageWidth / 2, 22, { align: 'center' });

      // 4. Summary text
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(`Total IMEIs: ${reportData.length}`, 14, 35);

      // 5. Prepare Table Data
      const headers = [["S.No", "IMEI Number", "QC Status", "Barcode", "Firmware", "Soldering", "Battery & Cap", "QC Stage", "Last Updated"]];
      
      const tableData = reportData.map((item, index) => [
        index + 1,
        item.imeiNo || "N/A",
        item.qcStatus || "N/A",
        item.workFlow?.barcode || "N/A",
        item.workFlow?.firmware || "N/A",
        item.workFlow?.soldering || "N/A",
        item.workFlow?.batteryAndCapacitor || "N/A",
        item.workFlow?.qc || "N/A",
        item.lastUpdatedAt ? new Date(item.lastUpdatedAt).toLocaleDateString() : "N/A"
      ]);

      // 6. Generate Main Table
      // FIX: Use autoTable(doc, options) directly
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 10, right: 10 }
      });

      // 7. Summary Section on new page or below table
      let finalY = doc.lastAutoTable.finalY + 15;
      
      // Check for page overflow
      if (finalY > pageHeight - 50) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(14);
      doc.text("Latest Entry Workflow Summary", 14, finalY);

      const workflowData = [
        ["Stage", "Status"],
        ["Barcode", reportData[0]?.workFlow?.barcode || "N/A"],
        ["Firmware", reportData[0]?.workFlow?.firmware || "N/A"],
        ["Soldering", reportData[0]?.workFlow?.soldering || "N/A"],
        ["Battery & Capacitor", reportData[0]?.workFlow?.batteryAndCapacitor || "N/A"],
        ["Overall QC", reportData[0]?.qcStatus || "N/A"]
      ];

      autoTable(doc, {
        body: workflowData,
        startY: finalY + 5,
        theme: 'striped',
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
      });

      // 8. Add Page Numbers
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 10);
      }

      // 9. Save
      doc.save(`IMEI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF Downloaded!");

    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Failed to generate PDF");
    }
  };
  // Alternative PDF generation if above still doesn't work
  const generatePDFAlternative = () => {
    if (reportData.length === 0) {
      toast.error("No data available to download");
      return;
    }

    try {
      // Create PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add logo
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("IMEI Workflow Report", pageWidth / 2, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString();
      doc.text(`Date: ${today}`, pageWidth / 2, 30, { align: 'center' });
      
      // IMEI Number
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`IMEI: ${reportData[0]?.imeiNo || "N/A"}`, 20, 50);
      
      // QC Status
      doc.text(`QC Status: ${reportData[0]?.qcStatus || "N/A"}`, 20, 60);
      
      // Workflow Stages
      let yPos = 80;
      doc.setFontSize(12);
      doc.text("Workflow Stages:", 20, yPos);
      yPos += 10;
      
      const stages = [
        { label: "Barcode", value: reportData[0]?.workFlow?.barcode },
        { label: "Firmware", value: reportData[0]?.workFlow?.firmware },
        { label: "Soldering", value: reportData[0]?.workFlow?.soldering },
        { label: "Battery & Capacitor", value: reportData[0]?.workFlow?.batteryAndCapacitor },
        { label: "QC", value: reportData[0]?.workFlow?.qc }
      ];
      
      stages.forEach(stage => {
        doc.text(`${stage.label}: ${stage.value || "N/A"}`, 30, yPos);
        yPos += 8;
      });
      
      // Last Updated
      doc.text(`Last Updated: ${reportData[0]?.lastUpdatedAt ? 
        new Date(reportData[0].lastUpdatedAt).toLocaleString() : "N/A"}`, 20, yPos + 10);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // Save the PDF
      doc.save(`IMEI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF downloaded successfully!");
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error generating PDF");
    }
  };

  // Refresh report function
  const handleRefresh = () => {
    fetchReportData();
  };

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header with logo and title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-14 w-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">IMEI Workflow Dashboard</h1>
              <p className="text-gray-600">Daily production tracking and quality control</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-blue-50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600">Total IMEIs Today</p>
              <p className="text-2xl font-bold text-blue-700">{reportData.length}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              
              <button
                onClick={generatePDF}
                disabled={isLoading || reportData.length === 0}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 transition duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <span className="mt-4 text-gray-600 text-lg">Loading report data...</span>
          </div>
        )}

        {/* No data state */}
        {!isLoading && reportData.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No report data available for today</h3>
            <p className="mt-2 text-gray-500">No IMEI workflow entries found.</p>
            <button
              onClick={handleRefresh}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Check Again
            </button>
          </div>
        )}

        {/* Report data table */}
        {!isLoading && reportData.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">QC Status</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {reportData[0]?.qcStatus || "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">IMEI Number</p>
                    <p className="text-xl font-mono font-bold text-green-900 mt-1 truncate">
                      {reportData[0]?.imeiNo || "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Last Updated</p>
                    <p className="text-lg font-bold text-purple-900 mt-1">
                      {reportData[0]?.lastUpdatedAt ? 
                        new Date(reportData[0].lastUpdatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                        "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 font-medium">Barcode Assigned</p>
                    <p className="text-lg font-bold text-orange-900 mt-1 truncate">
                      {reportData[0]?.workFlow?.barcode || "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">IMEI Workflow Details</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IMEI Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">QC Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Barcode</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Firmware</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Soldering</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Battery & Capacitor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">QC</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-bold text-gray-900 bg-gray-50 p-2 rounded border">
                            {item.imeiNo || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.qcStatus).bg} ${getStatusColor(item.qcStatus).text}`}>
                            {item.qcStatus || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.workFlow?.barcode || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.workFlow?.firmware).bg} ${getStatusColor(item.workFlow?.firmware).text}`}>
                            {item.workFlow?.firmware || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.workFlow?.soldering).bg} ${getStatusColor(item.workFlow?.soldering).text}`}>
                            {item.workFlow?.soldering || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.workFlow?.batteryAndCapacitor).bg} ${getStatusColor(item.workFlow?.batteryAndCapacitor).text}`}>
                            {item.workFlow?.batteryAndCapacitor || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.workFlow?.qc).bg} ${getStatusColor(item.workFlow?.qc).text}`}>
                            {item.workFlow?.qc || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.lastUpdatedAt ? 
                            <>
                              <div>{new Date(item.lastUpdatedAt).toLocaleDateString()}</div>
                              <div className="text-xs">{new Date(item.lastUpdatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </> : 
                            "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{reportData.length}</span> IMEI workflow{reportData.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Summary */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflow Progress Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Barcode", value: reportData[0]?.workFlow?.barcode || "N/A" },
                  { label: "Firmware", value: reportData[0]?.workFlow?.firmware || "N/A" },
                  { label: "Soldering", value: reportData[0]?.workFlow?.soldering || "N/A" },
                  { label: "Battery & Capacitor", value: reportData[0]?.workFlow?.batteryAndCapacitor || "N/A" },
                  { label: "QC", value: reportData[0]?.workFlow?.qc || "N/A" },
                  { label: "Overall QC", value: reportData[0]?.qcStatus || "N/A" }
                ].map((stage, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="text-sm text-gray-500 mb-1">{stage.label}</div>
                    <div className={`text-lg font-bold ${getStatusColor(stage.value).text}`}>
                      {stage.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmployeeReport;