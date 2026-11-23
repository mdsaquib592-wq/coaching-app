import React, { useState } from "react";
import { FileSpreadsheet, FileText, GraduationCap } from "lucide-react";
import { downloadCsv, printHtmlAsPdf } from "../utils/printDocument";

function calculateSummary(marks) {
  const subjects = ["maths", "physics", "chemistry", "english"];
  const total = subjects.reduce(
    (sum, key) => sum + (Number(marks[key]) || 0),
    0,
  );
  const maxTotal = subjects.length * 100;
  const pct = ((total / maxTotal) * 100).toFixed(1);
  let grade = "C";
  if (pct >= 90) grade = "A+";
  else if (pct >= 80) grade = "A";
  else if (pct >= 70) grade = "B+";
  else if (pct >= 60) grade = "B";
  else if (pct < 33) grade = "F";
  return { total, maxTotal, pct, grade, status: pct >= 33 ? "PASS" : "FAIL" };
}

export default function MarksAndResults({
  students,
  setStudents,
  instituteName,
}) {
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [examName, setExamName] = useState("Test Assessment 2026");

  const batches = ["ALL", ...Array.from(new Set(students.map((s) => s.batch)))];
  const filteredStudents =
    selectedBatch === "ALL"
      ? students
      : students.filter((s) => s.batch === selectedBatch);

  const updateSubjectMark = (studentId, subject, value) => {
    const cleanVal = Math.max(0, Math.min(100, Number(value) || 0));
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, marks: { ...s.marks, [subject]: cleanVal } }
          : s,
      ),
    );
  };

  const downloadIndividualResultPdf = (st) => {
    const summary = calculateSummary(st.marks);
    const html = `
      <div class="header">
        <h1>${instituteName}</h1>
        <p>${examName} · Individual Result Card</p>
        <div class="badge">STUDENT MARKSHEET</div>
      </div>
      <div class="meta">
        <span>Roll No: ${st.rollNo}</span>
        <span>Batch: ${st.batch}</span>
      </div>
      <table>
        <tr><th>Student Name</th><td>${st.name}</td><th>Father's Name</th><td>${st.fatherName}</td></tr>
      </table>
      <table>
        <thead>
          <tr><th>Subject</th><th>Max</th><th>Obtained</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr><td>Mathematics</td><td>100</td><td>${st.marks.maths}</td><td>${st.marks.maths >= 33 ? "Pass" : "Needs Focus"}</td></tr>
          <tr><td>Physics</td><td>100</td><td>${st.marks.physics}</td><td>${st.marks.physics >= 33 ? "Pass" : "Needs Focus"}</td></tr>
          <tr><td>Chemistry</td><td>100</td><td>${st.marks.chemistry}</td><td>${st.marks.chemistry >= 33 ? "Pass" : "Needs Focus"}</td></tr>
          <tr><td>English</td><td>100</td><td>${st.marks.english}</td><td>${st.marks.english >= 33 ? "Pass" : "Needs Focus"}</td></tr>
          <tr>
            <th>TOTAL</th>
            <th>${summary.maxTotal}</th>
            <th>${summary.total} (${summary.pct}%)</th>
            <th>Grade: ${summary.grade} (${summary.status})</th>
          </tr>
        </tbody>
      </table>
      <div class="signatures">
        <div class="sig-line">Class Teacher</div>
        <div class="sig-line">Parent Signature</div>
        <div class="sig-line">Director</div>
      </div>
    `;
    printHtmlAsPdf(`Result_${st.name}_${st.rollNo}`, html);
  };

  const downloadClassWisePdf = () => {
    const rowsHtml = filteredStudents
      .map((st, idx) => {
        const sum = calculateSummary(st.marks);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${st.rollNo}</td>
            <td><strong>${st.name}</strong></td>
            <td>${st.batch}</td>
            <td>${st.marks.maths}</td>
            <td>${st.marks.physics}</td>
            <td>${st.marks.chemistry}</td>
            <td>${st.marks.english}</td>
            <td><strong>${sum.total}/400</strong></td>
            <td>${sum.pct}%</td>
            <td><strong>${sum.grade}</strong></td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div class="header">
        <h1>${instituteName}</h1>
        <p>${examName} · Class-Wise Result (${selectedBatch})</p>
        <div class="badge">CLASS RESULT SHEET</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Roll</th><th>Student</th><th>Batch</th>
            <th>Math</th><th>Phy</th><th>Chem</th><th>Eng</th>
            <th>Total</th><th>%</th><th>Grade</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="signatures">
        <div class="sig-line">Exam Incharge</div>
        <div class="sig-line">Director / Principal</div>
      </div>
    `;
    printHtmlAsPdf(`Class_Result_${selectedBatch}`, html);
  };

  const downloadClassWiseCsv = () => {
    const header = [
      "Roll No",
      "Student Name",
      "Batch",
      "Maths",
      "Physics",
      "Chemistry",
      "English",
      "Total",
      "Percentage",
      "Grade",
      "Status",
    ];
    const dataRows = filteredStudents.map((st) => {
      const sum = calculateSummary(st.marks);
      return [
        st.rollNo,
        st.name,
        st.batch,
        st.marks.maths,
        st.marks.physics,
        st.marks.chemistry,
        st.marks.english,
        sum.total,
        `${sum.pct}%`,
        sum.grade,
        sum.status,
      ];
    });
    downloadCsv(`Class_Result_${selectedBatch}.csv`, [header, ...dataRows]);
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-700" /> Marks Add
            &amp; Result Download
          </h3>
          <p className="text-xs text-zinc-600">
            Marks daalein aur One-by-One ya Class-Wise Result download karein.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold border-2 border-[#18181B] rounded-xl"
          />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-1.5 text-xs font-black border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
          >
            {batches.map((b) => (
              <option key={b} value={b}>
                Batch: {b}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={downloadClassWisePdf}
            className="px-3 py-1.5 rounded-xl bg-[#18181B] text-white text-xs font-black flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> CLASS PDF
          </button>
          <button
            type="button"
            onClick={downloadClassWiseCsv}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CLASS CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F7F3E8] border-y-2 border-[#18181B]">
              <th className="p-2.5 font-black">Student</th>
              <th className="p-2.5 font-black">Batch</th>
              <th className="p-2.5 font-black">Maths</th>
              <th className="p-2.5 font-black">Physics</th>
              <th className="p-2.5 font-black">Chem</th>
              <th className="p-2.5 font-black">English</th>
              <th className="p-2.5 font-black">Total / %</th>
              <th className="p-2.5 font-black text-right">One-by-One</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((st) => {
              const sum = calculateSummary(st.marks);
              return (
                <tr key={st.id} className="border-b border-zinc-300">
                  <td className="p-2.5 font-black">
                    {st.name}{" "}
                    <span className="text-[10px] text-zinc-500">
                      ({st.rollNo})
                    </span>
                  </td>
                  <td className="p-2.5 font-bold">{st.batch}</td>
                  {["maths", "physics", "chemistry", "english"].map((subj) => (
                    <td key={subj} className="p-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={st.marks[subj]}
                        onChange={(e) =>
                          updateSubjectMark(st.id, subj, e.target.value)
                        }
                        className="w-16 px-2 py-1 font-bold border border-[#18181B] rounded-lg bg-[#F7F3E8]"
                      />
                    </td>
                  ))}
                  <td className="p-2.5 font-black">
                    {sum.total}/400 ({sum.pct}%) ·{" "}
                    <span className="text-indigo-700">{sum.grade}</span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => downloadIndividualResultPdf(st)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-black text-[11px] hover:bg-indigo-700"
                    >
                      RESULT PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
