import React, { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Database,
  LogOut,
  FileText,
  CalendarClock,
  Search,
  Sparkles,
  Eye,
} from "lucide-react";
import RoleLoginGate from "./components/RoleLoginGate";
import ReceiptGenerator from "./components/ReceiptGenerator";
import CertificateGenerator from "./components/CertificateGenerator";
import MarksAndResults from "./components/MarksAndResults";
import WhatsAppTemplateBuilder from "./components/WhatsAppTemplateBuilder";
import AddStudentModal from "./components/AddStudentModal";
import StudentAttendanceView from "./components/StudentAttendanceView";
import SyllabusManager from "./components/SyllabusManager";
import HomeworkManager from "./components/HomeworkManager";
import TeacherSubjectWorkspace from "./components/TeacherSubjectWorkspace";
import FeeCollectionManager, {
  getStudentFeeMetrics,
} from "./components/FeeCollectionManager";
import TeacherAccountsManager from "./components/TeacherAccountsManager";
import StudentDetailModal from "./components/StudentDetailModal";
import PracticeQuestionsViewer from "./components/PracticeQuestionsViewer";
import TestCopyViewerModal from "./components/TestCopyViewerModal";
import { printHtmlAsPdf } from "./utils/printDocument";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

const STORAGE_KEY = "coaching_app_students_v3";
const SESSION_KEY = "coaching_app_session_v3";
const SYLLABUS_KEY = "coaching_app_syllabus_v3";
const HOMEWORK_KEY = "coaching_app_homework_v3";
const TEACHERS_KEY = "coaching_app_teachers_v3";
const PRACTICE_KEY = "coaching_app_practice_v1";

const INITIAL_STUDENTS = [
  {
    id: "s1",
    admissionNo: "1001",
    admissionDate: "2026-04-01",
    rollNo: "1",
    name: "AARAV SHARMA",
    fatherName: "Rajesh Sharma",
    motherName: "Sunita Sharma",
    dob: "2010-05-12",
    gender: "Male",
    parentPhone: "9876543210",
    address: "Station Road, Giridih",
    batch: "10-A",
    admissionFee: 3000,
    paidAmount: 3000,
    dueAmount: 0,
    fee: 3000,
    feeStatus: "PAID",
    dueMonths: 0,
    attendance: "P",
    subjectAttendance: {
      maths: "P",
      physics: "P",
      chemistry: "P",
      english: "P",
    },
    marks: { maths: 88, physics: 84, chemistry: 86, english: 90 },
    testCopies: {},
  },
  {
    id: "s2",
    admissionNo: "1002",
    admissionDate: "2026-04-05",
    rollNo: "2",
    name: "RAHUL VERMA",
    fatherName: "Suresh Verma",
    motherName: "Anita Verma",
    dob: "2010-08-19",
    gender: "Male",
    parentPhone: "9876543211",
    address: "Bada Chowk, Giridih",
    batch: "10-A",
    admissionFee: 3000,
    paidAmount: 1500,
    dueAmount: 1500,
    fee: 3000,
    feeStatus: "PENDING",
    dueMonths: 1,
    attendance: "A",
    subjectAttendance: {
      maths: "A",
      physics: "P",
      chemistry: "A",
      english: "P",
    },
    marks: { maths: 64, physics: 59, chemistry: 62, english: 71 },
    testCopies: {},
  },
  {
    id: "s3",
    admissionNo: "1003",
    admissionDate: "2026-04-10",
    rollNo: "1",
    name: "SNEHA KUMARI",
    fatherName: "Manoj Kumar",
    motherName: "Kavita Devi",
    dob: "2008-11-02",
    gender: "Female",
    parentPhone: "9876543212",
    address: "Court Road, Giridih",
    batch: "12-B",
    admissionFee: 3500,
    paidAmount: 2000,
    dueAmount: 1500,
    fee: 3500,
    feeStatus: "PENDING",
    dueMonths: 1,
    attendance: "P",
    subjectAttendance: {
      maths: "P",
      physics: "P",
      chemistry: "P",
      english: "P",
    },
    marks: { maths: 94, physics: 91, chemistry: 89, english: 93 },
    testCopies: {},
  },
];

