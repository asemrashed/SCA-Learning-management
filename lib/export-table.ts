/**
 * Dependency-free table export helpers.
 * - CSV opens directly in Excel (UTF-8 BOM keeps Bengali/Unicode intact).
 * - PDF uses a hidden iframe + print dialog (no pop-up window needed).
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
  preambleRows?: string[][],
): void {
  const tableLines = [headers, ...rows].map((cols) => cols.map(csvEscape).join(","))
  const preambleLines = (preambleRows ?? []).map((cols) => cols.map(csvEscape).join(","))
  const lines = preambleLines.length > 0 ? [...preambleLines, "", ...tableLines] : tableLines
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
  subtitle?: string | string[]
  headers: string[]
  rows: string[][]
}

export function printTableAsPdf({
  title,
  subtitle,
  headers,
  rows,
}: PrintTableOptions): boolean {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden"
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  if (!win) {
    iframe.remove()
    return false
  }

  const thead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")
  const tbody = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("")

  const generatedAt = new Date().toLocaleString("en-GB")
  const subtitleHtml = subtitle
    ? (Array.isArray(subtitle) ? subtitle : [subtitle])
        .filter(Boolean)
        .map((line) => `<p class="subtitle">${escapeHtml(line)}</p>`)
        .join("")
    : ""

  win.document.open()
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
  ${subtitleHtml}
  <p class="generated">Generated ${escapeHtml(generatedAt)} · ${rows.length} record(s)</p>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
</body>
</html>`)
  win.document.close()

  let cleanedUp = false
  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    iframe.remove()
  }

  win.onafterprint = cleanup
  window.setTimeout(cleanup, 60_000)

  window.setTimeout(() => {
    win.focus()
    win.print()
  }, 250)

  return true
}
