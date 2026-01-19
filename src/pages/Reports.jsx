import React, { useState, useEffect } from 'react';
import {
    Download,
    Calendar,
    FileCheck,
    AlertCircle,
    ClipboardCheck,
    Settings,
    Layers,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    ChevronDown,
    ChevronUp,
    Filter,
    Printer,
    FileText,
    BarChart3,
    Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../Images/logo.png';
import approvedStamp from '../Images/Approved.png';
import SIGN from '../Images/SIGN.png';
import Navbar1 from './Navbar1';
import AssemblyChecklist from './AssemblyChecklist';
import EmployeeReport from './EmployeeReport';

// QC Point mappings with descriptions
const QC_POINTS_MAPPING = {
    probePin: {
        label: '1. PCB S.No.',
        description: 'Verify PCB Serial Number',
        field: 'probePin'
    },
    powerSupply: {
        label: '2. Device ID Check',
        description: 'Check device ID on server for GPS, GSM signal',
        field: 'powerSupply'
    },
    capacitorBackup: {
        label: '3. Device & Battery Status',
        description: 'Check status of connection & battery status in server',
        field: 'capacitorBackup'
    },
    terminal: {
        label: '4. LED Signal Stability',
        description: 'Check LED indication for stability of signal',
        field: 'terminal'
    },
    signalIntegraty: {
        label: '5. PCB Tightness',
        description: 'Check PCB tightness & screw on PCB',
        field: 'signalIntegraty'
    },
    cabelStrain: {
        label: '6. Conformal Coating',
        description: 'Conformal coating on both sides & check solder balls',
        field: 'cabelStrain'
    },
    ledCheck: {
        label: '7. S.No. on PCA',
        description: 'Check for the serial number on PCA',
        field: 'ledCheck'
    },
    gpsClod: {
        label: '8. Glue & Cable Routing',
        description: 'Check for glue application and proper cable routing',
        field: 'gpsClod'
    },
    gsmNetwork: {
        label: '9. Product Cleanliness',
        description: 'Check for damage, dust, cleanliness & cabinet screws',
        field: 'gsmNetwork'
    },
    productId: {
        label: '10. Product ID/IMEI Match',
        description: 'Verify Product ID/IMEI match on sticker',
        field: 'productId'
    },
    physicallyAssembly: {
        label: '11. Firmware Version',
        description: 'Firmware version consistency check',
        field: 'physicallyAssembly'
    },
    housingSeal: {
        label: '12. Physical Assembly',
        description: 'Physical assembly integrity (screw torque)',
        field: 'housingSeal'
    },
    labelPlaceMent: {
        label: '13. Glue & Cable Routing',
        description: 'Check glue application and proper cable routing',
        field: 'labelPlaceMent'
    },
    qrCodeRelaliablty: {
        label: '14. LED Signal Verification',
        description: 'Verify LED indication for signal stability',
        field: 'qrCodeRelaliablty'
    },
    finalVisualInspection: {
        label: '15. PCB Serial Verification',
        description: 'Verify PCB serial number',
        field: 'finalVisualInspection'
    },
    packingMatarialIntegraty: {
        label: '17. Packing Material',
        description: 'Packing material integrity check',
        field: 'packingMatarialIntegraty'
    }
};

const QC_REQUIRED_FIELDS = Object.keys(QC_POINTS_MAPPING);

const Reports = () => {
    const [isDateLoading, setIsDateLoading] = useState(false);
    const [isModuleLoading, setIsModuleLoading] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [qcData, setQcData] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [productionData, setProductionData] = useState([]);

    // API Endpoints
    const API_BASE = "https://vanaras.onrender.com/api/v1/superadmin";
    const DATE_REPORT_API = `${API_BASE}/showAllDateReports`;
    const QC_REPORT_API = `${API_BASE}/fetchQCReport`;
    const ASSEMBLY_REPORT_API = `${API_BASE}/reports/assemble-firmware`;

    const formatApiDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    };

    // Check if QC item passes all requirements
    const checkQcPass = (item) => {
        return QC_REQUIRED_FIELDS.every(field => item[field] === true);
    };

    // Toggle row expansion
    const toggleRowExpansion = (index) => {
        setExpandedRows(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    // Filter data based on status and search
    const filteredData = qcData.filter(item => {
        const passes = checkQcPass(item);

        // Status filter
        if (filterStatus === 'pass' && !passes) return false;
        if (filterStatus === 'fail' && passes) return false;

        // Search filter
        if (searchTerm) {
            const imei = item.imeiNo?.toLowerCase() || '';
            return imei.includes(searchTerm.toLowerCase());
        }

        return true;
    });

    // Generate Production Report PDF
    const generateProductionPDF = (data, title) => {
        try {
            const doc = new jsPDF();
            const reportDate = data.normalizedDate || selectedDate || new Date().toISOString().split('T')[0];

            const reportItems = data.reports || data.qcReport || [];

            // Logo at top center
            const pageWidth = doc.internal.pageSize.getWidth();
            const logoWidth = 40;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logo, 'PNG', logoX, 10, logoWidth, 15);

            // Title
            doc.setFontSize(18);
            doc.setTextColor(31, 41, 55);
            doc.text(title, pageWidth / 2, 35, { align: 'center' });

            // Report info
            doc.setFontSize(10);
            doc.text(`Report Date: ${reportDate}`, 14, 45);
            doc.text(`Total Units: ${data.count || reportItems.length}`, 14, 52);

            // Production Table
            autoTable(doc, {
                startY: 60,
                head: [["#", "IMEI NO", "ICCID NO", "SERIAL NO"]],
                body: reportItems.map((item, index) => [
                    index + 1,
                    item.imeiNo || "N/A",
                    item.firmwareDetails?.iccidNo || "N/A",
                    item.firmwareDetails?.slNo || "N/A"
                ]),
                headStyles: {
                    fillColor: [31, 41, 55],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' }, // #
                    1: { cellWidth: 50, halign: 'center' }, // IMEI
                    2: { cellWidth: 65, halign: 'center' }, // ICCID
                    3: { cellWidth: 60, halign: 'center' }  // Serial
                },
                margin: { left: 14, right: 14 },
                theme: 'grid',
                styles: { overflow: 'linebreak' }
            });

            // Footer with stamp and signature
            const pageHeight = doc.internal.pageSize.height;
            doc.addImage(approvedStamp, 'PNG', 150, pageHeight - 60, 40, 40);
            doc.addImage(SIGN, 'PNG', 20, pageHeight - 45, 30, 15);
            doc.setFontSize(10);
            doc.text("Authorized Signature", 20, pageHeight - 25);

            doc.save(`${title.replace(/\s+/g, '-')}-${reportDate}.pdf`);
            toast.success(`Production Report Downloaded Successfully`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    // Generate QC Report PDF
    const generateQCReportPDF = (data, title) => {
        try {
            const doc = new jsPDF('landscape');
            const reportDate = data.normalizedDate || selectedDate || new Date().toISOString().split('T')[0];

            const reportItems = data.qcReport || data.reports || [];

            // Logo at top center
            const pageWidth = doc.internal.pageSize.getWidth();
            const logoWidth = 40;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logo, 'PNG', logoX, 10, logoWidth, 15);

            // Title
            doc.setFontSize(16);
            doc.setTextColor(31, 41, 55);
            doc.text(`${title} - Detailed Report`, pageWidth / 2, 35, { align: 'center' });

            // Report info
            doc.setFontSize(10);
            doc.text(`Report Date: ${reportDate}`, 14, 45);
            doc.text(`Total Records: ${data.count || reportItems.length}`, 14, 52);

            const passedCount = reportItems.filter(item => checkQcPass(item)).length;
            const failedCount = reportItems.length - passedCount;
            doc.text(`Passed: ${passedCount}`, 80, 45);
            doc.text(`Failed: ${failedCount}`, 80, 52);

            // Summary Table
            autoTable(doc, {
                startY: 58,
                head: [["#", "IMEI", "Status", "Date", "Overall Result"]],
                body: reportItems.map((item, index) => [
                    index + 1,
                    item.imeiNo || "N/A",
                    checkQcPass(item) ? "PASS" : "FAIL",
                    item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
                    checkQcPass(item) ? "✓ PASS" : "✗ FAIL"
                ]),
                headStyles: {
                    fillColor: [31, 41, 55],
                    textColor: [255, 255, 255]
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                styles: { fontSize: 8 },
                theme: 'grid',
                margin: { left: 14, right: 14 }
            });

            // Detailed QC Points for each item
            reportItems.forEach((item, itemIndex) => {
                if (itemIndex > 0) doc.addPage('landscape');

                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55);
                doc.text(`Detailed QC Check - IMEI: ${item.imeiNo}`, 14, 20);

                doc.setFontSize(10);
                doc.text(`Date: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}`, 14, 28);
                doc.text(`Overall Result: ${checkQcPass(item) ? "PASS ✓" : "FAIL ✗"}`, 14, 35);

                const qcPoints = Object.entries(QC_POINTS_MAPPING).map(([key, config]) => [
                    config.label,
                    item[key] ? "PASS" : "FAIL",
                    config.description
                ]);

                autoTable(doc, {
                    startY: 40,
                    head: [["QC Point", "Status", "Description"]],
                    body: qcPoints,
                    headStyles: {
                        fillColor: [31, 41, 55],
                        textColor: [255, 255, 255]
                    },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 20, halign: 'center' },
                        2: { cellWidth: 120 }
                    },
                    didParseCell: (data) => {
                        if (data.row.index > 0 && data.column.index === 1) {
                            data.cell.styles.textColor = data.cell.raw === "PASS" ? [0, 128, 0] : [220, 38, 38];
                        }
                    },
                    styles: { fontSize: 8 },
                    margin: { left: 14 }
                });

                // Footer on each page
                const pageHeight = doc.internal.pageSize.height;
                doc.addImage(approvedStamp, 'PNG', 220, pageHeight - 50, 40, 40);
                doc.addImage(SIGN, 'PNG', 20, pageHeight - 45, 30, 15);
                doc.setFontSize(10);
                doc.text("Authorized Signature", 20, pageHeight - 25);
            });

            doc.save(`QC-Report-${reportDate}.pdf`);
            toast.success(`QC Report Downloaded Successfully`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    // Fetch Production Report
    const fetchProductionReport = async () => {
        if (!selectedDate) {
            toast.warn("Please select a date first.");
            return;
        }

        setIsDateLoading(true);
        const token = localStorage.getItem("token");
        const formattedDate = formatApiDate(selectedDate);

        try {
            const response = await fetch(DATE_REPORT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date: formattedDate }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "No data found");
            }

            if (result.reports?.length > 0) {
                setProductionData(result.reports);
                generateProductionPDF(result, "Production Report");
            } else {
                toast.info("No production records found for this date");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDateLoading(false);
        }
    };

    // Fetch QC Report
    const fetchQCReport = async () => {
        if (!selectedDate) {
            toast.warn("Please select a date first.");
            return;
        }

        setIsModuleLoading('QC');
        const token = localStorage.getItem("token");
        const formattedDate = formatApiDate(selectedDate);

        try {
            const response = await fetch(QC_REPORT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date: formattedDate }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch QC data");
            }

            if (result.qcReport?.length > 0) {
                setQcData(result.qcReport);
                toast.success(`${result.qcReport.length} QC records loaded`);
            } else {
                setQcData([]);
                toast.info("No QC records found for this date");
            }
        } catch (error) {
            toast.error(error.message);
            setQcData([]);
        } finally {
            setIsModuleLoading(null);
        }
    };

    const handleQCReportDownload = async () => {
        if (!selectedDate) {
            toast.warn("Please select a date first.");
            return;
        }

        const token = localStorage.getItem("token");
        const formattedDate = formatApiDate(selectedDate);

        try {
            const response = await fetch(QC_REPORT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date: formattedDate }),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch QC data");
            }

            if (result.qcReport?.length > 0) {
                generateQCReportPDF(result, "QC Report");
            } else {
                toast.info("No QC records found for this date");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAssemblyDownload = async () => {
        setIsModuleLoading('Assembly');
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(ASSEMBLY_REPORT_API, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`Failed to fetch report`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Assembly-Report.pdf`);
            link.click();
            toast.success(`Assembly Report Downloaded`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsModuleLoading(null);
        }
    };

    // Calculate statistics
    const totalPassed = qcData.filter(item => checkQcPass(item)).length;
    const totalFailed = qcData.filter(item => !checkQcPass(item)).length;
    const passRate = qcData.length > 0 ? ((totalPassed / qcData.length) * 100).toFixed(1) : 0;

    return (
        <>
            <Navbar1 />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                                    All Production Reports
                                </h1>
                                <p className="text-slate-600 mt-2 font-medium">
                                    Comprehensive QC tracking and production reports
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 rounded-2xl px-6 py-3">
                                    <div className="text-sm text-slate-500">Today's Date</div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {new Date().toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Panel - Controls */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Date Selection Card */}
                            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={28} className="text-blue-200" />
                                        <h2 className="text-xl font-bold">Select Report Date</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Production Date
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={fetchProductionReport}
                                            disabled={isDateLoading || !selectedDate}
                                            className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDateLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={20} />
                                                    Production Report PDF
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={fetchQCReport}
                                            disabled={isModuleLoading === 'QC' || !selectedDate}
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isModuleLoading === 'QC' ? "Loading..." : "View QC Data"}
                                        </button>

                                        <button
                                            onClick={handleQCReportDownload}
                                            disabled={!selectedDate}
                                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FileText size={20} />
                                            QC PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Card */}
                            {qcData.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <BarChart3 size={20} />
                                        QC Statistics
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Total Units</span>
                                            <span className="text-xl font-bold text-slate-800">{qcData.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Passed</span>
                                            <span className="text-xl font-bold text-green-600">{totalPassed}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Failed</span>
                                            <span className="text-xl font-bold text-red-600">{totalFailed}</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Pass Rate</span>
                                                <span className="text-2xl font-bold text-blue-600">{passRate}%</span>
                                            </div>
                                            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${passRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - QC Data Display */}
                        <div className="lg:col-span-2">
                            {qcData.length > 0 ? (
                                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-200">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">
                                                    QC Inspection Details
                                                </h3>
                                                <p className="text-slate-500 text-sm">
                                                    {selectedDate} • {qcData.length} units
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search IMEI..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="all">All Status</option>
                                                    <option value="pass">Passed Only</option>
                                                    <option value="fail">Failed Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="text-left p-4 text-sm font-semibold text-slate-600">IMEI NO</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Date</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredData.map((item, index) => {
                                                    const passes = checkQcPass(item);
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${expandedRows.includes(index) ? 'bg-blue-50' : ''}`}>
                                                                <td className="p-4">
                                                                    <div className="font-mono font-bold text-slate-800">
                                                                        {item.imeiNo || "N/A"}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${passes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {passes ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                                        <span className="font-bold">{passes ? 'PASS' : 'FAIL'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="text-sm text-slate-600">
                                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <button
                                                                        onClick={() => toggleRowExpansion(index)}
                                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                                                                    >
                                                                        {expandedRows.includes(index) ? (
                                                                            <>
                                                                                <ChevronUp size={18} />
                                                                                Hide Details
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ChevronDown size={18} />
                                                                                View Details
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            {expandedRows.includes(index) && (
                                                                <tr className="bg-blue-50">
                                                                    <td colSpan={4} className="p-6">
                                                                        <div className="bg-white rounded-xl p-6 shadow-inner">
                                                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                                                <FileCheck size={20} />
                                                                                Detailed QC Points for IMEI: {item.imeiNo}
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                {Object.entries(QC_POINTS_MAPPING).map(([key, config]) => (
                                                                                    <div
                                                                                        key={key}
                                                                                        className={`p-4 rounded-lg border ${item[key] ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                                                                                    >
                                                                                        <div className="flex items-start justify-between">
                                                                                            <div>
                                                                                                <div className="font-bold text-slate-800">
                                                                                                    {config.label}
                                                                                                </div>
                                                                                                <div className="text-sm text-slate-600 mt-1">
                                                                                                    {config.description}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className={`flex items-center gap-1 ${item[key] ? 'text-green-600' : 'text-red-600'}`}>
                                                                                                {item[key] ? (
                                                                                                    <>
                                                                                                        <CheckCircle size={20} />
                                                                                                        <span className="font-bold">PASSED</span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <XCircle size={20} />
                                                                                                        <span className="font-bold">FAILED</span>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="mt-6 pt-6 border-t border-slate-200">
                                                                                <div className="flex justify-between items-center">
                                                                                    <div>
                                                                                        <span className="text-slate-600">Overall Result:</span>
                                                                                        <span className={`ml-2 font-bold text-lg ${passes ? 'text-green-600' : 'text-red-600'}`}>
                                                                                            {passes ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const singleReport = {
                                                                                                qcReport: [item],
                                                                                                normalizedDate: selectedDate
                                                                                            };
                                                                                            generateQCReportPDF(singleReport, `QC-Report-${item.imeiNo}`);
                                                                                        }}
                                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                                                    >
                                                                                        <Download size={16} />
                                                                                        Download This Report
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-16 text-center">
                                    <div className="max-w-md mx-auto">
                                        <FileCheck size={64} className="mx-auto text-slate-300 mb-6" />
                                        <h3 className="text-xl font-bold text-slate-700 mb-3">
                                            No QC Data Available
                                        </h3>
                                        <p className="text-slate-500 mb-8">
                                            Select a date and click "View QC Data" to load quality control reports
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-blue-600">
                                            <AlertCircle size={20} />
                                            <span>Data will appear here after loading</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assembly Report Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100">



                        <AssemblyChecklist />

                    </div>

                </div>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100">



                    <EmployeeReport />

                </div>
            </div>
        </>
    );
};

export default Reports;