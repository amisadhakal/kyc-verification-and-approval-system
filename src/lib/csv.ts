export interface CsvRow {
  name: string;
  phone: string;
  membershipCode: string;
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out.map((s) => s.replace(/^﻿/, "").trim());
}

export function parseCsv(text: string): { rows: CsvRow[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must have a header row and at least one data row."] };
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase().trim());
  const idx = {
    name: headers.findIndex((h) => /name|member|subscriber|person|full/i.test(h)),
    phone: headers.findIndex((h) => /phone|mobile|mobile|contact|number|mob/i.test(h)),
    code: headers.findIndex((h) => /mem|code|member/i.test(h)),
  };

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    const name = (idx.name >= 0 ? cells[idx.name] : "") || "";
    const phone = (idx.phone >= 0 ? cells[idx.phone] : "") || "";
    const code = (idx.code >= 0 ? cells[idx.code] : "") || "";
    if (!name && !phone) continue;
    rows.push({ name, phone, membershipCode: code });
  }

  if (rows.length === 0) errors.push("No valid data rows found.");
  return { rows, errors };
}
