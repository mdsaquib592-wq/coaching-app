import React, { useEffect, useMemo, useState } from "react";
import { Award, Printer, Search } from "lucide-react";
import { printHtmlAsPdf } from "../utils/printDocument";

export default function CertificateGenerator({ students, instituteName }) {
  const [certType, setCertType] = useState("bonafide"); // bonafide | slc | tc
  const [searchQuery, setSearchQuery] = useState("");
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [refNo, setRefNo] = useState("CERT/2026/108");
  const [session, setSession] = useState("2025-2026");
  const [dob, setDob] = useState("15-08-2009");
  const [admissionDate, setAdmissionDate] = useState("01-04-2024");
  const [leavingDate, setLeavingDate] = useState("23-11-2026");
  const [reason, setReason] = useState("Higher Studies / Family Relocation");
  const [conduct, setConduct] = useState("Good and Exemplary");

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

  useEffect(() => {
    if (!filteredStudents.length) return;
    if (!filteredStudents.some((s) => s.id === studentId)) {
      setStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, studentId]);

  const st =
    students.find((s) => s.id === studentId) ||
    filteredStudents[0] ||
    students[0];

  const handlePrintCertificate = () => {
    if (!st) return;
    const issueDate = new Date().toLocaleDateString("en-IN");

    let certHeading = "BONAFIDE CERTIFICATE";
    let bodyParagraph = `
      This is to certify that <strong>${st.name}</strong>, Son/Daughter of <strong>Mr. ${st.fatherName}</strong>,
      bearing Roll No. <strong>${st.rollNo}</strong>, is a bonafide student of <strong>${instituteName}</strong>
      studying in <strong>${st.batch}</strong> during the session <strong>${session}</strong>.
      Date of Birth as per record: <strong>${dob}</strong>.
    `;

    if (certType === "slc") {
      certHeading = "SCHOOL / INSTITUTE LEAVING CERTIFICATE (SLC)";
      bodyParagraph = `
        This is to certify that <strong>${st.name}</strong>, Son/Daughter of <strong>Mr. ${st.fatherName}</strong>
        (Roll No. <strong>${st.rollNo}</strong>), was admitted on <strong>${admissionDate}</strong> in
        <strong>${st.batch}</strong> and left on <strong>${leavingDate}</strong>.
        <br/><br/>
        <strong>Reason:</strong> ${reason}<br/>
        <strong>Conduct:</strong> ${conduct}
      `;
    } else if (certType === "tc") {
      certHeading = "TRANSFER CERTIFICATE (TC)";
      bodyParagraph = `
        This is to certify that <strong>${st.name}</strong>, Son/Daughter of <strong>Mr. ${st.fatherName}</strong>
        (Roll No. <strong>${st.rollNo}</strong>, Batch <strong>${st.batch}</strong>), is issued this Transfer
        Certificate on <strong>${leavingDate}</strong> for <strong>${reason}</strong>.
        All dues are cleared and conduct is <strong>${conduct}</strong>.
      `;
    }

    const html = `
      <div class="header">
        <h1>${instituteName}</h1>
        <p>Official Certificate Issuance</p>
        <div class="badge">${certHeading}</div>
      </div>
      <div class="meta">
        <span>Ref No: ${refNo}</span>
        <span>Date: ${issueDate}</span>
      </div>
      <div class="cert-text">${bodyParagraph}</div>
      <div class="signatures">
        <div class="sig-line">Clerk / Office</div>
        <div class="sig-line">Institute Seal</div>
        <div class="sig-line">Director / Principal</div>
      </div>
    `;

    printHtmlAsPdf(`${certType.toUpperCase()}_${st.name}`, html);
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" /> Certificate Generator
          (Bonafide / SLC / TC)
        </h3>
        <div className="flex gap-1.5">
          {[
            { id: "bonafide", label: "Bonafide" },
            { id: "slc", label: "SLC" },
            { id: "tc", label: "TC" },
          ].map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCertType(c.id)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#18181B] text-xs font-black ${
                certType === c.id ? "bg-amber-300" : "bg-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Student inside Certificate Section */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold block mb-1">
            Student Search (Naam ya Roll No.)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">
            Matched Student Chunein
          </label>
          <select
            value={st?.id || ""}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-black border-2 border-[#18181B] rounded-xl bg-white"
          >
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.rollNo} · {s.batch})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="font-bold block mb-1">Certificate Ref No.</label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
          />
        </div>

        <div>
          <label className="font-bold block mb-1">Session</label>
          <input
            type="text"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
          />
        </div>

        {certType === "bonafide" && (
          <div>
            <label className="font-bold block mb-1">Date of Birth</label>
            <input
              type="text"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
            />
          </div>
        )}

        {(certType === "slc" || certType === "tc") && (
          <>
            <div>
              <label className="font-bold block mb-1">Admission Date</label>
              <input
                type="text"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">
                Issue / Leaving Date
              </label>
              <input
                type="text"
                value={leavingDate}
                onChange={(e) => setLeavingDate(e.target.value)}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Conduct</label>
              <input
                type="text"
                value={conduct}
                onChange={(e) => setConduct(e.target.value)}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl"
              />
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handlePrintCertificate}
        className="px-4 py-2.5 rounded-xl bg-[#18181B] text-white text-xs font-black flex items-center gap-2 hover:bg-zinc-800"
      >
        <Printer className="w-4 h-4" /> DOWNLOAD {certType.toUpperCase()}{" "}
        CERTIFICATE PDF
      </button>
    </div>
  );
}
