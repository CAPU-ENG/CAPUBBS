export type ContactRow = {
  name: string;
  phone: string;
  role: string;
  username: string;
};

export type ContactTable = {
  rows: ContactRow[];
};

export type VCardConversionResult = {
  content: string;
  contactCount: number;
};

const EXPECTED_HEADERS = ['id', '姓名', '职务', '电话'] as const;

export function normalizeContactTable(rows: unknown[][]): ContactTable {
  const populatedRows = rows
    .map((row, index) => ({ cells: row.map(contactCellText), rowNumber: index + 1 }))
    .filter(({ cells }) => cells.some(Boolean));

  if (populatedRows.length < 2) {
    throw new Error('表格中没有可转换的数据。');
  }

  const headers = populatedRows[0].cells.map(normalizeHeader);
  if (
    EXPECTED_HEADERS.some((expected, index) => headers[index] !== expected)
    || populatedRows[0].cells.slice(EXPECTED_HEADERS.length).some(Boolean)
  ) {
    throw new Error('表头应依次为 ID、姓名、职务、电话。');
  }

  const contactRows = populatedRows.slice(1).map(({ cells, rowNumber }) => {
    const contact: ContactRow = {
      name: cells[1] ?? '',
      role: cells[2] ?? '',
      phone: cells[3] ?? '',
      username: cells[0] ?? '',
    };
    const missingFields = [
      ['ID', contact.username],
      ['姓名', contact.name],
      ['职务', contact.role],
      ['电话', contact.phone],
    ].filter(([, value]) => !value).map(([label]) => label);

    if (missingFields.length > 0) {
      throw new Error(`第 ${rowNumber} 行缺少${missingFields.join('、')}。`);
    }
    return contact;
  });

  return { rows: contactRows };
}

export function getVCardDisplayName(contact: ContactRow) {
  return `${contact.username}｜${contact.name}｜${contact.role}`;
}

export function convertTableToVcf(rows: ContactRow[]): VCardConversionResult {
  const cards = rows.map((contact) => {
    const displayName = getVCardDisplayName(contact);
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:;${escapeVCardText(displayName)};;;`,
      `FN:${escapeVCardText(displayName)}`,
      ...splitPhoneValues(contact.phone).map((phone) => `TEL;TYPE=CELL:${escapeVCardText(phone)}`),
      'END:VCARD',
    ];
    return lines.map(foldVCardLine).join('\r\n');
  });

  return {
    content: cards.length > 0 ? `${cards.join('\r\n')}\r\n` : '',
    contactCount: cards.length,
  };
}

function contactCellText(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
}

function normalizeHeader(value: string) {
  return value.toLocaleLowerCase().replace(/[\s_\-—–()（）【】\[\]]+/g, '');
}

function splitPhoneValues(value: string) {
  return value
    .split(/[\n,，;；、]+/)
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
