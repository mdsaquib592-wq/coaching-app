import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  MessageSquarePlus,
  Plus,
} from "lucide-react";

const PRESET_TEMPLATES = [
  {
    id: "fee_due",
    name: "Fee Reminder",
    category: "FEES",
    body: "Namaste {{parent_name}} ji, {{student_name}} ({{batch}}) ki monthly fee ₹{{fee_amount}} baaki hai. Kripya jald jama karein. - {{institute_name}}",
  },
  {
    id: "absent_alert",
    name: "Absent Alert",
    category: "ATTENDANCE",
    body: "Alert: {{student_name}} ({{batch}}) aaj class mein absent hain. Kripya confirm karein. - {{institute_name}}",
  },
  {
    id: "result_share",
    name: "Result Share",
    category: "RESULTS",
    body: "Namaste {{parent_name}} ji, {{student_name}} ka result: {{total_marks}}/400 ({{percentage}}%). - {{institute_name}}",
  },
];

export default function WhatsAppTemplateBuilder({ students, instituteName }) {
  const [templates, setTemplates] = useState(PRESET_TEMPLATES);
  const [selectedTplId, setSelectedTplId] = useState("fee_due");
  const [tplName, setTplName] = useState(PRESET_TEMPLATES[0].name);
  const [tplCategory, setTplCategory] = useState(PRESET_TEMPLATES[0].category);
  const [tplBody, setTplBody] = useState(PRESET_TEMPLATES[0].body);
  const [previewStudentId, setPreviewStudentId] = useState(
    students[0]?.id || "",
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!students.length) return;
    if (!students.find((s) => s.id === previewStudentId)) {
      setPreviewStudentId(students[0].id);
    }
  }, [students, previewStudentId]);

  const st = students.find((s) => s.id === previewStudentId) || students[0];

  const selectTemplate = (tpl) => {
    setSelectedTplId(tpl.id);
    setTplName(tpl.name);
    setTplCategory(tpl.category);
    setTplBody(tpl.body);
  };

  const insertVariable = (token) => {
    setTplBody((prev) => `${prev} ${token}`.trim());
  };

  const saveAsNewTemplate = () => {
    if (!tplName.trim() || !tplBody.trim()) return;
    const newTpl = {
      id: `custom_${Date.now()}`,
      name: tplName.trim(),
      category: tplCategory,
      body: tplBody.trim(),
    };
    setTemplates((prev) => [newTpl, ...prev]);
    setSelectedTplId(newTpl.id);
  };

  const compiledMessage = (() => {
    if (!st) return tplBody;
    const total =
      (Number(st.marks?.maths) || 0) +
      (Number(st.marks?.physics) || 0) +
      (Number(st.marks?.chemistry) || 0) +
      (Number(st.marks?.english) || 0);
    const pct = ((total / 400) * 100).toFixed(1);

    return tplBody
      .replaceAll("{{student_name}}", st.name)
      .replaceAll("{{parent_name}}", st.fatherName)
      .replaceAll("{{batch}}", st.batch)
      .replaceAll("{{fee_amount}}", String(st.fee))
      .replaceAll("{{total_marks}}", String(total))
      .replaceAll("{{percentage}}", pct)
      .replaceAll("{{institute_name}}", instituteName);
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const cleanPhone = (st?.parentPhone || "9876543210").replace(/\D/g, "");
  const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(compiledMessage)}`;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-emerald-700" /> WhatsApp
            Template Builder
          </h3>
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 border border-[#18181B]">
            TEMPLATES
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => selectTemplate(t)}
              className={`px-2.5 py-1 rounded-lg border border-[#18181B] text-xs font-bold ${
                selectedTplId === t.id
                  ? "bg-[#18181B] text-white"
                  : "bg-[#F7F3E8]"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-xs font-bold block mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold border-2 border-[#18181B] rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Category</label>
            <select
              value={tplCategory}
              onChange={(e) => setTplCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
            >
              <option value="FEES">FEES</option>
              <option value="ATTENDANCE">ATTENDANCE</option>
              <option value="RESULTS">RESULTS</option>
              <option value="ENQUIRY">ENQUIRY</option>
            </select>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black text-zinc-600 mb-1.5">
            Variable par click karke message mein jodein:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "{{student_name}}",
              "{{parent_name}}",
              "{{batch}}",
              "{{fee_amount}}",
              "{{total_marks}}",
              "{{percentage}}",
              "{{institute_name}}",
            ].map((variable) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="px-2 py-1 text-[11px] font-mono font-bold rounded-lg bg-amber-100 border border-[#18181B] hover:bg-amber-200"
              >
                + {variable}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">Message Text</label>
          <textarea
            rows={4}
            value={tplBody}
            onChange={(e) => setTplBody(e.target.value)}
            className="w-full p-3 text-xs font-medium border-2 border-[#18181B] rounded-xl bg-[#F7F3E8]"
          />
        </div>

        <button
          type="button"
          onClick={saveAsNewTemplate}
          className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-black flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> SAVE NEW TEMPLATE
        </button>
      </div>

      <div className="bg-white border-2 border-[#18181B] rounded-2xl p-5 shadow-[4px_4px_0px_#18181B] flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-base">Live WhatsApp Preview</h4>
            <select
              value={previewStudentId}
              onChange={(e) => setPreviewStudentId(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold border border-[#18181B] rounded-lg bg-[#F7F3E8]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  Student: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-[#E7FFDB] border-2 border-[#18181B] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black text-emerald-900">
              <span>{instituteName}</span>
              <span>{tplCategory}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-zinc-900 whitespace-pre-line">
              {compiledMessage}
            </p>
            <p className="text-[10px] text-right text-zinc-600 font-bold">
              To: +{waPhone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl border-2 border-[#18181B] bg-[#F7F3E8] text-xs font-black flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "COPIED!" : "COPY TEXT"}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 hover:bg-emerald-800"
          >
            <ExternalLink className="w-4 h-4" /> WHATSAPP PAR BHEJEIN
          </a>
        </div>
      </div>
    </div>
  );
}
