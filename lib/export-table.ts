/**
 * Dependency-free table export helpers.
 * - CSV opens directly in Excel (UTF-8 BOM keeps Bengali/Unicode intact).
 * - PDF uses a print window so the admin can "Save as PDF" without extra libs.
 */

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: string[][],
): void {
  const lines = [headers, ...rows].map((cols) => cols.map(csvEscape).join(","))
  // Leading BOM so Excel detects UTF-8 (otherwise Bengali text is garbled).
  const csv = `\uFEFF${lines.join("\r\n")}`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, filename)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export interface PrintTableOptions {
  title: string
  subtitle?: string
  headers: string[]
  rows: string[][]
}

export function printTableAsPdf({
  title,
  subtitle,
  headers,
  rows,
}: PrintTableOptions): boolean {
  const win = window.open("", "_blank", "width=1024,height=768")
  if (!win) return false

  const thead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")
  const tbody = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("")

  const generatedAt = new Date().toLocaleString("en-GB")

  win.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .subtitle { font-size: 12px; color: #555; margin: 0 0 2px; }
  .generated { font-size: 11px; color: #888; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
  thead th { background: #f2f2f2; }
  tbody tr:nth-child(even) { background: #fafafa; }
  @media print {
    body { margin: 12mm; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
  <p class="generated">Generated ${escapeHtml(generatedAt)} · ${rows.length} record(s)</p>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
    window.onafterprint = function () { window.close(); };
  </script>
</body>
</html>`)
  win.document.close()
  return true
}
