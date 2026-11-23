import React from "react";
import { HelpCircle, Download, FileText } from "lucide-react";

export default function PracticeQuestionsViewer({
  practiceList = [],
  batchFilter = "ALL",
}) {
  const visibleItems =
    batchFilter === "ALL"
      ? practiceList
      : practiceList.filter((q) => q.batch === batchFilter);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black flex items-center gap-2 text-white">
          <HelpCircle className="w-5 h-5 text-cyan-400" /> Home Practice
          Questions
        </h3>
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
          {visibleItems.length} SETS
        </span>
      </div>

      {visibleItems.length === 0 ? (
        <p className="text-xs font-bold text-slate-300 p-4 rounded-xl glass-subcard">
          Abhi aapki class ke liye koi practice question upload nahi hua hai.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((pq) => (
            <div
              key={pq.id}
              className="p-4 rounded-xl glass-subcard space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-purple-500/30 border border-purple-400/40 text-purple-200">
                    {pq.subject.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-white/10 text-cyan-200">
                    CLASS {pq.batch}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {pq.uploadedAt}
                </span>
              </div>

              <p className="text-sm font-black text-white">{pq.title}</p>
              {pq.questionsText && (
                <pre className="text-xs font-medium text-slate-200 whitespace-pre-wrap bg-black/35 p-3 rounded-xl border border-white/10">
                  {pq.questionsText}
                </pre>
              )}

              {pq.attachment && (
                <a
                  href={pq.attachment.dataUrl}
                  download={pq.attachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-black hover:bg-cyan-500/30"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <Download className="w-3.5 h-3.5" />
                  {pq.attachment.name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
