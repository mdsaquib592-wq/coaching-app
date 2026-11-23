import React, { useState } from "react";
import { ClipboardList, Send } from "lucide-react";

export default function HomeworkManager({
  homeworkList,
  onAssignHomework,
  canAssign = false,
  batchFilter = "ALL",
}) {
  const [batch, setBatch] = useState("10-A");
  const [subject, setSubject] = useState("Maths");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("Kal tak");

  const visibleHomeworks =
    batchFilter === "ALL"
      ? homeworkList
      : homeworkList.filter((hw) => hw.batch === batchFilter);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAssignHomework({
      id: `hw_${Date.now()}`,
      batch: batch.trim() || "10-A",
      subject: subject.trim() || "Maths",
      title: title.trim(),
      dueDate: dueDate.trim() || "Kal tak",
      assignedAt: new Date().toLocaleDateString("en-IN"),
    });

    setTitle("");
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-teal-700" />
          {canAssign
            ? "Subject-Wise Homework Assign Karein"
            : "Mera Homework (Subject-Wise)"}
        </h3>
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-100 border border-[#18181B]">
          {visibleHomeworks.length} TASKS
        </span>
      </div>

      {canAssign && (
        <form
          onSubmit={handleAssign}
          className="p-4 rounded-2xl bg-[#F7F3E8] border-2 border-[#18181B] space-y-3 text-xs"
        >
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1">Batch</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="10-A"
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              >
                <option value="Maths">Maths</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Submit Kab Tak</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Kal tak"
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Jaise: Exercise 5.2 ke Q1 se Q12 solve karein"
              className="flex-1 px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#18181B] text-white font-black flex items-center justify-center gap-1.5 hover:bg-zinc-800"
            >
              <Send className="w-4 h-4" /> ASSIGN HOMEWORK
            </button>
          </div>
        </form>
      )}

      {visibleHomeworks.length === 0 ? (
        <p className="text-xs font-bold text-zinc-600 p-4 rounded-xl bg-[#F7F3E8] border border-[#18181B]">
          Abhi koi homework assign nahi kiya gaya hai.
        </p>
      ) : (
        <div className="space-y-2.5">
          {visibleHomeworks.map((hw) => (
            <div
              key={hw.id}
              className="p-3.5 rounded-xl border border-[#18181B] bg-[#F7F3E8] flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-teal-700 text-white">
                    {hw.subject.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white border border-[#18181B]">
                    BATCH: {hw.batch}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600">
                    Assigned: {hw.assignedAt}
                  </span>
                </div>
                <p className="text-sm font-black mt-1">{hw.title}</p>
              </div>

              <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-200 border border-[#18181B]">
                Due: {hw.dueDate}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
