import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Printer, Download } from "lucide-react";
import logo from '../Images/logo.png'

// Mock the logo import and path for a single-file setup
// NOTE: In a real project, replace this with 'import logo from "../Images/logo.png";'
 

// --- Data Definition ---
const STICKER_DATA = {
    productName: "TRAXO ELITE",
    modelNo: "ELITE",
    partNo: "TRAXO101",
    tacNo: "CN8737",
    slNo: "TIA/102025A8030",
    imei: "862567079764424",
    iccidNo: "89915309040286761900",
    mfgDate: "Nov-2025",
    helpLine: "06782-260196 / 76828220204 / 7682820201",
    email: "info@traxoindia.in",
};

// --- Traxo Sticker Template Component (Hidden/Off-Screen) ---
// This component holds the structure to be captured by html2canvas
const TraxoStickerTemplate = React.forwardRef(({ data }, ref) => (
    <div
        ref={ref}
        // These styles place the template off-screen so it can be captured without being visible
        className="fixed top-0 left-0 -translate-x-full w-[480px] bg-white border border-gray-300 shadow-sm text-black"
        style={{ fontFamily: "Arial, sans-serif" }}
    >
        <div className="px-5 pt-3 pb-1">
          <div className="flex justify-center mb-1">
            <img 
              src={logo} 
              alt="Traxo Logo" 
              className="w-36 h-auto" 
              crossOrigin="anonymous" 
            />
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
            <p>ICCID NO : {data.iccidNo}</p>
          </div>
        </div>

        <div className="bg-[#ff9900] text-white text-center py-2.5 font-bold leading-tight">
          <h2 className="text-[15px] mb-[2px]">TRAXO INDIA AUTOMATION</h2>
          <p className="text-[14px] mb-[2px]">
            HELP LINE NO : {data.helpLine}
          </p>
          <p className="underline text-[15px]">{data.email}</p>
        </div>
    </div>
));


// --- PrintStickerForm Component (Integrated with download logic) ---
const PrintStickerForm = () => {
    const stickerRef = useRef(null); 
    
    // State is simplified
    const [stickerType, setStickerType] = useState('product'); // Default to 'product'
    const [quantity, setQuantity] = useState('');
    const [printQuality, setPrintQuality] = useState('high');
    const [isPrinting, setIsPrinting] = useState(false);

    const handleDownloadSticker = async (quantity) => {
        if (!stickerRef.current) return false;
        
        try {
            const canvas = await html2canvas(stickerRef.current, {
                scale: 2.5,
                useCORS: true,
                allowTaint: true,
            });

            canvas.toBlob((blob) => {
                saveAs(blob, `Traxo-Sticker-x${quantity}-${STICKER_DATA.imei}.png`);
            });
            return true;
        } catch (err) {
            console.error("Error creating sticker image:", err);
            alert("Error creating sticker image. Check console for details (CORS issue with logo is common).");
            return false;
        }
    };

    const handlePrint = async (e) => {
        e.preventDefault();
        
        if (!quantity || quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        setIsPrinting(true);
        
        // Simulate a brief delay before download starts
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const success = await handleDownloadSticker(quantity);
        
        setIsPrinting(false);
        
        if (success) {
            alert(`Successfully initiated download for ${quantity} sticker(s) at ${printQuality} quality.`);
        }
    };

    return (
        <div className="p-4 sm:p-8">
            {/* The hidden template component must be rendered to be captured */}
            <TraxoStickerTemplate ref={stickerRef} data={STICKER_DATA} />

            <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Printer size={28} />
                        Label & Sticker Printing System
                    </h3>
                    <p className="text-indigo-100 mt-2">Product labeling and identification</p>
                </div>

                <form onSubmit={handlePrint} className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sticker Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={stickerType}
                                onChange={(e) => setStickerType(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed focus:outline-none"
                                required
                                disabled
                            >
                                <option value="product">Product Information</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Number of stickers"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Batch Reference field removed */}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Print Quality
                        </label>
                        <div className="flex gap-4">
                            {['standard', 'high', 'premium'].map((quality) => (
                                <label key={quality} className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
                                    style={{ borderColor: printQuality === quality ? '#6366f1' : '#d1d5db', backgroundColor: printQuality === quality ? '#eef2ff' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="printQuality"
                                        value={quality}
                                        checked={printQuality === quality}
                                        onChange={(e) => setPrintQuality(e.target.value)}
                                        className="h-4 w-4 text-indigo-600"
                                    />
                                    <span className="text-sm font-medium capitalize">{quality}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {isPrinting && (
                        <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-xl text-center">
                            <span className="text-sm font-semibold text-gray-700 flex items-center justify-center gap-2">
                                <Download size={16} className="animate-bounce" />
                                **Generating sticker for download...**
                            </span>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                            onClick={() => {
                                setQuantity('');
                                setPrintQuality('high');
                            }}
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg"
                            disabled={isPrinting || !quantity}
                        >
                            {isPrinting ? 'Generating...' : <><Printer size={20} /> **Print Sticker (Download)**</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main App Component ---
function StickerApp() {
    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Traxo Product Sticker System</h1>
            <PrintStickerForm />
        </div>
    );
}

// Export the main component
export default StickerApp;