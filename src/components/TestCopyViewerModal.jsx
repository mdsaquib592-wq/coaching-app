import React from "react";
import { X, FileText, Download, Image as ImageIcon } from "lucide-react";

export default function TestCopyViewerModal({
  student,
  subjectFilter = null,
  onClose,
}) {
  if (!student) return null;

  const copiesMap = student.testCopies || {};
  const entries = Object.entries(copiesMap).filter(([subj, files]) => {
    if (!Array.isArray(files) || files.length === 0) return false;
    if (subjectFilter) {
      return subj.toLowerCase() === subjectFilter.toLowerCase();
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl glass-panel animate-panel-enter rounded-3xl p-5 sm:p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              CHECKED TEST ANSWER SHEET · ROLL {student.rollNo}
            </p>
            <h3 className="text-xl font-black text-white mt-0.5">
              {student.name} — Checked Test Copy
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-rose-500/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="p-6 rounded-2xl glass-subcard text-center text-xs font-bold text-slate-300">
            Abhi is student ke liye koi checked test copy upload nahi ki gayi
            hai.
          </div>
        ) : (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {entries.map(([subjectKey, files]) => (
              <div key={subjectKey} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                    Subject: {subjectKey.toUpperCase()} ({files.length}{" "}
                    {files.length === 1 ? "file" : "files"})
                  </span>
                  <span className="text-xs font-bold text-purple-200">
                    Marks: {student.marks?.[subjectKey] ?? 0}/100
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {files.map((file, idx) => {
                    const isPdf =
                      file.type === "application/pdf" ||
                      String(file.name || "")
                        .toLowerCase()
                        .endsWith(".pdf");

                    return (
                      <div
                        key={file.id || idx}
                        className="p-3 rounded-2xl glass-subcard space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-white truncate flex items-center gap-1.5">
                            {isPdf ? (
                              <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                            )}
                            {file.name || `Page_${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {file.uploadedAt || ""}
                          </span>
                        </div>

                        {isPdf ? (
                          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-2">
                            <FileText className="w-8 h-8 text-rose-400 mx-auto" />
                            <p className="text-[11px] font-bold text-slate-300">
                              PDF Answer Sheet Attached
                            </p>
                          </div>
                        ) : (
                          <img
                            src={file.dataUrl}
                            alt={file.name || `Copy Page ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-xl border border-white/15"
                          />
                        )}

                        <a
                          href={file.dataUrl}
                          download={
                            file.name || `${student.name}_${subjectKey}_copy`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 px-3 rounded-xl btn-neon-primary text-xs text-center flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> OPEN / DOWNLOAD
                          COPY
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
