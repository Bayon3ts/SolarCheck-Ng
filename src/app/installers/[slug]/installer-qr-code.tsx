"use client";

import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, QrCode } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface InstallerQRCodeProps {
  installerName: string;
  installerSlug: string;
}

export default function InstallerQRCode({ installerName, installerSlug }: InstallerQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    setProfileUrl(`${window.location.origin}/installers/${installerSlug}`);
  }, [installerSlug]);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${installerSlug}-qr-code.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    const windowContent = '<!DOCTYPE html>' +
      '<html>' +
      '<head><title>Print QR Code</title></head>' +
      '<body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">' +
      `<h1 style="margin-bottom:1rem;text-align:center;font-size:2rem;color:#111;">${installerName}</h1>` +
      '<p style="margin-bottom:2rem;color:#666;font-size:1.25rem;">Scan to view our verified profile on SolarCheck</p>' +
      `<img src="${dataUrl}" style="width: 300px; height: 300px;" />` +
      '</body>' +
      '</html>';
    
    const printWin = window.open('', '', 'width=800,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      printWin.focus();
      // Need to wait for image to load before printing
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 250);
    }
  };

  if (!profileUrl) return null; // Avoid hydration mismatch on server

  return (
    <div className="card p-6 relative overflow-hidden flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-4 w-full justify-start">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-text-primary">Profile QR Code</h3>
      </div>
      
      <p className="text-sm text-text-muted mb-6 text-left w-full">
        Print or download this QR code for your van, business cards, or invoices so customers can scan and view your profile instantly.
      </p>

      <div 
        ref={qrRef} 
        className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 mb-6 inline-block"
      >
        <QRCodeCanvas 
          value={profileUrl} 
          size={180}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"}
          includeMargin={false}
        />
      </div>

      <div className="flex gap-3 w-full">
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2 font-medium"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 flex items-center justify-center gap-2 font-bold bg-primary text-white hover:bg-primary/90"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
