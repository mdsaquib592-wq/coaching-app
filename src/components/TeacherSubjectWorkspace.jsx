import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Send,
  Users,
  Lock,
  HelpCircle,
  Upload,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";
import TestCopyViewerModal from "./TestCopyViewerModal";

function readFilesAsDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              type: file.type,
              dataUrl: reader.result,
              uploadedAt: new Date().toLocaleDateString("en-IN"),
            });
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        }),
    ),
  ).then((results) => results.filter(Boolean));
}

export default function TeacherSubjectWorkspace({
  assignedSubject,
  teacherName,
  students,
  onUpdateStudents,
  homeworkList,
  onAssignHomework,
  practiceList = [],
  onAddPracticeQuestion,
  onDeletePracticeQuestion,
}) {
  const [activeTab, setActiveTab] = useState("homework"); // homework | practice | attendance | marks

  const availableClasses = useMemo(() => {
    const unique = Array.from(
      new Set(students.map((s) => s.batch).filter(Boolean)),
    );
    return unique.length > 0 ? unique : ["10-A"];
  }, [students]);

  const [selectedClass, setSelectedClass] = useState(availableClasses[0]);
  const [hwTitle, setHwTitle] = useState("");
  const [hwDueDate, setHwDueDate] = useState("Kal tak");

  // Practice Question States
  const [pqTitle, setPqTitle] = useState("");
  const [pqBody, setPqBody] = useState("");
  const [pqFile, setPqFile] = useState(null);

  // Test Copy Viewer Modal State
  const [viewingCopyStudentId, setViewingCopyStudentId] = useState(null);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    if (!availableClasses.includes(selectedClass)) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);

  const subjectKey = assignedSubject.toLowerCase();

  const classStudents = useMemo(
    () => students.filter((st) => st.batch === selectedClass),
    [students, selectedClass],
  );

  const classSubjectHomeworks = useMemo(
    () =>
      homeworkList.filter(
        (hw) =>
          hw.batch === selectedClass && hw.subject.toLowerCase() === subjectKey,
      ),
    [homeworkList, selectedClass, subjectKey],
  );

  const classSubjectPractice = useMemo(
    () =>
      practiceList.filter(
        (pq) =>
          pq.batch === selectedClass && pq.subject.toLowerCase() === subjectKey,
      ),
    [practiceList, selectedClass, subjectKey],
  );

  const viewingStudent = useMemo(
    () => students.find((s) => s.id === viewingCopyStudentId) || null,
    [students, viewingCopyStudentId],
  );

  const showToast = (msg) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(""), 2400);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    onAssignHomework({
      id: `hw_${Date.now()}`,
      batch: selectedClass,
      subject: assignedSubject,
      title: hwTitle.trim(),
      dueDate: hwDueDate.trim() || "Kal tak",
      assignedBy: teacherName || `${assignedSubject} Teacher`,
      assignedAt: new Date().toLocaleDateString("en-IN"),
    });

    setHwTitle("");
    showToast(
      `Class ${selectedClass} ko ${assignedSubject} homework assign ho gaya!`,
    );
  };

  const handlePracticeFilePick = async (e) => {
    const parsed = await readFilesAsDataUrls(e.target.files);
    if (parsed[0]) setPqFile(parsed[0]);
  };

  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    if (!pqTitle.trim() && !pqBody.trim() && !pqFile) return;

    if (onAddPracticeQuestion) {
      onAddPracticeQuestion({
        id: `pq_${Date.now()}`,
        batch: selectedClass,
        subject: assignedSubject,
        title: pqTitle.trim() || `${assignedSubject} Practice Set`,
        questionsText: pqBody.trim(),
        attachment: pqFile,
        uploadedBy: teacherName || `${assignedSubject} Teacher`,
        uploadedAt: new Date().toLocaleDateString("en-IN"),
      });
    }

    setPqTitle("");
    setPqBody("");
    setPqFile(null);
    showToast(
      `Class ${selectedClass} ke students ke liye ${assignedSubject} practice questions upload ho gaye!`,
    );
  };

  const toggleSubjectAttendance = (studentId) => {
    onUpdateStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        const currentSubAtt =
          st.subjectAttendance?.[subjectKey] || st.attendance || "P";
        const nextStatus = currentSubAtt === "P" ? "A" : "P";
        return {
          ...st,
          attendance: nextStatus,
          subjectAttendance: {
            ...(st.subjectAttendance || {}),
            [subjectKey]: nextStatus,
          },
        };
      }),
    );
    showToast(`${assignedSubject} attendance update ho gayi!`);
  };

  const handleSubjectMarkChange = (studentId, rawVal) => {
    const cleanVal = Math.max(0, Math.min(100, Number(rawVal) || 0));
    onUpdateStudents((prev) =>
      prev.map((st) =>
        st.id === studentId
          ? {
              ...st,
              marks: {
                ...(st.marks || {}),
                [subjectKey]: cleanVal,
              },
            }
          : st,
      ),
    );
  };

  // Multiple Images ya PDF upload handler per student
  const handleStudentTestCopyUpload = async (studentId, fileList) => {
    const uploadedFiles = await readFilesAsDataUrls(fileList);
    if (uploadedFiles.length === 0) return;

    onUpdateStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        const existingForSubj = st.testCopies?.[subjectKey] || [];
        return {
          ...st,
          testCopies: {
            ...(st.testCopies || {}),
            [subjectKey]: [...existingForSubj, ...uploadedFiles],
          },
        };
      }),
    );
    showToast(`${uploadedFiles.length} checked copy file(s) upload ho gayi!`);
  };

  const handleClearStudentCopy = (studentId) => {
    onUpdateStudents((prev) =>
      prev.map((st) => {
        if (st.id !== studentId) return st;
        return {
          ...st,
          testCopies: {
            ...(st.testCopies || {}),
            [subjectKey]: [],
          },
        };
      }),
    );
    showToast("Uploaded test copy hata di gayi.");
  };

  return (
    <div className="space-y-5">
      {/* Subject & Class Filter Header */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> SUBJECT LOCKED:{" "}
              {assignedSubject.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-slate-300">
              {teacherName || `${assignedSubject} Faculty`}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Class select karke sirf{" "}
            <strong className="text-white">{assignedSubject}</strong> ka
            Homework, Practice Questions, Attendance aur Marks + Checked Copy
            upload karein.
          </p>
        </div>

        <div className="flex items-center gap-2 glass-subcard rounded-xl px-3.5 py-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <label className="text-xs font-black text-white">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-black rounded-lg px-2.5 py-1 glass-input"
          >
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Teacher Action Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "homework",
            label: `1. ${assignedSubject} Homework`,
            icon: ClipboardList,
          },
          { id: "practice", label: `2. Practice Questions`, icon: HelpCircle },
          {
            id: "attendance",
            label: `3. ${assignedSubject} Attendance`,
            icon: CheckCircle2,
          },
          {
            id: "marks",
            label: `4. Marks & Test Copy Upload`,
            icon: GraduationCap,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === tab.id
                  ? "bg-cyan-400/20 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.22)]"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-black">
          ✓ {savedNotice}
        </div>
      )}

      {/* TAB 1: HOMEWORK ASSIGN */}
      {activeTab === "homework" && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-white">
              {assignedSubject} Homework — Class {selectedClass}
            </h3>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
              {classStudents.length} STUDENTS IN CLASS {selectedClass}
            </span>
          </div>

          <form
            onSubmit={handleAssignSubmit}
            className="p-4 rounded-2xl glass-subcard space-y-3 text-xs"
          >
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold block mb-1 text-slate-300">
                  Subject (Locked)
                </label>
                <input
                  type="text"
                  readOnly
                  value={assignedSubject}
                  className="w-full px-3 py-2 font-black rounded-xl glass-input opacity-75"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-300">
                  Target Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 font-black rounded-xl glass-input"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-300">
                  Submit Kab Tak
                </label>
                <input
                  type="text"
                  value={hwDueDate}
                  onChange={(e) => setHwDueDate(e.target.value)}
                  placeholder="Kal tak"
                  className="w-full px-3 py-2 font-bold rounded-xl glass-input"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                required
                value={hwTitle}
                onChange={(e) => setHwTitle(e.target.value)}
                placeholder={`Class ${selectedClass} ke liye ${assignedSubject} ka homework likhein...`}
                className="flex-1 px-3 py-2 font-bold rounded-xl glass-input"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl btn-neon-primary flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> ASSIGN TO CLASS {selectedClass}
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {classSubjectHomeworks.map((hw) => (
              <div
                key={hw.id}
                className="p-3 rounded-xl glass-subcard flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-black text-white">{hw.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Date: {hw.assignedAt} · Due: {hw.dueDate}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-black text-[10px]">
                  {hw.subject} · {hw.batch}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE QUESTIONS UPLOAD (CLASS-WISE) */}
      {activeTab === "practice" && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white">
                {assignedSubject} Practice Questions — Class {selectedClass}
              </h3>
              <p className="text-xs text-slate-400">
                Yahan upload kiye gaye practice questions Class {selectedClass}{" "}
                ke students ko ghar par practice karne ke liye dikhenge.
              </p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200">
              {classSubjectPractice.length} SETS UPLOADED
            </span>
          </div>

          <form
            onSubmit={handlePracticeSubmit}
            className="p-4 rounded-2xl glass-subcard space-y-3 text-xs"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1 text-slate-300">
                  Practice Sheet Title *
                </label>
                <input
                  type="text"
                  required
                  value={pqTitle}
                  onChange={(e) => setPqTitle(e.target.value)}
                  placeholder="Jaise: Trigonometry Important 15 Questions"
                  className="w-full px-3 py-2 font-bold rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-300">
                  Optional Worksheet PDF / Image Upload
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePracticeFilePick}
                  className="w-full px-3 py-1.5 font-bold rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-300">
                Questions Likhein (Student ghar par solve karega)
              </label>
              <textarea
                rows={4}
                value={pqBody}
                onChange={(e) => setPqBody(e.target.value)}
                placeholder={
                  "Q1. Prove that sin²θ + cos²θ = 1\nQ2. Find the 10th term of AP: 2, 7, 12..."
                }
                className="w-full p-3 font-medium rounded-xl glass-input"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl btn-neon-primary flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> UPLOAD PRACTICE QUESTIONS FOR CLASS{" "}
              {selectedClass}
            </button>
          </form>

          <div className="space-y-2.5">
            {classSubjectPractice.map((pq) => (
              <div
                key={pq.id}
                className="p-3.5 rounded-xl glass-subcard flex flex-wrap items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-black text-white">{pq.title}</p>
                  {pq.questionsText && (
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-black/30 p-2.5 rounded-lg">
                      {pq.questionsText}
                    </pre>
                  )}
                  {pq.attachment && (
                    <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Attached:{" "}
                      {pq.attachment.name}
                    </p>
                  )}
                </div>

                {onDeletePracticeQuestion && (
                  <button
                    type="button"
                    onClick={() => onDeletePracticeQuestion(pq.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-200 font-black flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECT ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white">
                {assignedSubject} Class Attendance — Class {selectedClass}
              </h3>
              <p className="text-xs text-slate-400">
                Sirf Class {selectedClass} ke students ki {assignedSubject}{" "}
                attendance mark karein.
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-200">
              {classStudents.length} STUDENTS
            </span>
          </div>

          <div className="space-y-2.5">
            {classStudents.map((st) => {
              const status =
                st.subjectAttendance?.[subjectKey] || st.attendance || "P";
              return (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3.5 rounded-xl glass-subcard"
                >
                  <div>
                    <p className="text-sm font-black text-white">
                      {st.name}{" "}
                      <span className="text-xs text-cyan-300">
                        (Roll: {st.rollNo} · Class {st.batch})
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSubjectAttendance(st.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                      status === "P"
                        ? "bg-emerald-500/25 border border-emerald-400/50 text-emerald-200"
                        : "bg-rose-500/25 border border-rose-400/50 text-rose-200"
                    }`}
                  >
                    {status === "P" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> PRESENT (P)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> ABSENT (A)
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MARKS UPLOAD + MULTIPLE IMAGES / PDF TEST COPY UPLOAD */}
      {activeTab === "marks" && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-white">
                {assignedSubject} Marks &amp; Checked Copy Upload — Class{" "}
                {selectedClass}
              </h3>
              <p className="text-xs text-slate-400">
                Marks enter karein aur har student ki checked test copy
                (multiple images ya PDF) upload karein taaki parents dekh
                sakein.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                showToast(
                  `Class ${selectedClass} ke ${assignedSubject} marks aur test copies publish ho gayi!`,
                )
              }
              className="px-4 py-2 rounded-xl btn-neon-primary text-xs"
            >
              PUBLISH {assignedSubject.toUpperCase()} RESULT
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 text-cyan-300">
                  <th className="p-2.5 font-black">Roll</th>
                  <th className="p-2.5 font-black">Student Name</th>
                  <th className="p-2.5 font-black">
                    {assignedSubject} Marks (/100)
                  </th>
                  <th className="p-2.5 font-black">
                    Upload Checked Test Copy (Images / PDF)
                  </th>
                  <th className="p-2.5 font-black text-right">Copy Preview</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((st) => {
                  const markVal = st.marks?.[subjectKey] ?? 0;
                  const uploadedCopies = st.testCopies?.[subjectKey] || [];
                  return (
                    <tr key={st.id} className="border-b border-white/10">
                      <td className="p-2.5 font-bold text-slate-300">
                        {st.rollNo}
                      </td>
                      <td className="p-2.5 font-black text-white">{st.name}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={markVal}
                          onChange={(e) =>
                            handleSubjectMarkChange(st.id, e.target.value)
                          }
                          className="w-24 px-3 py-1.5 font-black rounded-xl glass-input"
                        />
                      </td>
                      <td className="p-2.5">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 font-black cursor-pointer hover:bg-purple-500/30">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Images / PDF</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              handleStudentTestCopyUpload(st.id, e.target.files)
                            }
                            className="hidden"
                          />
                        </label>
                      </td>
                      <td className="p-2.5 text-right">
                        {uploadedCopies.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingCopyStudentId(st.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-black flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View ({uploadedCopies.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearStudentCopy(st.id)}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-200"
                              title="Remove copies"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            No copy uploaded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TestCopyViewerModal
        student={viewingStudent}
        subjectFilter={assignedSubject}
        onClose={() => setViewingCopyStudentId(null)}
      />
    </div>
  );
}
