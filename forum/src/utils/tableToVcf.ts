export type ContactField = 'name' | 'phone' | 'email' | 'organization' | 'title' | 'note';

export type ContactColumnMapping = Record<ContactField, number | null>;

export type ContactTable = {
  headers: string[];
  rows: string[][];
};

export type VCardConversionResult = {
  content: string;
  contactCount: number;
  skippedRowCount: number;
};

const HEADER_ALIASES: Record<ContactField, string[]> = {
  name: ['姓名', '名称', '联系人', '名字', 'name', 'fullname', 'fn'],
  phone: ['手机号', '手机号码', '手机', '联系电话', '电话号码', '电话', '移动电话', 'mobile', 'phone', 'tel', 'telephone'],
  email: ['邮箱', '电子邮箱', '电子邮件', '邮件', 'email', 'mail'],
  organization: ['单位', '公司', '组织', '机构', '部门', 'organization', 'organisation', 'company', 'org'],
  title: ['职位', '职务', '岗位', 'title', 'jobtitle', 'position'],
  note: ['备注', '注释', '说明', 'note', 'notes', 'remark', 'remarks'],
};

export const EMPTY_CONTACT_MAPPING: ContactColumnMapping = {
  name: null,
  phone: null,
  email: null,
  organization: null,
  title: null,
  note: null,
};

export function normalizeContactTable(rows: unknown[][]): ContactTable {
  const populatedRows = rows
    .map((row) => row.map(contactCellText))
    .filter((row) => row.some(Boolean));

  if (populatedRows.length < 2) {
    throw new Error('表格中没有可转换的数据。');
  }

  const columnCount = Math.max(...populatedRows.map((row) => row.length));
  const headers = Array.from({ length: columnCount }, (_, index) => (
    populatedRows[0][index] || `第 ${index + 1} 列`
  ));
  const dataRows = populatedRows
    .slice(1)
    .map((row) => Array.from({ length: columnCount }, (_, index) => row[index] ?? ''))
    .filter((row) => row.some(Boolean));

  if (dataRows.length === 0) {
    throw new Error('表格中没有可转换的数据。');
  }

  return { headers, rows: dataRows };
}

export function inferContactColumnMapping(headers: string[]): ContactColumnMapping {
  const normalizedHeaders = headers.map(normalizeHeader);
  return Object.fromEntries(
    (Object.keys(HEADER_ALIASES) as ContactField[]).map((field) => {
      const aliases = new Set(HEADER_ALIASES[field].map(normalizeHeader));
      const columnIndex = normalizedHeaders.findIndex((header) => aliases.has(header));
      return [field, columnIndex >= 0 ? columnIndex : null];
    }),
  ) as ContactColumnMapping;
}

export function convertTableToVcf(
  rows: string[][],
  mapping: ContactColumnMapping,
): VCardConversionResult {
  const cards: string[] = [];
  let skippedRowCount = 0;

  for (const row of rows) {
    const name = mappedCell(row, mapping.name);
    const phones = splitMultipleValues(mappedCell(row, mapping.phone));
    const emails = splitMultipleValues(mappedCell(row, mapping.email));
    const organization = mappedCell(row, mapping.organization);
    const title = mappedCell(row, mapping.title);
    const note = mappedCell(row, mapping.note);
    const displayName = name || phones[0] || emails[0];

    if (!displayName) {
      skippedRowCount += 1;
      continue;
    }

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:;${escapeVCardText(displayName)};;;`,
      `FN:${escapeVCardText(displayName)}`,
      ...phones.map((phone) => `TEL;TYPE=CELL:${escapeVCardText(phone)}`),
      ...emails.map((email) => `EMAIL;TYPE=INTERNET:${escapeVCardText(email)}`),
      ...(organization ? [`ORG:${escapeVCardText(organization)}`] : []),
      ...(title ? [`TITLE:${escapeVCardText(title)}`] : []),
      ...(note ? [`NOTE:${escapeVCardText(note)}`] : []),
      'END:VCARD',
    ];
    cards.push(lines.map(foldVCardLine).join('\r\n'));
  }

  return {
    content: cards.length > 0 ? `${cards.join('\r\n')}\r\n` : '',
    contactCount: cards.length,
    skippedRowCount,
  };
}

export function contactCellText(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
}

function mappedCell(row: string[], columnIndex: number | null) {
  return columnIndex === null ? '' : (row[columnIndex] ?? '').trim();
}

function normalizeHeader(value: string) {
  return value.toLocaleLowerCase().replace(/[\s_\-—–()（）【】\[\]]+/g, '');
}

function splitMultipleValues(value: string) {
  return value
    .split(/[\n,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeVCardText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function foldVCardLine(line: string) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const folded: string[] = [];
  let current = '';
  let byteLimit = 75;

  for (const character of line) {
    if (encoder.encode(current + character).length > byteLimit) {
      folded.push(current);
      current = character;
      byteLimit = 74;
    } else {
      current += character;
    }
  }

  if (current) folded.push(current);
  return folded.join('\r\n ');
}
