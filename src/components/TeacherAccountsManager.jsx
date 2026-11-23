import React, { useState } from "react";
import { UserPlus, Eye, EyeOff, KeyRound } from "lucide-react";

const SUBJECT_OPTIONS = [
  "Hindi",
  "English",
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Science",
  "Computer",
  "Other",
];

export default function TeacherAccountsManager({ teachers, onAddTeacher }) {
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Maths");
  const [customSubject, setCustomSubject] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSubject =
      selectedSubject === "Other" ? customSubject.trim() : selectedSubject;

    if (!name.trim() || !finalSubject || !loginId.trim() || !password.trim()) {
      return;
    }

    onAddTeacher({
      id: `tch_${Date.now()}`,
      name: name.trim(),
      subject: finalSubject,
      loginId: loginId.trim(),
      password: password.trim(),
    });

    setName("");
    setCustomSubject("");
    setLoginId("");
    setPassword("");
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-5">
      <div>
        <h3 className="text-lg font-black flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-teal-700" /> Add Teacher &amp;
          Credentials
        </h3>
        <p className="text-xs text-zinc-600">
          Naye teacher ka subject set karke Login ID aur Password dein. Agar
          subject list mein nahi hai to <strong>Other</strong> chunekar apna
          subject likhein.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-2xl bg-[#F7F3E8] border-2 border-[#18181B] space-y-3 text-xs"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="font-bold block mb-1">Teacher Name *</label>
            <input
              type="text"
              required
              placeholder="Prof. Amit Sir"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1">Login ID *</label>
            <input
              type="text"
              required
              placeholder="TCH-105"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Password *</label>
            <input
              type="text"
              required
              placeholder="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-[#18181B] text-white font-black hover:bg-zinc-800"
            >
              ADD TEACHER
            </button>
          </div>
        </div>

        {selectedSubject === "Other" && (
          <div className="max-w-md pt-1">
            <label className="font-black block mb-1 text-teal-900">
              Other Subject Ka Naam Daalein *
            </label>
            <input
              type="text"
              required
              placeholder="Jaise: Economics, Accountancy, Sanskrit..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
          </div>
        )}
      </form>

      <div className="space-y-2.5">
        {teachers.map((tch) => {
          const isShown = Boolean(visiblePasswords[tch.id]);
          return (
            <div
              key={tch.id}
              className="p-3.5 rounded-xl border border-[#18181B] bg-[#F7F3E8] flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div>
                <p className="text-sm font-black">
                  {tch.name}{" "}
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-200 border border-[#18181B] ml-1">
                    {tch.subject}
                  </span>
                </p>
                <p className="text-zinc-700 font-bold mt-0.5">
                  Login ID:{" "}
                  <span className="font-mono font-black">{tch.loginId}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-white border border-[#18181B] font-mono font-black flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  {isShown ? tch.password : "••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(tch.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] text-white font-black flex items-center gap-1"
                >
                  {isShown ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  {isShown ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
