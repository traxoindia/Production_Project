import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import logo from "../Images/logo.png";
import { Download } from "lucide-react";

function TraxoStickerGenerator() {
  const stickerRef = useRef(null);

  const stickerData = {
    productName: "TRAXO ELITE",
    modelNo: "ELITE",
    partNo: "TRAXO101",
    tacNo: "CN8737",
    slNo: "TIA/102025A8030",
    imei: "862567079764424",
    iccidNo: "89915309040286761900",
    mfgDate: "Nov-2025",
    helpLine: "06782-260196 / 76828220204 / 7682820201",
    email: "info@traxo.in",
  };

  const handleDownloadSticker = async () => {
    try {
      const canvas = await html2canvas(stickerRef.current, {
        scale: 2.5,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        saveAs(blob, `Traxo-Sticker-${stickerData.imei}.png`);
      });
    } catch (err) {
      console.error(err);
      alert("Error creating sticker image.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-xl font-semibold mb-5">Traxo Sticker Generator</h1>

      <button
        onClick={handleDownloadSticker}
        className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
      >
        <Download size={18} />
        Download PNG
      </button>

      {/* STICKER */}
      <div
        ref={stickerRef}
        className="w-[480px] bg-white border border-gray-300 shadow-sm text-black"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* TOP SECTION */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex justify-center mb-1">
            <img src={logo} alt="Traxo Logo" className="w-36 h-auto" />
          </div>

          <h2 className="font-bold text-center text-[15px] mb-3">
            AIS 140 WITH IRNSS ICAT APPROVED VLTD
          </h2>

          {/* INFO BLOCK – tighter spacing */}
          <div className="space-y-[2px] text-[13px] font-semibold leading-tight">
            <p>PRODUCT NAME : {stickerData.productName}</p>
            <p>MODEL NO : {stickerData.modelNo}</p>
            <p>PART NO : {stickerData.partNo}</p>
            <p>TAC NO : {stickerData.tacNo}</p>

            <div className="flex justify-between pt-1">
              <p>SL NO : {stickerData.slNo}</p>
              <p>MFG. DATE : {stickerData.mfgDate}</p>
            </div>

            <p>IMEI : {stickerData.imei}</p>
            <p>ICCID NO : {stickerData.iccidNo}</p>
          </div>
        </div>

        {/* FOOTER – compact */}
        <div className="bg-[#ff9900] text-white text-center py-2.5 font-bold leading-tight">
          <h2 className="text-[15px] mb-[2px]">TRAXO INDIA AUTOMATION</h2>
          <p className="text-[14px] mb-[2px]">
            HELP LINE NO : {stickerData.helpLine}
          </p>
          <p className="underline text-[15px]">{stickerData.email}</p>
        </div>
      </div>
    </div>
  );
}

export default TraxoStickerGenerator;
