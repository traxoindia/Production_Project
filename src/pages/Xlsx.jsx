import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Xlsx = () => {
    // --- ADD THESE STATE DEFINITIONS ---
    const [selectedDate, setSelectedDate] = useState('');
    const [isDateLoading, setIsDateLoading] = useState(false);
    const [isExcelLoading, setIsExcelLoading] = useState(false);
    const [productionData, setProductionData] = useState([]);
    const [isModuleLoading, setIsModuleLoading] = useState(null); 

    // Define your API endpoints (ensure these match your backend)
    const API_BASE = "https://vanaras.onrender.com/api/v1/superadmin";
    const DATE_REPORT_API = `${API_BASE}/showAllDateReports`;

    // Helper to format date for your API
    const formatApiDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    };

    // --- Generate Excel Function ---
    const generateProductionExcel = (data) => {
        try {
            const reportItems = data.reports || [];
            // Use selectedDate here for the filename
            const fileName = `Production-Report-${selectedDate || 'Export'}.xlsx`;
            
            const excelData = reportItems.map((item, index) => ({
                "Sr. No.": index + 1,
                "IMEI Number": item.imeiNo || "N/A",
                "ICCID Number": item.firmwareDetails?.iccidNo || "N/A",
                "Serial Number": item.firmwareDetails?.slNo || "N/A"
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");
            
            XLSX.writeFile(workbook, fileName);
            toast.success("Excel Report Downloaded!");
        } catch (error) {
            toast.error("Excel Generation Failed");
        }
    };

    // --- Fetch Logic ---
    const fetchProductionReport = async (format = 'pdf') => {
        if (!selectedDate) {
            toast.warn("Please select a date first.");
            return;
        }

        format === 'excel' ? setIsExcelLoading(true) : setIsDateLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(DATE_REPORT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date: formatApiDate(selectedDate) }),
            });

            const result = await response.json();
            if (result.reports?.length > 0) {
                if (format === 'excel') generateProductionExcel(result);
                // else generateProductionPDF(result); // Uncomment if you have the PDF function
            } else {
                toast.info("No records found.");
            }
        } catch (error) {
            toast.error("Fetch failed");
        } finally {
            setIsDateLoading(false);
            setIsExcelLoading(false);
        }
    };

    return (
        <div className="p-10">
            <div className="bg-white rounded-3xl shadow-lg border p-6 max-w-sm">
                <label className="block text-sm font-semibold mb-2">Production Date</label>
                <input
                    type="date"
                    value={selectedDate} // This now works because state is defined above
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl mb-4"
                />

                <button
                    onClick={() => fetchProductionReport('excel')}
                    disabled={isExcelLoading || !selectedDate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                >
                    {isExcelLoading ? "Loading..." : <><BarChart3 size={20} /> Download Excel</>}
                </button>
            </div>
        </div>
    );
};

export default Xlsx;