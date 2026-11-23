import React, { useEffect, useState } from "react";
import { Printer, Receipt } from "lucide-react";
import { printHtmlAsPdf } from "../utils/printDocument";

export default function ReceiptGenerator({ students, instituteName }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id || "");
  const [receiptNo, setReceiptNo] = useState("REC-2026-4471");
  const [feeMonth, setFeeMonth] = useState("November 2026");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [amountPaid, setAmountPaid] = useState(students[0]?.fee || 3000);
  const [remarks, setRemarks] = useState("Monthly Tuition Fee");

  useEffect(() => {
    if (!students.length) return;
    const found = students.find((s) => s.id === selectedId);
    if (!found) {
      setSelectedId(students[0].id);
      setAmountPaid(students[0].fee);
    }
  }, [students, selectedId]);

  const selectedStudent =
    students.find((s) => s.id === selectedId) || students[0];

  const handleStudentChange = (id) => {
    setSelectedId(id);
    const st = students.find((item) => item.id === id);
    if (st) setAmountPaid(st.fee);
  };

  const generateReceiptPdf = () => {
    if (!selectedStudent) return;
    const today = new Date().toLocaleDateString("en-IN");
    const html = `
      <div class="header">
        <h1>${instituteName}</h1>
        <p>Coaching &amp; Academic Institute · Official Fee Receipt</p>
        <div class="badge">FEE RECEIPT</div>
      </div>
      <div class="meta">
        <span>Receipt No: ${receiptNo}</span>
        <span>Date: ${today}</span>
      </div>
      <table>
        <tr><th>Student Name</th><td>${selectedStudent.name}</td><th>Roll No</th><td>${selectedStudent.rollNo}</td></tr>
        <tr><th>Father's Name</th><td>${selectedStudent.fatherName}</td><th>Batch</th><td>${selectedStudent.batch}</td></tr>
        <tr><th>Fee Month</th><td>${feeMonth}</td><th>Payment Mode</th><td>${paymentMode}</td></tr>
      </table>
      <table>
        <thead>
          <tr><th>Sr.</th><th>Particulars</th><th style="text-align:right;">Amount (INR)</th></tr>
        </thead>
        <tbody>
          <tr><td>01</td><td>${remarks} (${feeMonth})</td><td style="text-align:right;">₹${Number(amountPaid).toLocaleString("en-IN")}.00</td></tr>
          <tr><th colspan="2" style="text-align:right;">TOTAL RECEIVED</th><th style="text-align:right;">₹${Number(amountPaid).toLocaleString("en-IN")}.00</th></tr>
        </tbody>
      </table>
      <p style="font-size:12px;margin-top:10px;">Status: <strong>PAID</strong> · Generated digitally.</p>
      <div class="signatures">
        <div class="sig-line">Parent / Student Sign</div>
        <div class="sig-line">Authorized Signature</div>
      </div>
    `;
    printHtmlAsPdf(`Fee_Receipt_${selectedStudent.name}_${receiptNo}`, html);
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-700" /> PDF Fee Receipt
          Generator
        </h3>
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 border border-[#18181B]">
          PDF READY
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold block mb-1">
            Student Chunein
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.batch})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Receipt Number</label>
          <input
            type="text"
            value={receiptNo}
            onChange={(e) => setReceiptNo(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-[#18181B] rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Fee Month</label>
          <input
            type="text"
            value={feeMonth}
            onChange={(e) => setFeeMonth(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-[#18181B] rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-[#18181B] rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
          >
            <option value="UPI">UPI / QR</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Remarks</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-[#18181B] rounded-xl"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={generateReceiptPdf}
        className="px-4 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-black flex items-center gap-2 hover:bg-zinc-800"
      >
        <Printer className="w-4 h-4" /> DOWNLOAD FEE RECEIPT PDF
      </button>
    </div>
  );
}
