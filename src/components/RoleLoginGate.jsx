import React, { useState } from "react";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  Smartphone,
  ArrowRight,
  KeyRound,
  BookMarked,
  Sparkles,
} from "lucide-react";

const ROLE_CONFIG = {
  student: {
    title: "Student Module",
    subtitle: "Timetable, Homework, Syllabus aur apni Marks/Attendance dekhein",
    badge: "STUDENT PORTAL",
    glow: "from-pink-500/25 to-purple-500/20 border-pink-400/50",
    idLabel: "Student Roll No., Adm No. ya Phone",
    idPlaceholder: "1001, 1 ya 9876543210",
    defaultId: "1001",
    defaultCode: "1111",
    codeHint: "Demo PIN: 1111",
    icon: GraduationCap,
  },
  teacher: {
    title: "Teacher Module",
    subtitle:
      "Sirf apne subject ka Homework, Attendance aur Marks manage karein",
    badge: "FACULTY PORTAL",
    glow: "from-cyan-500/25 to-teal-500/20 border-cyan-400/50",
    idLabel: "Teacher Login ID",
    idPlaceholder: "TCH-MATH",
    defaultId: "TCH-MATH",
    defaultCode: "2222",
    codeHint: "Demo Password: 2222",
    icon: Users,
  },
  admin: {
    title: "Admin / Owner Module",
    subtitle:
      "New Admission, Fee Dues, Teachers, Certificates, Syllabus & WhatsApp",
    badge: "ADMIN / MALIK PORTAL",
    glow: "from-violet-500/25 to-indigo-500/20 border-violet-400/50",
    idLabel: "Admin ID ya Phone No.",
    idPlaceholder: "ADMIN-01",
    defaultId: "ADMIN-01",
    defaultCode: "9999",
    codeHint: "Demo Admin PIN: 9999",
    icon: ShieldCheck,
  },
};

export default function RoleLoginGate({
  instituteName,
  students = [],
  teachers = [],
  onLoginSuccess,
}) {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [userId, setUserId] = useState(ROLE_CONFIG.admin.defaultId);
  const [passcode, setPasscode] = useState(ROLE_CONFIG.admin.defaultCode);
  const [teacherSubject, setTeacherSubject] = useState("Maths");
  const [errorMsg, setErrorMsg] = useState("");

  const currentRole = ROLE_CONFIG[selectedRole];
  const ActiveIcon = currentRole.icon;

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === "teacher" && teachers.length > 0) {
      setUserId(teachers[0].loginId);
      setPasscode(teachers[0].password);
      setTeacherSubject(teachers[0].subject);
    } else {
      setUserId(ROLE_CONFIG[roleKey].defaultId);
      setPasscode(ROLE_CONFIG[roleKey].defaultCode);
    }
    setErrorMsg("");
  };

  const handleTeacherPresetPick = (tch) => {
    setUserId(tch.loginId);
    setTeacherSubject(tch.subject);
    setPasscode(tch.password);
    setErrorMsg("");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const cleanId = userId.trim();
    const cleanCode = passcode.trim();

    if (!cleanId || cleanCode.length < 4) {
      setErrorMsg(
        "Kripya valid ID/Phone aur kam se kam 4-digit Password/PIN daalein.",
      );
      return;
    }

    let matchedStudent = null;
    if (selectedRole === "student") {
      matchedStudent =
        students.find(
          (s) =>
            String(s.admissionNo || "").toLowerCase() ===
              cleanId.toLowerCase() ||
            String(s.rollNo || "").toLowerCase() === cleanId.toLowerCase() ||
            String(s.parentPhone) === cleanId,
        ) ||
        students[0] ||
        null;
    }

    let matchedTeacher = null;
    if (selectedRole === "teacher") {
      const foundDbTeacher = teachers.find(
        (t) => t.loginId.toLowerCase() === cleanId.toLowerCase(),
      );
      if (foundDbTeacher && foundDbTeacher.password !== cleanCode) {
        setErrorMsg("Galat Teacher Password! Kripya sahi password daalein.");
        return;
      }
      matchedTeacher = foundDbTeacher || {
        id: cleanId.toUpperCase(),
        name: `Faculty (${teacherSubject})`,
        subject: teacherSubject,
      };
    }

    setErrorMsg("");
    onLoginSuccess({
      role: selectedRole,
      userId: cleanId,
      studentRecord: matchedStudent,
      assignedSubject:
        selectedRole === "teacher"
          ? matchedTeacher?.subject || teacherSubject
          : null,
      teacherName: matchedTeacher?.name || null,
    });
  };

  return (
    <div className="relative min-h-screen bg-[#060913] text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient Neon Orbs */}
      <div className="pointer-events-none absolute -top-28 -left-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-600/20 blur-3xl animate-float-delayed" />

      <div className="relative z-10 w-full max-w-4xl glass-panel animate-panel-enter animate-glow-pulse rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> NEXT-GEN INSTITUTE OS · ROLE
              GATEWAY
            </p>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-1 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
              {instituteName}
            </h1>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> SECURE ACCESS
          </span>
        </div>

        {/* 3 Role Cards */}
        <div className="grid sm:grid-cols-3 gap-3.5">
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedRole === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleSelect(key)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-br ${cfg.glow} shadow-[0_0_24px_rgba(34,211,238,0.18)] -translate-y-0.5`
                    : "glass-subcard opacity-85 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white/10 text-cyan-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-black/40 border border-white/15 text-slate-200">
                    {cfg.badge}
                  </span>
                </div>
                <p className="font-black text-base mt-3 text-white">
                  {cfg.title}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {cfg.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLoginSubmit}
          className="glass-subcard rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <ActiveIcon className="w-5 h-5" />
              <h2 className="text-lg font-black text-white">
                {currentRole.title} mein Login Karein
              </h2>
            </div>

            {selectedRole === "teacher" && teachers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {teachers.slice(0, 5).map((tp) => (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => handleTeacherPresetPick(tp)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
                      userId.toLowerCase() === tp.loginId.toLowerCase()
                        ? "bg-cyan-400/20 border-cyan-400 text-cyan-200"
                        : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {tp.subject} ({tp.loginId})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`grid gap-4 ${
              selectedRole === "teacher" ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />{" "}
                {currentRole.idLabel}
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={currentRole.idPlaceholder}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl glass-input"
              />
            </div>

            {selectedRole === "teacher" && (
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-purple-400" /> Subject
                </label>
                <input
                  type="text"
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl glass-input"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Password /
                PIN
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl glass-input"
              />
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                {currentRole.codeHint}
              </p>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-400/40 rounded-xl px-3.5 py-2.5">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl btn-neon-primary text-xs tracking-wider uppercase flex items-center justify-center gap-2"
          >
            ENTER{" "}
            {selectedRole === "teacher"
              ? `${teacherSubject.toUpperCase()} TEACHER MODULE`
              : currentRole.title.toUpperCase()}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
