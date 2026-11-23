import React, { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, XCircle, BarChart3 } from "lucide-react";

const MONTHS = [
  { key: "01", label: "January", openDays: 24, presentDays: 21 },
  { key: "02", label: "February", openDays: 22, presentDays: 19 },
  { key: "03", label: "March", openDays: 25, presentDays: 22 },
  { key: "04", label: "April", openDays: 22, presentDays: 20 },
  { key: "05", label: "May", openDays: 20, presentDays: 17 },
  { key: "06", label: "June", openDays: 18, presentDays: 15 },
  { key: "07", label: "July", openDays: 25, presentDays: 22 },
  { key: "08", label: "August", openDays: 24, presentDays: 21 },
  { key: "09", label: "September", openDays: 24, presentDays: 20 },
  { key: "10", label: "October", openDays: 22, presentDays: 18 },
  { key: "11", label: "November", openDays: 25, presentDays: 21 },
  { key: "12", label: "December", openDays: 20, presentDays: 17 },
];

function buildDailyLogs(student, monthKey) {
  const baseSeed = String(student?.id || "s1")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const daysInView = 10;
  return Array.from({ length: daysInView }, (_, idx) => {
    const dayNum = String(idx + 1).padStart(2, "0");
    const isToday = monthKey === "11" && idx === 0;
    const status = isToday
      ? student?.attendance || "P"
      : (baseSeed + idx + Number(monthKey)) % 5 === 0
        ? "A"
        : "P";

    return {
      date: `2026-${monthKey}-${dayNum}`,
      dayLabel: `Day ${idx + 1}`,
      status,
      timing: status === "P" ? "4:02 PM" : "Not Marked",
    };
  });
}

export default function StudentAttendanceView({ student }) {
  const [viewMode, setViewMode] = useState("daily"); // daily | monthly | yearly
  const [selectedMonth, setSelectedMonth] = useState("11"); // November default

  const adjustedMonths = useMemo(() => {
    const isAbsentOffset = student?.attendance === "A" ? -1 : 0;
    return MONTHS.map((m) => {
      if (m.key === "11") {
        const nextPresent = Math.max(
          0,
          Math.min(m.openDays, m.presentDays + isAbsentOffset),
        );
        return { ...m, presentDays: nextPresent };
      }
      return m;
    });
  }, [student?.attendance]);

  const currentMonthData =
    adjustedMonths.find((m) => m.key === selectedMonth) || adjustedMonths[10];

  const yearlySummary = useMemo(() => {
    const totalOpen = adjustedMonths.reduce((sum, m) => sum + m.openDays, 0);
    const totalPresent = adjustedMonths.reduce(
      (sum, m) => sum + m.presentDays,
      0,
    );
    const totalAbsent = Math.max(0, totalOpen - totalPresent);
    const pct =
      totalOpen > 0 ? ((totalPresent / totalOpen) * 100).toFixed(1) : "0.0";
    return { totalOpen, totalPresent, totalAbsent, pct };
  }, [adjustedMonths]);

  const dailyLogs = useMemo(
    () => buildDailyLogs(student, selectedMonth),
    [student, selectedMonth],
  );

  const monthPct =
    currentMonthData.openDays > 0
      ? (
          (currentMonthData.presentDays / currentMonthData.openDays) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-700" /> Meri
            Attendance (Daily · Monthly · Yearly)
          </h3>
          <p className="text-xs text-zinc-600">
            Student: <span className="font-black">{student?.name}</span> (
            {student?.batch})
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "daily", label: "Daily Wise" },
            { id: "monthly", label: "Monthly Wise" },
            { id: "yearly", label: "Yearly Wise" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#18181B] text-xs font-black transition ${
                viewMode === mode.id
                  ? "bg-[#18181B] text-[#F7F3E8]"
                  : "bg-[#F7F3E8] hover:bg-amber-100"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* DAILY WISE VIEW */}
      {viewMode === "daily" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F7F3E8] border border-[#18181B] rounded-xl p-3">
            <span className="text-xs font-black">
              Aaj ki Status:{" "}
              {student?.attendance === "P" ? "PRESENT (P)" : "ABSENT (A)"}
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold border border-[#18181B] rounded-lg bg-white"
            >
              {adjustedMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} 2026
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {dailyLogs.map((log) => (
              <div
                key={log.date}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#18181B] bg-white text-xs"
              >
                <div>
                  <p className="font-black">{log.date}</p>
                  <p className="text-[11px] text-zinc-600">
                    {log.dayLabel} · Entry: {log.timing}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg font-black flex items-center gap-1 text-white ${
                    log.status === "P" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                >
                  {log.status === "P" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {log.status === "P" ? "PRESENT" : "ABSENT"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTHLY WISE VIEW */}
      {viewMode === "monthly" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-black">Mahina Chunein:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-black border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
            >
              {adjustedMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} 2026 ({m.presentDays}/{m.openDays} days present)
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-[#18181B] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-emerald-900">
                {currentMonthData.label} 2026 Summary
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-[#18181B]">
                {monthPct}% Attendance
              </span>
            </div>
            <p className="text-2xl font-black">
              {currentMonthData.presentDays}/{currentMonthData.openDays} days
              present
            </p>
            <p className="text-xs font-bold text-zinc-700">
              Is mahine mein total{" "}
              <strong>{currentMonthData.openDays} din</strong> classes open
              thin, aur aap <strong>{currentMonthData.presentDays} din</strong>{" "}
              present rahe (
              <strong>
                {Math.max(
                  0,
                  currentMonthData.openDays - currentMonthData.presentDays,
                )}{" "}
                din
              </strong>{" "}
              absent).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {adjustedMonths.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMonth(m.key)}
                className={`p-2.5 rounded-xl border border-[#18181B] text-left transition ${
                  m.key === selectedMonth
                    ? "bg-amber-200 font-black"
                    : "bg-[#F7F3E8] hover:bg-amber-50"
                }`}
              >
                <p className="font-black">{m.label}</p>
                <p className="text-[11px] font-bold text-zinc-700 mt-0.5">
                  {m.presentDays}/{m.openDays} days present
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* YEARLY WISE VIEW */}
      {viewMode === "yearly" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-100 border-2 border-[#18181B] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" /> Pure Saal (2026) ka Attendance
                Record
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-[#18181B]">
                {yearlySummary.pct}% Overall
              </span>
            </div>
            <p className="text-2xl font-black">
              {yearlySummary.totalPresent}/{yearlySummary.totalOpen} days
              present
            </p>
            <p className="text-xs font-bold text-zinc-800">
              Pure year mein <strong>{yearlySummary.totalOpen} din</strong>{" "}
              classes open thin, jisme aap{" "}
              <strong>{yearlySummary.totalPresent} din</strong> present rahe aur{" "}
              <strong>{yearlySummary.totalAbsent} din</strong> absent rahe.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F3E8] border-y-2 border-[#18181B]">
                  <th className="p-2 font-black">Month</th>
                  <th className="p-2 font-black">Classes Open</th>
                  <th className="p-2 font-black">Present</th>
                  <th className="p-2 font-black">Summary</th>
                </tr>
              </thead>
              <tbody>
                {adjustedMonths.map((m) => (
                  <tr key={m.key} className="border-b border-zinc-200">
                    <td className="p-2 font-black">{m.label}</td>
                    <td className="p-2 font-bold">{m.openDays} days</td>
                    <td className="p-2 font-bold text-emerald-700">
                      {m.presentDays} days
                    </td>
                    <td className="p-2 font-black">
                      {m.presentDays}/{m.openDays} days present
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
