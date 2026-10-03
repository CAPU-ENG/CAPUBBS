import type { ThreadFloorData } from '../data/thread';

const PHONE_LABEL_PATTERN = /电话|手机|联系电话|联系方式|mobile|phone|tel/i;
const MASKED_PHONE_VALUE = '***********';
const PHONE_VALUE_PATTERN = '(?:1\\d{10}|0\\d{2,3}[ -]?\\d{7,8})';
const PHONE_FIELD_HTML_VALUE_PATTERN = '[^<\\r\\n]*';

type ActivityPhoneQuestion = {
  id: string;
  label: string;
};

export function isActivityPhoneQuestion(question: ActivityPhoneQuestion) {
  return PHONE_LABEL_PATTERN.test(question.label) || PHONE_LABEL_PATTERN.test(question.id);
}

export function maskActivitySignupSummary(value: string) {
  const phonePattern = `(?:${PHONE_LABEL_PATTERN.source})`;
  if (/<(?:div|p|li)\b/i.test(value)) {
    return value.replace(
      new RegExp(`(${phonePattern}\\s*[：:]\\s*)${PHONE_FIELD_HTML_VALUE_PATTERN}(?=</(?:div|p|li)>|$)`, 'giu'),
      `$1${MASKED_PHONE_VALUE}`,
    );
  }

  return value.replace(
    new RegExp(`(${phonePattern}\\s*[：:]\\s*)${PHONE_VALUE_PATTERN}`, 'giu'),
    `$1${MASKED_PHONE_VALUE}`,
  );
}

export function maskActivitySignupFloor(
  floor: ThreadFloorData,
  phoneFieldLabels: string[],
  fieldLabels: string[] = phoneFieldLabels,
): ThreadFloorData {
  if (phoneFieldLabels.length === 0) return floor;

  return {
    ...floor,
    contentHtml: floor.contentHtml
      ? maskPhoneFieldsInHtml(floor.contentHtml, phoneFieldLabels, fieldLabels)
      : floor.contentHtml,
    paragraphs: floor.paragraphs.map((paragraph) => maskPhoneFieldsInText(paragraph, phoneFieldLabels, fieldLabels)),
    quoteText: floor.quoteText
      ? maskPhoneFieldsInText(floor.quoteText, phoneFieldLabels, fieldLabels)
      : floor.quoteText,
  };
}

// Display-only: puts the server-provided 个人可见 answers back into the floor's
// HTML. quoteText stays masked so quoting a signup never republishes them.
export function revealActivityPrivateAnswers(floor: ThreadFloorData): ThreadFloorData {
  const answers = floor.privateAnswers;
  if (!answers?.length || !floor.contentHtml?.includes(MASKED_PHONE_VALUE)) return floor;

  const template = document.createElement('template');
  template.innerHTML = floor.contentHtml;
  let changed = false;
  visitTextNodes(template.content, (node) => {
    let text = node.data;
    answers.forEach((answer) => {
      text = text.split(`${answer.label}：${MASKED_PHONE_VALUE}`).join(`${answer.label}：${answer.value}`);
    });
    if (text !== node.data) {
      node.data = text;
      changed = true;
    }
  });

  return changed ? { ...floor, contentHtml: template.innerHTML } : floor;
}

function maskPhoneFieldsInText(value: string, phoneLabels: string[], fieldLabels: string[]) {
  const phonePattern = createFieldPattern(phoneLabels);
  const fieldPattern = createFieldPattern(fieldLabels);
  if (!phonePattern || !fieldPattern) return value;

  return value.replace(
    new RegExp(`(${phonePattern}\\s*[：:]\\s*)(.*?)(?=\\s+(?:${fieldPattern})\\s*[：:]|$)`, 'giu'),
    `$1${MASKED_PHONE_VALUE}`,
  );
}

function maskPhoneFieldsInHtml(value: string, phoneLabels: string[], fieldLabels: string[]) {
  const phonePattern = createFieldPattern(phoneLabels);
  const fieldPattern = createFieldPattern(fieldLabels);
  if (!phonePattern || !fieldPattern) return value;

  const parser = new DOMParser();
  const document = parser.parseFromString(`<div>${value}</div>`, 'text/html');
  const root = document.body.firstElementChild;
  if (!root) return value;

  visitTextNodes(root, (node) => {
    node.data = node.data.replace(
      new RegExp(`(${phonePattern}\\s*[：:]\\s*)(.*?)(?=\\s+(?:${fieldPattern})\\s*[：:]|$)`, 'giu'),
      `$1${MASKED_PHONE_VALUE}`,
    );
  });

  return root.innerHTML;
}

function createFieldPattern(labels: string[]) {
  const escapedLabels = labels
    .map((label) => label.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp);
  return escapedLabels.length > 0 ? escapedLabels.join('|') : '';
}

function visitTextNodes(parent: Node, callback: (node: Text) => void) {
  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === 3) {
      callback(node as Text);
    } else if (node.nodeType === 1) {
      visitTextNodes(node, callback);
    }
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
