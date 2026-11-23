import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, X, Hash, FileCheck2 } from "lucide-react";

function getNextAdmissionNo(students) {
  const nums = students
    .map((s) => parseInt(String(s.admissionNo || "").replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n) && n >= 1000 && n <= 9999);

  const maxNum = nums.length > 0 ? Math.max(...nums) : 1000;
  const next = Math.min(9999, maxNum + 1);
  return String(next).padStart(4, "0");
}

function getNextClassRollNo(students, batchName) {
  const cleanBatch = String(batchName || "")
    .trim()
    .toLowerCase();
  if (!cleanBatch) return "1";

  const sameClassStudents = students.filter(
    (s) =>
      String(s.batch || "")
        .trim()
        .toLowerCase() === cleanBatch,
  );

  if (sameClassStudents.length === 0) {
    return "1";
  }

  const rollNums = sameClassStudents
    .map((s) => {
      const raw = String(s.rollNo || "").trim();
      const tailMatch = raw.match(/(\d+)$/);
      return tailMatch ? parseInt(tailMatch[1], 10) : NaN;
    })
    .filter((n) => !Number.isNaN(n));

  const maxRoll =
    rollNums.length > 0 ? Math.max(...rollNums) : sameClassStudents.length;
  return String(maxRoll + 1);
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  students = [],
}) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const nextAdmNo = useMemo(() => getNextAdmissionNo(students), [students]);

  const [form, setForm] = useState({
    admissionNo: nextAdmNo,
    admissionDate: todayIso,
    batch: "10-A",
    rollNo: "1",
    name: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "Male",
    parentPhone: "",
    address: "",
    admissionFee: 3000,
    paidAmount: 0,
    dueAmount: 3000,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const autoAdm = getNextAdmissionNo(students);
    const autoRoll = getNextClassRollNo(students, "10-A");
    setForm({
      admissionNo: autoAdm,
      admissionDate: todayIso,
      batch: "10-A",
      rollNo: autoRoll,
      name: "",
      fatherName: "",
      motherName: "",
      dob: "",
      gender: "Male",
      parentPhone: "",
      address: "",
      admissionFee: 3000,
      paidAmount: 0,
      dueAmount: 3000,
    });
  }, [isOpen, students, todayIso]);

  if (!isOpen) return null;

  const handleBatchChange = (newBatch) => {
    const autoRoll = getNextClassRollNo(students, newBatch);
    setForm((prev) => ({
      ...prev,
      batch: newBatch,
      rollNo: autoRoll,
    }));
  };

  const handleAdmissionFeeChange = (rawVal) => {
    const totalFee = Math.max(0, Number(rawVal) || 0);
    setForm((prev) => {
      const paid = Math.max(0, Number(prev.paidAmount) || 0);
      const computedDue = Math.max(0, totalFee - paid);
      return {
        ...prev,
        admissionFee: totalFee,
        dueAmount: computedDue,
      };
    });
  };

  const handlePaidAmountChange = (rawVal) => {
    const paid = Math.max(0, Number(rawVal) || 0);
    setForm((prev) => {
      const totalFee = Math.max(0, Number(prev.admissionFee) || 0);
      const computedDue = Math.max(0, totalFee - paid);
      return {
        ...prev,
        paidAmount: paid,
        dueAmount: computedDue,
      };
    });
  };

  const handleDueAmountChange = (rawVal) => {
    const due = Math.max(0, Number(rawVal) || 0);
    setForm((prev) => ({
      ...prev,
      dueAmount: due,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rollNo.trim()) return;

    const admFee = Math.max(0, Number(form.admissionFee) || 0);
    const paidAmt = Math.max(0, Number(form.paidAmount) || 0);
    const dueAmt = Math.max(0, Number(form.dueAmount) || 0);

    setSubmitting(true);
    try {
      await onAddStudent({
        admissionNo: String(form.admissionNo || nextAdmNo).trim(),
        admissionDate: form.admissionDate || todayIso,
        rollNo: String(form.rollNo).trim(),
        name: form.name.trim().toUpperCase(),
        fatherName: form.fatherName.trim() || "Guardian",
        motherName: form.motherName.trim() || "Mother",
        dob: form.dob || "",
        gender: form.gender || "Male",
        parentPhone: form.parentPhone.trim() || "9876543210",
        address: form.address.trim() || "",
        batch: form.batch.trim() || "10-A",
        admissionFee: admFee,
        paidAmount: paidAmt,
        dueAmount: dueAmt,
        // Backward compatibility fields for existing components
        fee: admFee,
        feeStatus: dueAmt <= 0 ? "PAID" : "PENDING",
        dueMonths: dueAmt > 0 ? 1 : 0,
        attendance: "P",
        subjectAttendance: {
          maths: "P",
          physics: "P",
          chemistry: "P",
          english: "P",
        },
        marks: { maths: 0, physics: 0, chemistry: 0, english: 0 },
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#F7F3E8] border-2 border-[#18181B] rounded-2xl p-5 shadow-[6px_6px_0px_#18181B] my-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181B]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" /> STUDENT ADMISSION
              REGISTRATION FORM
            </p>
            <h3 className="text-lg sm:text-xl font-black flex items-center gap-2 mt-0.5">
              <UserPlus className="w-5 h-5" /> New Admission Form
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#18181B] bg-white hover:bg-rose-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Admission No (4-Digit Series), Date, Class & Auto Roll No */}
          <div className="p-3.5 rounded-2xl bg-amber-100/80 border-2 border-[#18181B] grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-black block mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Admission No. (4-Digit)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={form.admissionNo}
                onChange={(e) =>
                  setForm({ ...form, admissionNo: e.target.value })
                }
                className="w-full px-3 py-2 font-mono font-black border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-black block mb-1">Class / Batch *</label>
              <input
                type="text"
                required
                placeholder="10-A"
                value={form.batch}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full px-3 py-2 font-black border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-black block mb-1">
                Class Roll No. (Auto)
              </label>
              <input
                type="text"
                required
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                className="w-full px-3 py-2 font-black border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-black block mb-1">Admission Date</label>
              <input
                type="date"
                value={form.admissionDate}
                onChange={(e) =>
                  setForm({ ...form, admissionDate: e.target.value })
                }
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>
          </div>

          {/* Student Personal Details */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="ANKIT KUMAR"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">
                Parent WhatsApp Number *
              </label>
              <input
                type="text"
                required
                placeholder="9876543213"
                value={form.parentPhone}
                onChange={(e) =>
                  setForm({ ...form, parentPhone: e.target.value })
                }
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Father's Name *</label>
              <input
                type="text"
                required
                placeholder="Ramesh Kumar"
                value={form.fatherName}
                onChange={(e) =>
                  setForm({ ...form, fatherName: e.target.value })
                }
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Mother's Name</label>
              <input
                type="text"
                placeholder="Sunita Devi"
                value={form.motherName}
                onChange={(e) =>
                  setForm({ ...form, motherName: e.target.value })
                }
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Address / Mohalla</label>
              <input
                type="text"
                placeholder="Main Road, Giridih"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>
          </div>

          {/* Admission Fees + Paid Amount + Due Amount */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-[#18181B] space-y-2">
            <p className="font-black text-xs uppercase text-emerald-950">
              Admission Fee Payment Details (Partial Payment Supported)
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold block mb-1">
                  Admission Fees (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.admissionFee}
                  onChange={(e) => handleAdmissionFeeChange(e.target.value)}
                  className="w-full px-3 py-2 font-black border-2 border-[#18181B] rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.paidAmount}
                  onChange={(e) => handlePaidAmountChange(e.target.value)}
                  className="w-full px-3 py-2 font-black border-2 border-[#18181B] rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Due Amount (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.dueAmount}
                  onChange={(e) => handleDueAmountChange(e.target.value)}
                  className="w-full px-3 py-2 font-black border-2 border-[#18181B] rounded-xl bg-white text-rose-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-[#18181B] bg-white font-black"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#18181B] text-white font-black hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting
                ? "ADMISSION SAVE HO RAHA HAI..."
                : "COMPLETE ADMISSION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
