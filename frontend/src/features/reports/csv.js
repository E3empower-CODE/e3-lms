/**
 * Build a CSV string from rows. Values are quoted and, crucially, sanitized
 * against CSV/formula injection: any cell beginning with = + - @ (or a control
 * char that spreadsheet apps treat as a formula lead) is prefixed with a single
 * quote so it is never evaluated as a formula.
 *
 * @param {{key:string,label:string}[]} columns
 * @param {object[]} rows
 */
export function toCsv(columns, rows) {
  const escapeCell = (value) => {
    let s = value == null ? '' : String(value)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    // Quote and double any embedded quotes.
    return `"${s.replace(/"/g, '""')}"`
  }
  const header = columns.map((c) => escapeCell(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(','))
    .join('\r\n')
  return body ? `${header}\r\n${body}` : header
}

/** Trigger a client-side download of CSV text (real browser; not sandboxed). */
export function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