const INITIAL_TEACHERS = [
  {
    id: "tch_1",
    name: "Prof. R. K. Verma",
    subject: "Maths",
    loginId: "TCH-MATH",
    password: "2222",
  },
  {
    id: "tch_2",
    name: "Prof. S. N. Jha",
    subject: "Physics",
    loginId: "TCH-PHY",
    password: "2222",
  },
  {
    id: "tch_3",
    name: "Prof. A. K. Singh",
    subject: "Chemistry",
    loginId: "TCH-CHEM",
    password: "2222",
  },
  {
    id: "tch_4",
    name: "Ms. Priya Kumari",
    subject: "English",
    loginId: "TCH-ENG",
    password: "2222",
  },
];

const INITIAL_SYLLABUS = [
  {
    id: "syl_1",
    batch: "10-A",
    subject: "Maths",
    topic: "Ch-5: Arithmetic Progressions",
    details: "nth term, sum of first n terms, word problems",
    updatedAt: "23/11/2026",
  },
  {
    id: "syl_2",
    batch: "12-B",
    subject: "Chemistry",
    topic: "Ch-2: Solutions & Molarity",
    details: "Raoult's law, colligative properties",
    updatedAt: "23/11/2026",
  },
];

const INITIAL_HOMEWORK = [
  {
    id: "hw_1",
    batch: "10-A",
    subject: "Maths",
    title: "Exercise 5.2 ke Q1 se Q10 copy mein solve karein",
    dueDate: "Kal tak",
    assignedAt: "23/11/2026",
  },
];

const INITIAL_PRACTICE = [
  {
    id: "pq_1",
    batch: "10-A",
    subject: "Maths",
    title: "Arithmetic Progression — Home Practice Set #1",
    questionsText:
      "Q1. Find the 15th term of the AP: 3, 8, 13, 18...\nQ2. How many two-digit numbers are divisible by 3?",
    attachment: null,
    uploadedBy: "Prof. R. K. Verma",
    uploadedAt: "23/11/2026",
  },
];

function mapDbRowToStudent(row) {
  const admFee = Number(row.admission_fee ?? row.fee ?? 0);
  const paidAmt =
    row.paid_amount !== undefined && row.paid_amount !== null
      ? Number(row.paid_amount)
      : row.fee_status === "PAID"
        ? admFee
        : 0;
  const dueAmt =
    row.due_amount !== undefined && row.due_amount !== null
      ? Number(row.due_amount)
      : Math.max(0, admFee - paidAmt);

  return {
    id: row.id,
    admissionNo: row.admission_no || "",
    admissionDate: row.admission_date || "",
    rollNo: row.roll_no,
    name: row.name,
    fatherName: row.father_name,
    motherName: row.mother_name || "",
    dob: row.dob || "",
    gender: row.gender || "Male",
    parentPhone: row.parent_phone,
    address: row.address || "",
    batch: row.batch,
    admissionFee: admFee,
    paidAmount: paidAmt,
    dueAmount: dueAmt,
    fee: admFee,
    feeStatus: dueAmt <= 0 ? "PAID" : "PENDING",
    dueMonths: dueAmt > 0 ? 1 : 0,
    attendance: row.attendance,
    subjectAttendance: {
      maths: row.attendance || "P",
      physics: row.attendance || "P",
      chemistry: row.attendance || "P",
      english: row.attendance || "P",
    },
    marks: {
      maths: row.maths ?? 0,
      physics: row.physics ?? 0,
      chemistry: row.chemistry ?? 0,
      english: row.english ?? 0,
    },
    testCopies: {},
  };
}

