"use client"

import {jsPDF} from "jspdf";
import {ReceiptIcon} from "lucide-react";
import {formatRupiah} from "@/lib/currency";

type ReceiptData = {
  applicationId: string;
  vendorName: string;
  businessName: string;
  bazaarTitle: string;
  areaName: string;
  slotNumber: number | null;
  paymentConfirmedAt: Date | string | null;
  pricePerSlot: number;
  platformFee: number;
  grandTotal: number;
}

export function DownloadReceiptButton({data}:{data:ReceiptData}) {
    function handleDownload(){
        const doc = new jsPDF({unit: "mm", format:"a5"})
        const left = 15;
        const right = 133;
        let y = 22;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("BazzUp", left, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("Bukti Pembayaran", left, y + 5);
        doc.text(
        `No. ${data.applicationId.slice(-8).toUpperCase()}`,
        right,
        y + 5,
        { align: "right" },
        );

        y += 12;
        doc.setDrawColor(220);
        doc.line(left, y, right, y);

        // Detail
        y += 10;
        doc.setTextColor(40);
        doc.setFontSize(10);

        const paymentConfirmedAtText = data.paymentConfirmedAt
        ? new Intl.DateTimeFormat("id-ID", {
            dateStyle: "long",
            timeStyle: "short",
            }).format(new Date(data.paymentConfirmedAt))
        : "-";
        const rows: [string, string][] = [
        ["Nama Owner", data.vendorName],
        ["Nama Usaha", data.businessName],
        ["Bazaar", data.bazaarTitle],
        ["Area", data.areaName],
        ["Nomor Slot", data.slotNumber ? `No. ${data.slotNumber}` : "-"],
        ["Waktu Pembayaran", paymentConfirmedAtText],
        ["Metode Pembayaran", "-"],
        ];

        for (const [label, value] of rows) {
        doc.setTextColor(120);
        doc.text(label, left, y);
        doc.setTextColor(40);
        doc.text(value, right, y, { align: "right" });
        y += 7;
        }

        // Rincian biaya
        y += 4;
        doc.setDrawColor(220);
        doc.line(left, y, right, y);
        y += 9;

        const fees: [string, number][] = [
        ["Harga slot", data.pricePerSlot],
        ["Biaya platform", data.platformFee],
        ];

        for (const [label, value] of fees) {
        doc.setTextColor(120);
        doc.text(label, left, y);
        doc.setTextColor(40);
        doc.text(formatRupiah(value), right, y, { align: "right" });
        y += 7;
        }

        y += 2;
        doc.line(left, y, right, y);
        y += 9;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(20);
        doc.text("Total", left, y);
        doc.text(formatRupiah(data.grandTotal), right, y, { align: "right" });

        // Footer
        y += 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
        "Dokumen ini dibuat otomatis dan sah tanpa tanda tangan.",
        left,
        y,
        );

        doc.save(`receipt-${data.vendorName.slice(-8).toUpperCase()}.pdf`);
    
    }

        return (
        <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 rounded-lg border border-[#EEE4FA] bg-white px-3 py-1.5 text-xs text-[#3B1F4A]"
        >
        <ReceiptIcon className="size-3.5 text-green-700" />
        Download Receipt
        </button>
    );
}