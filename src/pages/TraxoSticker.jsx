import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import logo from '../Images/logo.png'
import { Download, Sparkles } from "lucide-react"; // Using Sparkles as a placeholder for the Traxo logo if you don't use the logo file directly

// Component to generate the Traxo Sticker
function TraxoStickerGenerator() {
  // Ref to the sticker content div
  const stickerRef = useRef(null);

  // Sticker Data (Extracted from the image)
  const stickerData = {
    productName: "TRAXO ELITE",
    modelNo: "ELITE",
    partNo: "TRAXO101",
    tacNo: "CN8737",
    slNo: "TIA/102025A8030",
    imei: "862567079764424",
    iccidNo: "89915309040286761900",
    mfgDate: "Nov-2025",
    helpLine: "06782-260196/76828220204/7682820201",
    email: "info@traxo.in",
  };

  /**
   * Converts the HTML content of the sticker into a downloadable PNG file.
   */
  const handleDownloadSticker = async () => {
    if (stickerRef.current) {
      try {
        const canvas = await html2canvas(stickerRef.current, {
          scale: 3, // Increase scale for higher resolution
          useCORS: true, // Needed if you use an external image for the logo
          logging: false,
        });

        // Convert canvas to Blob and save as a PNG file
        canvas.toBlob((blob) => {
          saveAs(blob, `Traxo-Sticker-${stickerData.imei}.png`);
        }, "image/png");
      } catch (error) {
        console.error("Error generating sticker image:", error);
        alert("Failed to generate image. Check console for details.");
      }
    }
  };

  // The `TraxoLogo` component helps replicate the top section
  const TraxoLogo = () => (
    <div className="flex flex-col items-center pb-4 pt-2">
       <img src={logo} alt="Traxo Logo" className="w-44 h-auto" />
    </div>
  );

  return (
    <div className="p-8 flex flex-col items-center bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Download Traxo Sticker Generator
      </h1>

      {/* Download Button */}
      <button
        onClick={handleDownloadSticker}
        className="mb-8 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        <Download size={20} />
        Download Sticker as PNG
      </button>
      
      {/* Sticker Content (The element to be captured) 
        This div is styled to match the provided image as closely as possible.
      */}
      <div
        ref={stickerRef}
        className="w-[500px] border border-gray-300 shadow-xl bg-white text-black text-sm"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Top Section */}
        <div className="p-4">
          <TraxoLogo />
          
          <h3 className="text-center font-bold text-lg mt-2 mb-4">
            AIS 140 WITH IRNSS ICAT APPROVED VLTD
          </h3>

          <div className="space-y-1 font-semibold">
            <p>PRODUCT NAME : {stickerData.productName}</p>
            <p>MODEL NO : {stickerData.modelNo}</p>
            <p>PART NO : {stickerData.partNo}</p>
            <p>TAC NO : {stickerData.tacNo}</p>
            <div className="flex justify-between items-center pt-2">
              <p>SL NO : {stickerData.slNo}</p>
              <p>MFG. DATE : {stickerData.mfgDate}</p>
            </div>
            <p>IMEI : {stickerData.imei}</p>
            <p>ICCID NO : {stickerData.iccidNo}</p>
          </div>
        </div>

        {/* Footer Section (Orange/Yellow Bar) */}
        <div className="bg-[#ff9900] text-center p-3 text-white font-bold">
          <h2 className="text-xl mb-1">TRAXO INDIA AUTOMATION</h2>
          <p className="text-lg mb-1">
            HELP LINE NO : {stickerData.helpLine}
          </p>
          <p className="text-xl">
            EMAIL ID : <span className="underline">{stickerData.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TraxoStickerGenerator;