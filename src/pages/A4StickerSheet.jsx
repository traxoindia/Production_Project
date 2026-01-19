import React from "react";
import logo from "../Images/logo.png";

/**
 * A4 SIZE: 794px × 1123px (96 DPI)
 * STICKER SIZE: 355px × 219px
 * LAYOUT: 2 Columns × 4 Rows = 8 Stickers
 */

const Sticker = ({ data }) => {
  return (
    <div style={{
      width: "355px",
      height: "219px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* TOP */}
      <div style={{ padding: "10px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <img src={logo} alt="Traxo" style={{ width: "120px" }} />
        </div>

        <div style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "13px",
          marginBottom: "8px"
        }}>
          AIS 140 WITH IRNSS ICAT APPROVED VLTD
        </div>

        <div style={{ fontSize: "12px", fontWeight: "bold", lineHeight: "1.3" }}>
          <div>PRODUCT NAME : {data.productName}</div>
          <div>MODEL NO : {data.modelNo}</div>
          <div>PART NO : {data.partNo}</div>
          <div>TAC NO : {data.tacNo}</div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>SL NO : {data.slNo}</span>
            <span>MFG. DATE : {data.mfgDate}</span>
          </div>

          <div>IMEI : {data.imei}</div>
          <div>ICCID NO : {data.iccidNo}</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: "#ff9900",
        color: "#fff",
        textAlign: "center",
        padding: "8px",
        fontWeight: "bold"
      }}>
        <div style={{ fontSize: "13px" }}>TRAXO INDIA AUTOMATION</div>
        <div style={{ fontSize: "12px" }}>
          HELP LINE NO : 06782-260196 / 76828220204 / 7682820201
        </div>
        <div style={{ fontSize: "13px", textDecoration: "underline" }}>
          info@traxo.in
        </div>
      </div>
    </div>
  );
};

const A4StickerSheet = ({ stickers }) => {
  return (
    <div style={{
      width: "794px",
      height: "1123px",
      background: "#fff",
      padding: "20px 30px",
      boxSizing: "border-box",
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      gap: "15px 25px"
    }}>
      {stickers.slice(0, 8).map((item, index) => (
        <div key={index} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Sticker data={item} />
        </div>
      ))}
    </div>
  );
};

export default A4StickerSheet;
