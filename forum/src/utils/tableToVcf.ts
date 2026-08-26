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

const SUPPORTED_HEADERS = ['id', '姓名', '职务', '电话'] as const;

export function normalizeContactTable(rows: unknown[][]): ContactTable {
  const populatedRows = rows
    .map((row, index) => ({ cells: row.map(contactCellText), rowNumber: index + 1 }))
    .filter(({ cells }) => cells.some(Boolean));

  if (populatedRows.length < 2) {
    throw new Error('表格中没有可转换的数据。');
  }

  const headers = populatedRows[0].cells.map(normalizeHeader);
  if (headers.some((header) => !isSupportedHeader(header)) || new Set(headers).size !== headers.length) {
    throw new Error('表头仅支持 ID、姓名、职务、电话，且不能重复。');
  }
  if (!headers.includes('姓名') || !headers.includes('电话')) {
    throw new Error('表格必须包含姓名和电话列。');
  }
  const headerOrder = headers.map((header) => SUPPORTED_HEADERS.findIndex((supported) => supported === header));
  if (headerOrder.some((order, index) => index > 0 && order < headerOrder[index - 1])) {
    throw new Error('表头顺序应为 ID、姓名、职务、电话，ID 和职务可省略。');
  }

  const usernameIndex = headers.indexOf('id');
  const nameIndex = headers.indexOf('姓名');
  const roleIndex = headers.indexOf('职务');
  const phoneIndex = headers.indexOf('电话');
  const contactRows = populatedRows.slice(1).map(({ cells, rowNumber }) => {
    const contact: ContactRow = {
      name: cells[nameIndex] ?? '',
      role: roleIndex >= 0 ? cells[roleIndex] ?? '' : '',
      phone: cells[phoneIndex] ?? '',
      username: usernameIndex >= 0 ? cells[usernameIndex] ?? '' : '',
    };
    const missingFields = [
      ['姓名', contact.name],
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
  return [contact.username, contact.name, contact.role].filter(Boolean).join('｜');
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

function isSupportedHeader(header: string): header is typeof SUPPORTED_HEADERS[number] {
  return SUPPORTED_HEADERS.some((supported) => supported === header);
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
