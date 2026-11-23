export function printHtmlAsPdf(title, bodyHtml) {
  const printWindow = window.open("", "_blank", "width=920,height=720");
  if (!printWindow) {
    alert(
      "Browser ne popup block kar diya hai. Kripya address bar se Popup allow karein.",
    );
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
          body { margin: 0; padding: 24px; color: #18181b; background: #fff; }
          .doc-box { border: 2px solid #18181b; padding: 28px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #18181b; padding-bottom: 14px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #52525b; }
          .badge { display: inline-block; margin-top: 10px; padding: 4px 14px; border: 1.5px solid #18181b; font-weight: 800; font-size: 13px; text-transform: uppercase; background: #f7f3e8; }
          .meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 18px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th, td { border: 1.5px solid #18181b; padding: 9px 12px; text-align: left; }
          th { background: #f7f3e8; font-weight: 800; }
          .cert-text { font-size: 15px; line-height: 1.9; margin: 24px 0; text-align: justify; }
          .signatures { display: flex; justify-content: space-between; margin-top: 56px; font-size: 13px; font-weight: 700; }
          .sig-line { border-top: 1.5px solid #18181b; padding-top: 6px; width: 185px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="doc-box">
          ${bodyHtml}
        </div>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
