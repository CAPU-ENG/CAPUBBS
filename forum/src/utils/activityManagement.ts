import type { ThreadActivityQuestion } from '../api/thread';
import type { ThreadFloorData } from '../data/threadDemo';
import type {
  ActivitySignupQuestion,
  ActivitySignupSettings,
} from './activitySignup';

export type ActivityManagementValue = string | string[];

export type ActivitySignupRecord = {
  floor: ThreadFloorData;
  missingFields: string[];
  status: '有效' | '异常' | '已取消';
  values: Record<string, ActivityManagementValue>;
};

export function createEditableActivitySettings({
  endsAt,
  questions,
  startsAt,
}: {
  endsAt: number;
  questions: ThreadActivityQuestion[];
  startsAt: number;
}): ActivitySignupSettings {
  return {
    endsAt: toDateTimeLocalValue(endsAt),
    questions: questions.map(mapQuestion),
    startsAt: toDateTimeLocalValue(startsAt),
  };
}

export function getActivitySignupRecords(
  floors: ThreadFloorData[],
  questions: ThreadActivityQuestion[],
) {
  return floors
    .filter((floor) => floor.floor > 1)
    .map((floor) => createSignupRecord(floor, questions))
    .filter((record): record is ActivitySignupRecord => record !== null);
}

export function getActivityRecordValue(
  record: ActivitySignupRecord,
  question: ThreadActivityQuestion,
) {
  const value = record.values[question.id];
  if (Array.isArray(value)) return value.length > 0 ? value.join('、') : '-';
  return value?.trim() || '-';
}

function createSignupRecord(
  floor: ThreadFloorData,
  questions: ThreadActivityQuestion[],
): ActivitySignupRecord | null {
  const source = floor.paragraphs.join('\n');
  const values = questions.reduce<Record<string, ActivityManagementValue>>((result, question) => {
    const rawValue = getStoredQuestionValue(source, question, questions);
    result[question.id] = question.type === 'multiChoice'
      ? rawValue.split(/[、,，]/).map((value) => value.trim()).filter(Boolean)
      : rawValue;
    return result;
  }, {});
  const hasSignupContent = Object.values(values).some((value) => (
    Array.isArray(value) ? value.length > 0 : Boolean(value.trim())
  ));
  if (!hasSignupContent) return null;

  const missingFields = questions
    .filter((question) => question.required && !hasValue(values[question.id]))
    .map((question) => question.label);
  const canceled = source.includes('报名状态：已取消');

  return {
    floor,
    missingFields,
    status: canceled ? '已取消' : missingFields.length > 0 ? '异常' : '有效',
    values,
  };
}

function getStoredQuestionValue(
  source: string,
  question: ThreadActivityQuestion,
  questions: ThreadActivityQuestion[],
) {
  const prefix = `${question.label}：`;
  const start = source.indexOf(prefix);
  if (start < 0) return '';
  const valueStart = start + prefix.length;
  const nextStarts = questions
    .map((candidate) => source.indexOf(`${candidate.label}：`, valueStart))
    .filter((index) => index >= 0);
  const statusStart = source.indexOf('报名状态：', valueStart);
  if (statusStart >= 0) nextStarts.push(statusStart);
  const end = nextStarts.length > 0 ? Math.min(...nextStarts) : source.length;
  const value = source.slice(valueStart, end).trim();
  return value === '无' ? '' : value;
}

function mapQuestion(question: ThreadActivityQuestion): ActivitySignupQuestion {
  const label = question.label.trim();
  const lowerLabel = label.toLocaleLowerCase();
  const type = label.toUpperCase() === 'ID'
    ? 'id'
    : question.type === 'multiChoice'
      ? 'multiSelect'
      : question.type === 'choice'
        ? 'radio'
        : /电话|手机/.test(label)
          ? 'phone'
          : /邮箱|email/.test(lowerLabel)
            ? 'email'
            : /备注|说明|想说|补充|意愿|特长/.test(label)
              ? 'textarea'
              : 'text';

  return {
    id: question.id,
    label,
    options: question.options.length > 0
      ? question.options.map((option) => option.label)
      : undefined,
    required: question.required,
    type,
  };
}

function hasValue(value: ActivityManagementValue | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
}

function toDateTimeLocalValue(timestamp: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}
