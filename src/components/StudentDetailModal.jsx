import React, { useEffect, useState } from "react";
import { X, ShieldAlert, Check } from "lucide-react";

export default function StudentDetailModal({
  student,
  onClose,
  onSaveModifiedStudent,
}) {
  const [form, setForm] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0); // 0 = editing, 1 = first confirm, 2 = final confirm

  useEffect(() => {
    if (!student) return;
    setForm({
      name: student.name || "",
      fatherName: student.fatherName || "",
      parentPhone: student.parentPhone || "",
      batch: student.batch || "10-A",
      fee: Number(student.fee || 0),
      feeStatus: student.feeStatus || "PENDING",
      dueMonths: Number(student.dueMonths || 0),
      attendance: student.attendance || "P",
    });
    setConfirmStep(0);
  }, [student]);

  if (!student || !form) return null;

  const handleFinalSave = () => {
    onSaveModifiedStudent({
      ...student,
      name: form.name.trim().toUpperCase(),
      fatherName: form.fatherName.trim(),
      parentPhone: form.parentPhone.trim(),
      batch: form.batch.trim(),
      fee: Math.max(0, Number(form.fee) || 0),
      feeStatus: form.feeStatus,
      dueMonths:
        form.feeStatus === "PAID"
          ? 0
          : Math.max(1, Number(form.dueMonths) || 1),
      attendance: form.attendance,
    });
    setConfirmStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#F7F3E8] border-2 border-[#18181B] rounded-2xl p-5 shadow-[6px_6px_0px_#18181B] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181B]">
          <div>
            <p className="text-[11px] font-black uppercase text-zinc-600">
              STUDENT DETAIL &amp; MODIFICATION · ROLL {student.rollNo}
            </p>
            <h3 className="text-xl font-black">{student.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#18181B] bg-white hover:bg-rose-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section-wise Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs font-black">
          <div className="p-2.5 rounded-xl bg-amber-100 border border-[#18181B]">
            FEES: ₹{Number(form.fee).toLocaleString("en-IN")} ({form.feeStatus})
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-100 border border-[#18181B]">
            ATTENDANCE: {form.attendance === "P" ? "PRESENT" : "ABSENT"}
          </div>
          <div className="p-2.5 rounded-xl bg-sky-100 border border-[#18181B]">
            TOTAL MARKS:{" "}
            {Number(student.marks?.maths || 0) +
              Number(student.marks?.physics || 0) +
              Number(student.marks?.chemistry || 0) +
              Number(student.marks?.english || 0)}
            /400
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold block mb-1">Student Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Father's Name</label>
            <input
              type="text"
              value={form.fatherName}
              onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Parent Phone</label>
            <input
              type="text"
              value={form.parentPhone}
              onChange={(e) =>
                setForm({ ...form, parentPhone: e.target.value })
              }
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Class / Batch</label>
            <input
              type="text"
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Monthly Fee (₹)</label>
            <input
              type="number"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Due Months</label>
            <input
              type="number"
              min={0}
              max={12}
              value={form.dueMonths}
              onChange={(e) => setForm({ ...form, dueMonths: e.target.value })}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
        </div>

        {/* TWO-STEP CONFIRMATION BOX */}
        {confirmStep === 1 && (
          <div className="p-3.5 rounded-xl bg-amber-100 border-2 border-[#18181B] space-y-2 text-xs">
            <p className="font-black flex items-center gap-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4" /> Step 1 of 2 Confirmation: Kya
              aap waqai is student ki details badalna chahte hain?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmStep(2)}
                className="px-3.5 py-1.5 rounded-lg bg-[#18181B] text-white font-black"
              >
                HAAN, STEP 2 PAR JAAYEIN
              </button>
              <button
                type="button"
                onClick={() => setConfirmStep(0)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#18181B] font-black"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {confirmStep === 2 && (
          <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-700 space-y-2 text-xs">
            <p className="font-black flex items-center gap-1.5 text-rose-950">
              <ShieldAlert className="w-4 h-4" /> Step 2 of 2 (Final
              Confirmation): Galti se koi badlao to nahi ho raha? Final save
              karein:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFinalSave}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-black flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> FINAL SAVE KAREIN
              </button>
              <button
                type="button"
                onClick={() => setConfirmStep(0)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#18181B] font-black"
              >
                WAKAI CANCEL
              </button>
            </div>
          </div>
        )}

        {confirmStep === 0 && (
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-[#18181B] bg-white text-xs font-black"
            >
              CLOSE
            </button>
            <button
              type="button"
              onClick={() => setConfirmStep(1)}
              className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-black hover:bg-zinc-800"
            >
              MODIFY DETAILS (2-STEP CONFIRM)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