export default function App() {
  const [instituteName] = useState("VIDYA COACHING INSTITUTE");
  const [session, setSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminTab, setAdminTab] = useState("fees");
  const [topSearch, setTopSearch] = useState("");
  const [inspectedStudentId, setInspectedStudentId] = useState(null);
  const [studentCopyModalOpen, setStudentCopyModalOpen] = useState(false);

  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState(() => {
    try {
      const saved = localStorage.getItem(TEACHERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_TEACHERS;
  });

  const [syllabusList, setSyllabusList] = useState(() => {
    try {
      const saved = localStorage.getItem(SYLLABUS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SYLLABUS;
  });

  const [homeworkList, setHomeworkList] = useState(() => {
    try {
      const saved = localStorage.getItem(HOMEWORK_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_HOMEWORK;
  });

  const [practiceList, setPracticeList] = useState(() => {
    try {
      const saved = localStorage.getItem(PRACTICE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRACTICE;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(
    isSupabaseConfigured ? "Supabase Sync" : "Browser Auto-Save",
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
    } catch {
      // ignore
    }
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem(SYLLABUS_KEY, JSON.stringify(syllabusList));
    } catch {
      // ignore
    }
  }, [syllabusList]);

  useEffect(() => {
    try {
      localStorage.setItem(HOMEWORK_KEY, JSON.stringify(homeworkList));
    } catch {
      // ignore
    }
  }, [homeworkList]);

  useEffect(() => {
    try {
      localStorage.setItem(PRACTICE_KEY, JSON.stringify(practiceList));
    } catch {
      // ignore
    }
  }, [practiceList]);

  useEffect(() => {
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [session]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    async function loadStudents() {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: true });
      if (!active) return;
      if (!error && data && data.length > 0) {
        setStudents(data.map(mapDbRowToStudent));
        setDbStatus("Supabase Live");
      }
    }
    loadStudents();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    async function loadTeachers() {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active || error || !data || data.length === 0) return;
      setTeachers(
        data.map((t) => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          loginId: t.login_id,
          password: t.password,
        })),
      );
    }
    loadTeachers();
    return () => {
      active = false;
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = topSearch.trim().toLowerCase();
    if (!q) return [];
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.admissionNo || "")
          .toLowerCase()
          .includes(q) ||
        String(s.rollNo || "")
          .toLowerCase()
          .includes(q),
    );
  }, [students, topSearch]);

  const inspectedStudent = useMemo(
    () => students.find((s) => s.id === inspectedStudentId) || null,
    [students, inspectedStudentId],
  );

  const handleAddStudent = async (newStudent) => {
    const admFee = Math.max(
      0,
      Number(newStudent.admissionFee ?? newStudent.fee ?? 0),
    );
    const paidAmt = Math.max(0, Number(newStudent.paidAmount ?? 0));
    const dueAmt = Math.max(0, Number(newStudent.dueAmount ?? 0));

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("students")
        .insert({
          admission_no: newStudent.admissionNo,
          admission_date: newStudent.admissionDate,
          roll_no: newStudent.rollNo,
          name: newStudent.name,
          father_name: newStudent.fatherName,
          mother_name: newStudent.motherName,
          dob: newStudent.dob,
          gender: newStudent.gender,
          parent_phone: newStudent.parentPhone,
          address: newStudent.address,
          batch: newStudent.batch,
          admission_fee: admFee,
          paid_amount: paidAmt,
          due_amount: dueAmt,
          fee: admFee,
          fee_status: dueAmt <= 0 ? "PAID" : "PENDING",
          attendance: newStudent.attendance || "P",
          maths: 0,
          physics: 0,
          chemistry: 0,
          english: 0,
        })
        .select()
        .single();

      if (!error && data) {
        setStudents((prev) => [...prev, mapDbRowToStudent(data)]);
        setDbStatus("Supabase Live");
        return;
      }
    }

    setStudents((prev) => [
      ...prev,
      {
        id: `local_${Date.now()}`,
        ...newStudent,
        admissionFee: admFee,
        paidAmount: paidAmt,
        dueAmount: dueAmt,
        fee: admFee,
        feeStatus: dueAmt <= 0 ? "PAID" : "PENDING",
        testCopies: {},
      },
    ]);
  };

  const handleSaveModifiedStudent = async (updatedStudent) => {
    const admFee = Math.max(
      0,
      Number(updatedStudent.admissionFee ?? updatedStudent.fee ?? 0),
    );
    const paidAmt = Math.max(0, Number(updatedStudent.paidAmount ?? 0));
    const dueAmt = Math.max(0, Number(updatedStudent.dueAmount ?? 0));

    const normalized = {
      ...updatedStudent,
      admissionFee: admFee,
      paidAmount: paidAmt,
      dueAmount: dueAmt,
      fee: admFee,
      feeStatus: dueAmt <= 0 ? "PAID" : "PENDING",
      dueMonths:
        dueAmt > 0 ? Math.max(1, Number(updatedStudent.dueMonths || 1)) : 0,
    };

    setStudents((prev) =>
      prev.map((s) => (s.id === normalized.id ? normalized : s)),
    );

    if (
      isSupabaseConfigured &&
      supabase &&
      !String(normalized.id).startsWith("s") &&
      !String(normalized.id).startsWith("local_")
    ) {
      await supabase
        .from("students")
        .update({
          admission_no: normalized.admissionNo,
          admission_date: normalized.admissionDate,
          roll_no: normalized.rollNo,
          name: normalized.name,
          father_name: normalized.fatherName,
          mother_name: normalized.motherName,
          dob: normalized.dob,
          gender: normalized.gender,
          parent_phone: normalized.parentPhone,
          address: normalized.address,
          batch: normalized.batch,
          admission_fee: admFee,
          paid_amount: paidAmt,
          due_amount: dueAmt,
          fee: admFee,
          fee_status: normalized.feeStatus,
          attendance: normalized.attendance,
        })
        .eq("id", normalized.id);
    }
  };

  const handleClearStudentDue = async (studentId) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const totalFee = Number(s.admissionFee ?? s.fee ?? 0);
        return {
          ...s,
          paidAmount: totalFee,
          dueAmount: 0,
          feeStatus: "PAID",
          dueMonths: 0,
        };
      }),
    );

    if (
      isSupabaseConfigured &&
      supabase &&
      !String(studentId).startsWith("s") &&
      !String(studentId).startsWith("local_")
    ) {
      const st = students.find((x) => x.id === studentId);
      const totalFee = Number(st?.admissionFee ?? st?.fee ?? 0);
      await supabase
        .from("students")
        .update({
          paid_amount: totalFee,
          due_amount: 0,
          fee_status: "PAID",
        })
        .eq("id", studentId);
    }
  };

  const handleCollectPartialFee = async (studentId, partialAmount) => {
    const addAmt = Math.max(0, Number(partialAmount) || 0);
    if (!addAmt) return;

    let nextPaidForDb = 0;
    let nextDueForDb = 0;
    let nextStatusForDb = "PENDING";

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const m = getStudentFeeMetrics(s);
        const applied = Math.min(addAmt, m.dueAmount);
        const updatedPaid = m.paidAmount + applied;
        const updatedDue = Math.max(0, m.dueAmount - applied);
        const updatedStatus = updatedDue <= 0 ? "PAID" : "PENDING";

        nextPaidForDb = updatedPaid;
        nextDueForDb = updatedDue;
        nextStatusForDb = updatedStatus;

        return {
          ...s,
          paidAmount: updatedPaid,
          dueAmount: updatedDue,
          feeStatus: updatedStatus,
          dueMonths:
            updatedDue <= 0 ? 0 : Math.max(1, Number(s.dueMonths || 1)),
        };
      }),
    );

    if (
      isSupabaseConfigured &&
      supabase &&
      !String(studentId).startsWith("s") &&
      !String(studentId).startsWith("local_")
    ) {
      await supabase
        .from("students")
        .update({
          paid_amount: nextPaidForDb,
          due_amount: nextDueForDb,
          fee_status: nextStatusForDb,
        })
        .eq("id", studentId);
    }
  };

  const handleAddTeacher = async (newTeacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from("teachers").insert({
        id: newTeacher.id,
        name: newTeacher.name,
        subject: newTeacher.subject,
        login_id: newTeacher.loginId,
        password: newTeacher.password,
      });
    }
  };

  const handleUpdateTeacherPassword = async (loginId, newPassword) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.loginId.toLowerCase() === String(loginId).toLowerCase()
          ? { ...t, password: newPassword }
          : t,
      ),
    );
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("teachers")
        .update({ password: newPassword })
        .ilike("login_id", String(loginId));
    }
  };

  const handleAddSyllabus = (newItem) =>
    setSyllabusList((prev) => [newItem, ...prev]);
  const handleEditSyllabus = (updatedItem) =>
    setSyllabusList((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
  const handleDeleteSyllabus = (id) =>
    setSyllabusList((prev) => prev.filter((item) => item.id !== id));
  const handleAssignHomework = (newHw) =>
    setHomeworkList((prev) => [newHw, ...prev]);

  const handleAddPracticeQuestion = (newPq) =>
    setPracticeList((prev) => [newPq, ...prev]);
  const handleDeletePracticeQuestion = (id) =>
    setPracticeList((prev) => prev.filter((item) => item.id !== id));

  const { totalCollected, totalDue } = useMemo(() => {
    let collected = 0;
    let due = 0;
    students.forEach((s) => {
      const m = getStudentFeeMetrics(s);
      collected += m.paidAmount;
      due += m.dueAmount;
    });
    return { totalCollected: collected, totalDue: due };
  }, [students]);

  const toggleAttendance = (id) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, attendance: s.attendance === "P" ? "A" : "P" }
          : s,
      ),
    );
  };

  if (!session) {
    return (
      <RoleLoginGate
        instituteName={instituteName}
        students={students}
        teachers={teachers}
        onLoginSuccess={setSession}
      />
    );
  }

  const activeStudent =
    students.find((s) => s.id === session.studentRecord?.id) ||
    students.find(
      (s) =>
        s.rollNo.toLowerCase() === String(session.userId || "").toLowerCase() ||
        String(s.parentPhone) === String(session.userId || "") ||
        String(s.admissionNo || "").toLowerCase() ===
          String(session.userId || "").toLowerCase(),
    ) ||
    students[0];

  const totalUploadedCopiesForActiveStudent = Object.values(
    activeStudent?.testCopies || {},
  ).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

  const downloadStudentOwnMarksheet = () => {
    if (!activeStudent) return;
    const total =
      Number(activeStudent.marks.maths || 0) +
      Number(activeStudent.marks.physics || 0) +
      Number(activeStudent.marks.chemistry || 0) +
      Number(activeStudent.marks.english || 0);
    const pct = ((total / 400) * 100).toFixed(1);
    const html = `
      <div class="header">
        <h1>${instituteName}</h1>
        <p>Student Self-Download Report Card</p>
        <div class="badge">PROGRESS REPORT</div>
      </div>
      <div class="meta"><span>Adm No: ${activeStudent.admissionNo || "—"} · Roll No: ${activeStudent.rollNo}</span><span>Batch: ${activeStudent.batch}</span></div>
      <table>
        <tr><th>Student Name</th><td>${activeStudent.name}</td><th>Father's Name</th><td>${activeStudent.fatherName}</td></tr>
      </table>
      <table>
        <thead><tr><th>Subject</th><th>Max</th><th>Obtained</th></tr></thead>
        <tbody>
          <tr><td>Maths</td><td>100</td><td>${activeStudent.marks.maths}</td></tr>
          <tr><td>Physics</td><td>100</td><td>${activeStudent.marks.physics}</td></tr>
          <tr><td>Chemistry</td><td>100</td><td>${activeStudent.marks.chemistry}</td></tr>
          <tr><td>English</td><td>100</td><td>${activeStudent.marks.english}</td></tr>
          <tr><th>TOTAL</th><th>400</th><th>${total} (${pct}%)</th></tr>
        </tbody>
      </table>
    `;
    printHtmlAsPdf(`Marksheet_${activeStudent.name}`, html);
  };

  return (
    <div className="relative min-h-screen bg-[#060913] text-slate-100 pb-28 overflow-x-hidden">
      <div className="pointer-events-none fixed -top-32 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl animate-float-slow" />
      <div className="pointer-events-none fixed bottom-10 right-1/5 w-[26rem] h-[26rem] rounded-full bg-purple-600/15 blur-3xl animate-float-delayed" />

      <header className="relative z-10 max-w-6xl mx-auto px-4 pt-5 pb-4">
        <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {session.role === "admin"
                    ? "ADMIN MODULE"
                    : session.role === "teacher"
                      ? `${String(session.assignedSubject || "SUBJECT").toUpperCase()} TEACHER MODULE`
                      : "STUDENT / PARENT MODULE"}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-cyan-300 flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> {dbStatus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5 bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                {instituteName}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setSession(null)}
              className="px-4 py-2 text-xs font-black rounded-xl border border-rose-400/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> SWITCH ROLE / LOGOUT
            </button>
          </div>

          {(session.role === "admin" || session.role === "teacher") && (
            <div className="relative">
              <div className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 glass-input">
                <Search className="w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  value={topSearch}
                  onChange={(e) => setTopSearch(e.target.value)}
                  placeholder="Student ke naam, admission no. ya roll no. se search karein..."
                  className="w-full text-xs sm:text-sm font-semibold bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 glass-panel rounded-2xl p-2 space-y-1">
                  {searchResults.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setInspectedStudentId(st.id);
                        setTopSearch("");
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/15 flex items-center justify-between text-xs font-bold transition"
                    >
                      <span className="text-white">
                        {st.name}{" "}
                        <span className="text-slate-400">
                          (Adm: {st.admissionNo || "—"} · Roll: {st.rollNo})
                        </span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                        Class {st.batch} · Open Detail
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {session.role === "admin" && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="px-3.5 py-2 text-xs rounded-xl btn-neon-primary flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> NEW ADMISSION
              </button>
              {[
                { id: "fees", label: "Fee Collection & Dues" },
                { id: "teachers", label: "Add Teacher & Passwords" },
                { id: "docs", label: "Receipt & Certificates" },
                { id: "syllabus", label: "Syllabus (Add/Edit/Del)" },
                { id: "marks", label: "Marks & Results" },
                { id: "whatsapp", label: "WhatsApp Reminder" },
                { id: "attendance", label: "Attendance" },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                    adminTab === tab.id
                      ? "bg-cyan-400/20 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.22)]"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main
        key={`${session.role}-${adminTab}`}
        className="relative z-10 max-w-6xl mx-auto px-4 pt-3 space-y-6 animate-panel-enter"
      >
        {session.role === "admin" && (
          <>
            {adminTab === "fees" && (
              <FeeCollectionManager
                students={students}
                onClearStudentDue={handleClearStudentDue}
                onCollectPartialFee={handleCollectPartialFee}
              />
            )}

            {adminTab === "teachers" && (
              <TeacherAccountsManager
                teachers={teachers}
                onAddTeacher={handleAddTeacher}
              />
            )}

            {adminTab === "docs" && (
              <div className="space-y-6">
                <ReceiptGenerator
                  students={students}
                  instituteName={instituteName}
                />
                <CertificateGenerator
                  students={students}
                  instituteName={instituteName}
                />
              </div>
            )}

            {adminTab === "syllabus" && (
              <SyllabusManager
                syllabusList={syllabusList}
                onAddSyllabus={handleAddSyllabus}
                onEditSyllabus={handleEditSyllabus}
                onDeleteSyllabus={handleDeleteSyllabus}
                canManage={true}
              />
            )}

            {adminTab === "marks" && (
              <MarksAndResults
                students={students}
                setStudents={setStudents}
                instituteName={instituteName}
              />
            )}

            {adminTab === "whatsapp" && (
              <WhatsAppTemplateBuilder
                students={students}
                instituteName={instituteName}
              />
            )}

            {adminTab === "attendance" && (
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-black text-white">
                  Attendance Register
                </h2>
                <div className="space-y-2.5">
                  {students.map((st) => (
                    <div
                      key={st.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl glass-subcard"
                    >
                      <div>
                        <p className="text-sm font-black text-white">
                          {st.name}{" "}
                          <span className="text-xs text-cyan-300">
                            ({st.batch} · Adm: {st.admissionNo || "—"} · Roll:{" "}
                            {st.rollNo})
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAttendance(st.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                          st.attendance === "P"
                            ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-200"
                            : "bg-rose-500/20 border border-rose-400/50 text-rose-200"
                        }`}
                      >
                        {st.attendance === "P" ? "PRESENT (P)" : "ABSENT (A)"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {session.role === "teacher" && (
          <TeacherSubjectWorkspace
            assignedSubject={session.assignedSubject || "Maths"}
            teacherName={session.teacherName}
            loginId={session.userId}
            onUpdatePassword={handleUpdateTeacherPassword}
            students={students}
            onUpdateStudents={setStudents}
            homeworkList={homeworkList}
            onAssignHomework={handleAssignHomework}
            practiceList={practiceList}
            onAddPracticeQuestion={handleAddPracticeQuestion}
            onDeletePracticeQuestion={handleDeletePracticeQuestion}
          />
        )}

        {session.role === "student" && activeStudent && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <h2 className="text-lg font-black flex items-center gap-2 text-white">
                  <CalendarClock className="w-5 h-5 text-cyan-400" /> Student
                  Profile &amp; Timetable
                </h2>
                <div className="p-3.5 rounded-xl glass-subcard text-xs space-y-1.5 font-semibold text-slate-200">
                  <p>
                    Name:{" "}
                    <span className="font-black text-white">
                      {activeStudent.name}
                    </span>
                  </p>
                  <p>
                    Adm No:{" "}
                    <span className="text-cyan-300">
                      {activeStudent.admissionNo || "—"}
                    </span>{" "}
                    · Roll No:{" "}
                    <span className="text-cyan-300">
                      {activeStudent.rollNo}
                    </span>{" "}
                    · Batch:{" "}
                    <span className="text-purple-300">
                      {activeStudent.batch}
                    </span>
                  </p>
                  <p>
                    Today's Attendance:{" "}
                    <span
                      className={
                        activeStudent.attendance === "P"
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }
                    >
                      {activeStudent.attendance === "P"
                        ? "Present (P)"
                        : "Absent (A)"}
                    </span>
                  </p>
                  <p>
                    Fee Paid:{" "}
                    <span className="text-emerald-300">
                      ₹
                      {Number(activeStudent.paidAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>{" "}
                    · Due:{" "}
                    <span className="text-rose-300">
                      ₹
                      {Number(activeStudent.dueAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </p>
                </div>
                <div className="space-y-2 text-xs font-bold">
                  <div className="p-3 rounded-xl glass-subcard flex justify-between">
                    <span className="text-cyan-200">4:00 PM — Mathematics</span>
                    <span className="text-slate-400">Room 101</span>
                  </div>
                  <div className="p-3 rounded-xl glass-subcard flex justify-between">
                    <span className="text-purple-200">5:00 PM — Physics</span>
                    <span className="text-slate-400">Room 102</span>
                  </div>
                  <div className="p-3 rounded-xl glass-subcard flex justify-between">
                    <span className="text-pink-200">6:00 PM — Chemistry</span>
                    <span className="text-slate-400">Room 103</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-black flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-purple-400" /> Marks,
                  Checked Copy &amp; Result PDF
                </h2>
                <div className="grid grid-cols-2 gap-2.5 text-xs font-black">
                  <div className="p-3 rounded-xl glass-subcard text-cyan-200">
                    Maths: {activeStudent.marks.maths}/100
                  </div>
                  <div className="p-3 rounded-xl glass-subcard text-purple-200">
                    Physics: {activeStudent.marks.physics}/100
                  </div>
                  <div className="p-3 rounded-xl glass-subcard text-pink-200">
                    Chemistry: {activeStudent.marks.chemistry}/100
                  </div>
                  <div className="p-3 rounded-xl glass-subcard text-emerald-200">
                    English: {activeStudent.marks.english}/100
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStudentCopyModalOpen(true)}
                    className="py-3 px-4 rounded-xl bg-purple-500/25 border border-purple-400/50 text-purple-100 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-purple-500/35"
                  >
                    <Eye className="w-4 h-4" /> VIEW CHECKED COPY (
                    {totalUploadedCopiesForActiveStudent})
                  </button>

                  <button
                    type="button"
                    onClick={downloadStudentOwnMarksheet}
                    className="py-3 px-4 rounded-xl btn-neon-primary text-xs uppercase tracking-wider"
                  >
                    DOWNLOAD RESULT PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Practice Questions for Home Practice */}
            <PracticeQuestionsViewer
              practiceList={practiceList}
              batchFilter={activeStudent.batch}
            />

            <div className="grid md:grid-cols-2 gap-5">
              <HomeworkManager
                homeworkList={homeworkList}
                canAssign={false}
                batchFilter={activeStudent.batch}
              />
              <SyllabusManager
                syllabusList={syllabusList}
                canManage={false}
                batchFilter={activeStudent.batch}
              />
            </div>

            <StudentAttendanceView student={activeStudent} />
          </div>
        )}
      </main>

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddStudent={handleAddStudent}
        students={students}
      />

      <StudentDetailModal
        student={inspectedStudent}
        onClose={() => setInspectedStudentId(null)}
        onSaveModifiedStudent={handleSaveModifiedStudent}
      />

      {studentCopyModalOpen && activeStudent && (
        <TestCopyViewerModal
          student={activeStudent}
          onClose={() => setStudentCopyModalOpen(false)}
        />
      )}

      <footer className="fixed bottom-0 inset-x-0 z-20 bg-[#060913]/85 backdrop-blur-xl border-t border-white/10 py-2.5 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2.5 text-xs font-bold">
          <div className="glass-subcard rounded-xl px-3 py-1.5 text-cyan-200 truncate">
            PAID: ₹{totalCollected.toLocaleString("en-IN")} · DUE: ₹
            {totalDue.toLocaleString("en-IN")}
          </div>
          <div className="glass-subcard rounded-xl px-3 py-1.5 text-purple-200 truncate text-center">
            ROLE: {session.role.toUpperCase()}
          </div>
          <div className="glass-subcard rounded-xl px-3 py-1.5 text-emerald-300 truncate text-right">
            {dbStatus.toUpperCase()}
          </div>
        </div>
      </footer>
    </div>
  );
}
