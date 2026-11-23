import React, { useMemo, useState } from "react";
import {
  IndianRupee,
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
  Wallet,
} from "lucide-react";

export function getStudentFeeMetrics(st) {
  const admissionFee = Number(st.admissionFee ?? st.fee ?? 0);
  const hasExplicitPaid = st.paidAmount !== undefined && st.paidAmount !== null;
  const hasExplicitDue = st.dueAmount !== undefined && st.dueAmount !== null;

  const paidAmount = hasExplicitPaid
    ? Math.max(0, Number(st.paidAmount) || 0)
    : st.feeStatus === "PAID"
      ? admissionFee
      : 0;

  const dueAmount = hasExplicitDue
    ? Math.max(0, Number(st.dueAmount) || 0)
    : Math.max(0, admissionFee - paidAmount);

  return { admissionFee, paidAmount, dueAmount };
}

export default function FeeCollectionManager({
  students,
  onClearStudentDue,
  onCollectPartialFee,
}) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detailSection, setDetailSection] = useState("fees"); // fees | attendance | results
  const [partialInputs, setPartialInputs] = useState({});
  const [detailPartialAmt, setDetailPartialAmt] = useState("");

  const summary = useMemo(() => {
    const classMap = new Map();
    let totalCollected = 0;
    let totalDue = 0;

    students.forEach((st) => {
      const { admissionFee, paidAmount, dueAmount } = getStudentFeeMetrics(st);
      totalCollected += paidAmount;
      totalDue += dueAmount;

      const cls = st.batch || "General";
      if (!classMap.has(cls)) {
        classMap.set(cls, {
          className: cls,
          studentCount: 0,
          dueStudentCount: 0,
          classDue: 0,
          classCollected: 0,
          classTotalAdmissionFee: 0,
        });
      }
      const entry = classMap.get(cls);
      entry.studentCount += 1;
      entry.classTotalAdmissionFee += admissionFee;
      entry.classDue += dueAmount;
      entry.classCollected += paidAmount;
      if (dueAmount > 0) entry.dueStudentCount += 1;
    });

    return {
      totalCollected,
      totalDue,
      classes: Array.from(classMap.values()),
    };
  }, [students]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.batch === selectedClass);
  }, [students, selectedClass]);

  const activeStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [students, selectedStudentId],
  );

  const handleRowPartialSubmit = (e, st, maxDue) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = Number(partialInputs[st.id] ?? 0);
    if (!raw || raw <= 0) return;
    const collectAmt = Math.min(raw, maxDue);
    if (onCollectPartialFee) {
      onCollectPartialFee(st.id, collectAmt);
    }
    setPartialInputs((prev) => ({ ...prev, [st.id]: "" }));
  };

  const handleDetailPartialSubmit = (e, st, maxDue) => {
    e.preventDefault();
    const raw = Number(detailPartialAmt ?? 0);
    if (!raw || raw <= 0) return;
    const collectAmt = Math.min(raw, maxDue);
    if (onCollectPartialFee) {
      onCollectPartialFee(st.id, collectAmt);
    }
    setDetailPartialAmt("");
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-5">
      {/* Top Totals */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-[#18181B]">
          <p className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" /> Total Collected Amount
          </p>
          <p className="text-3xl font-black mt-1">
            ₹{summary.totalCollected.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-bold text-zinc-700 mt-1">
            Sabhi students se jama hui kul fees
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-100 border-2 border-[#18181B]">
          <p className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Total Due Amount
          </p>
          <p className="text-3xl font-black mt-1">
            ₹{summary.totalDue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-bold text-zinc-700 mt-1">
            Sabhi classes ke kul baaki dues
          </p>
        </div>
      </div>

      {/* LEVEL 3: STUDENT DETAIL (FEES / ATTENDANCE / RESULTS) */}
      {activeStudent ? (
        <div className="p-4 rounded-2xl bg-[#F7F3E8] border-2 border-[#18181B] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <button
                type="button"
                onClick={() => setSelectedStudentId(null)}
                className="text-xs font-black underline flex items-center gap-1 mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Class{" "}
                {activeStudent.batch} ke Students par Wapas
              </button>
              <h3 className="text-xl font-black">
                {activeStudent.name}{" "}
                <span className="text-xs font-bold text-zinc-600">
                  (Adm No: {activeStudent.admissionNo || "N/A"} · Roll:{" "}
                  {activeStudent.rollNo} · Class: {activeStudent.batch})
                </span>
              </h3>
            </div>

            <div className="flex gap-1.5">
              {[
                { id: "fees", label: "Fees" },
                { id: "attendance", label: "Attendance" },
                { id: "results", label: "Results" },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setDetailSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl border-2 border-[#18181B] text-xs font-black ${
                    detailSection === sec.id
                      ? "bg-[#18181B] text-white"
                      : "bg-white"
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {detailSection === "fees" &&
            (() => {
              const m = getStudentFeeMetrics(activeStudent);
              return (
                <div className="bg-white border border-[#18181B] rounded-xl p-4 space-y-3 text-xs">
                  <p className="font-black text-sm">
                    Admission Fee &amp; Partial Collection
                  </p>
                  <div className="grid sm:grid-cols-3 gap-2 font-bold">
                    <p>
                      Admission Fee:{" "}
                      <strong>₹{m.admissionFee.toLocaleString("en-IN")}</strong>
                    </p>
                    <p>
                      Paid Amount:{" "}
                      <strong className="text-emerald-700">
                        ₹{m.paidAmount.toLocaleString("en-IN")}
                      </strong>
                    </p>
                    <p>
                      Due Amount:{" "}
                      <strong className="text-rose-700">
                        ₹{m.dueAmount.toLocaleString("en-IN")}
                      </strong>
                    </p>
                  </div>

                  {m.dueAmount > 0 && (
                    <form
                      onSubmit={(e) =>
                        handleDetailPartialSubmit(e, activeStudent, m.dueAmount)
                      }
                      className="pt-2 border-t border-zinc-200 flex flex-wrap items-center gap-2"
                    >
                      <span className="font-black flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-emerald-700" /> Partial
                        Fee Collect (₹):
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={m.dueAmount}
                        placeholder={`Max ₹${m.dueAmount}`}
                        value={detailPartialAmt}
                        onChange={(e) => setDetailPartialAmt(e.target.value)}
                        className="w-36 px-3 py-1.5 font-black border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-black hover:bg-emerald-800"
                      >
                        COLLECT PARTIAL FEE
                      </button>

                      {onClearStudentDue && (
                        <button
                          type="button"
                          onClick={() => onClearStudentDue(activeStudent.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#18181B] text-white font-black"
                        >
                          FULL DUE CLEAR (₹{m.dueAmount})
                        </button>
                      )}
                    </form>
                  )}
                </div>
              );
            })()}

          {detailSection === "attendance" && (
            <div className="bg-white border border-[#18181B] rounded-xl p-4 space-y-2 text-xs">
              <p className="font-black text-sm">Attendance Section</p>
              <p>
                Current Status:{" "}
                <strong>
                  {activeStudent.attendance === "P"
                    ? "PRESENT (P)"
                    : "ABSENT (A)"}
                </strong>
              </p>
              <p>
                Monthly Record: <strong>21/25 days present</strong>
              </p>
              <p>
                Yearly Record: <strong>208/240 days present</strong>
              </p>
            </div>
          )}

          {detailSection === "results" && (
            <div className="bg-white border border-[#18181B] rounded-xl p-4 space-y-2 text-xs">
              <p className="font-black text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-700" /> Results Section
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-black">
                <div className="p-2.5 rounded-lg bg-[#F7F3E8] border border-[#18181B]">
                  Maths: {activeStudent.marks?.maths ?? 0}/100
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F3E8] border border-[#18181B]">
                  Physics: {activeStudent.marks?.physics ?? 0}/100
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F3E8] border border-[#18181B]">
                  Chemistry: {activeStudent.marks?.chemistry ?? 0}/100
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F3E8] border border-[#18181B]">
                  English: {activeStudent.marks?.english ?? 0}/100
                </div>
              </div>
            </div>
          )}
        </div>
      ) : selectedClass ? (
        /* LEVEL 2: STUDENT-WISE DUES + QUICK PARTIAL FEE COLLECTION */
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSelectedClass(null)}
              className="px-3 py-1.5 rounded-xl border-2 border-[#18181B] bg-[#F7F3E8] text-xs font-black flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sabhi Classes par Wapas
            </button>
            <h3 className="text-base font-black">
              Class {selectedClass} — Student-Wise Fee &amp; Partial Collection
            </h3>
          </div>

          <div className="space-y-2.5">
            {classStudents.map((st) => {
              const m = getStudentFeeMetrics(st);
              return (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl border-2 border-[#18181B] bg-[#F7F3E8] space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        setDetailSection("fees");
                      }}
                      className="text-left hover:underline"
                    >
                      <p className="text-sm font-black">
                        {st.name}{" "}
                        <span className="text-xs text-zinc-600">
                          (Adm: {st.admissionNo || "—"} · Roll: {st.rollNo})
                        </span>
                      </p>
                      <p className="text-xs font-bold text-zinc-700">
                        Adm Fee: ₹{m.admissionFee.toLocaleString("en-IN")} ·
                        Paid: ₹{m.paidAmount.toLocaleString("en-IN")}
                      </p>
                    </button>

                    <div className="text-right">
                      {m.dueAmount > 0 ? (
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-600 text-white">
                          DUE: ₹{m.dueAmount.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-700 text-white inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> NO DUE
                        </span>
                      )}
                    </div>
                  </div>

                  {m.dueAmount > 0 && (
                    <form
                      onSubmit={(e) =>
                        handleRowPartialSubmit(e, st, m.dueAmount)
                      }
                      className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-300 text-xs"
                    >
                      <input
                        type="number"
                        min={1}
                        max={m.dueAmount}
                        placeholder={`Partial ₹ (Max ${m.dueAmount})`}
                        value={partialInputs[st.id] ?? ""}
                        onChange={(e) =>
                          setPartialInputs((prev) => ({
                            ...prev,
                            [st.id]: e.target.value,
                          }))
                        }
                        className="w-40 px-2.5 py-1.5 font-black border-2 border-[#18181B] rounded-xl bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-black hover:bg-emerald-800"
                      >
                        COLLECT PARTIAL
                      </button>
                      {onClearStudentDue && (
                        <button
                          type="button"
                          onClick={() => onClearStudentDue(st.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#18181B] text-white font-black"
                        >
                          CLEAR ALL DUE
                        </button>
                      )}
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LEVEL 1: CLASS-WISE DUES OVERVIEW */
        <div className="space-y-3">
          <h3 className="text-base font-black flex items-center gap-2">
            <Users className="w-4 h-4" /> Class-Wise Dues (Class par click karke
            students dekhein)
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.classes.map((cls) => (
              <button
                key={cls.className}
                type="button"
                onClick={() => setSelectedClass(cls.className)}
                className="text-left p-4 rounded-2xl border-2 border-[#18181B] bg-[#F7F3E8] hover:bg-amber-100 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">
                    CLASS {cls.className}
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-white border border-[#18181B]">
                    {cls.studentCount} Students
                  </span>
                </div>
                <p className="text-xl font-black text-rose-700">
                  Due: ₹{cls.classDue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs font-bold text-zinc-700">
                  Due Students: {cls.dueStudentCount} · Paid: ₹
                  {cls.classCollected.toLocaleString("en-IN")}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
