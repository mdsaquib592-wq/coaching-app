import React, { useState } from "react";
import { BookOpen, Plus, Trash2, Pencil, X } from "lucide-react";

export default function SyllabusManager({
  syllabusList,
  onAddSyllabus,
  onEditSyllabus,
  onDeleteSyllabus,
  canManage = false,
  batchFilter = "ALL",
}) {
  const [batch, setBatch] = useState("10-A");
  const [subject, setSubject] = useState("Maths");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [editingId, setEditingId] = useState(null);

  const visibleItems =
    batchFilter === "ALL"
      ? syllabusList
      : syllabusList.filter((item) => item.batch === batchFilter);

  const startEdit = (item) => {
    setEditingId(item.id);
    setBatch(item.batch);
    setSubject(item.subject);
    setTopic(item.topic);
    setDetails(item.details || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTopic("");
    setDetails("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (editingId && onEditSyllabus) {
      onEditSyllabus({
        id: editingId,
        batch: batch.trim() || "10-A",
        subject: subject.trim() || "Maths",
        topic: topic.trim(),
        details: details.trim() || "Chapter overview & practice questions",
        updatedAt: new Date().toLocaleDateString("en-IN"),
      });
      cancelEdit();
      return;
    }

    onAddSyllabus({
      id: `syl_${Date.now()}`,
      batch: batch.trim() || "10-A",
      subject: subject.trim() || "Maths",
      topic: topic.trim(),
      details: details.trim() || "Chapter overview & practice questions",
      updatedAt: new Date().toLocaleDateString("en-IN"),
    });

    setTopic("");
    setDetails("");
  };

  return (
    <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-700" />
          {canManage
            ? "Syllabus Manager (Add, Edit & Delete)"
            : "Course Syllabus"}
        </h3>
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 border border-[#18181B]">
          {visibleItems.length} TOPICS
        </span>
      </div>

      {canManage && (
        <form
          onSubmit={handleSubmit}
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
              <label className="font-bold block mb-1">Chapter / Topic *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ch-6: Quadratic Equations"
                className="w-full px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Syllabus notes / sub-topics"
              className="flex-1 px-3 py-2 font-bold border-2 border-[#18181B] rounded-xl bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#18181B] text-white font-black flex items-center justify-center gap-1.5 hover:bg-zinc-800"
            >
              <Plus className="w-4 h-4" />
              {editingId ? "UPDATE SYLLABUS" : "ADD SYLLABUS"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-2 rounded-xl border-2 border-[#18181B] bg-white font-black flex items-center gap-1"
              >
                <X className="w-4 h-4" /> CANCEL
              </button>
            )}
          </div>
        </form>
      )}

      {visibleItems.length === 0 ? (
        <p className="text-xs font-bold text-zinc-600 p-4 rounded-xl bg-[#F7F3E8] border border-[#18181B]">
          Abhi is batch ke liye koi syllabus add nahi kiya gaya hai.
        </p>
      ) : (
        <div className="space-y-2.5">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-[#18181B] bg-[#F7F3E8]"
            >
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-600 text-white">
                    {item.subject.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white border border-[#18181B]">
                    BATCH: {item.batch}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600">
                    {item.updatedAt}
                  </span>
                </div>
                <p className="text-sm font-black">{item.topic}</p>
                <p className="text-xs text-zinc-700">{item.details}</p>
              </div>

              {canManage && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 rounded-lg bg-amber-300 border border-[#18181B] text-xs font-black flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" /> EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSyllabus(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-black flex items-center gap-1 hover:bg-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
