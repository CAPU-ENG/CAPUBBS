import type {
  ActivitySignupSummaryRecord,
  ActivityUpdateOption,
  ThreadActivity,
  ThreadActivityQuestion,
} from '../api/thread';
import type {
  ActivitySignupQuestion,
  ActivitySignupSettings,
  ActivityDateRange,
} from './activitySignup';

export type ActivitySignupRecord = ActivitySignupSummaryRecord;

export type ActivityQuestionCaseIds = Record<string, string[]>;

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

export function createEditableActivityDateRange(activity: ThreadActivity): ActivityDateRange {
  return {
    endsOn: activity.endsOn,
    startsOn: activity.startsOn,
  };
}

export function createActivityQuestionCaseIds(questions: ThreadActivityQuestion[]): ActivityQuestionCaseIds {
  return Object.fromEntries(questions.map((question) => [
    question.id,
    question.options.map((option) => option.id),
  ]));
}

export function reconcileActivityQuestionCaseIds(
  previousSettings: ActivitySignupSettings,
  nextSettings: ActivitySignupSettings,
  currentIds: ActivityQuestionCaseIds,
) {
  const previousQuestions = new Map(previousSettings.questions.map((question) => [question.id, question]));
  return nextSettings.questions.reduce<ActivityQuestionCaseIds>((result, question) => {
    if (!questionHasCases(question)) {
      result[question.id] = currentIds[question.id] ?? [];
      return result;
    }

    const previous = previousQuestions.get(question.id);
    const previousOptions = questionOptions(previous);
    const nextOptions = questionOptions(question);
    const ids = currentIds[question.id] ?? [];
    if (!previous || previousOptions.length === 0) {
      result[question.id] = nextOptions.map((_, index) => ids[index] ?? '');
    } else if (previousOptions.length === nextOptions.length) {
      result[question.id] = nextOptions.map((_, index) => ids[index] ?? '');
    } else if (previousOptions.length + 1 === nextOptions.length) {
      const insertedAt = findInsertedIndex(previousOptions, nextOptions);
      result[question.id] = [
        ...ids.slice(0, insertedAt),
        '',
        ...ids.slice(insertedAt),
      ].slice(0, nextOptions.length);
    } else if (previousOptions.length - 1 === nextOptions.length) {
      const removedAt = findRemovedIndex(previousOptions, nextOptions);
      result[question.id] = ids.filter((_, index) => index !== removedAt).slice(0, nextOptions.length);
    } else {
      result[question.id] = nextOptions.map((_, index) => ids[index] ?? '');
    }
    return result;
  }, {});
}

export function buildActivityUpdateOptions(
  settings: ActivitySignupSettings,
  caseIds: ActivityQuestionCaseIds,
): ActivityUpdateOption[] {
  return settings.questions.map((question) => {
    const options = questionOptions(question);
    const ids = caseIds[question.id] ?? [];
    const optionId = numericId(question.id);
    const typeId = question.type === 'multiSelect'
      ? 3
      : question.type === 'radio' || question.type === 'checkbox'
        ? 1
        : 6;
    return {
      cases: typeId === 1 || typeId === 3
        ? options.map((label, index) => ({
            ...(numericId(ids[index]) ? { case_id: numericId(ids[index]) } : {}),
            case_name: label.trim(),
            comment: '',
          }))
        : undefined,
      comment: '',
      ...(optionId ? { option_id: optionId } : {}),
      option_name: question.type === 'id' ? 'ID' : question.label.trim(),
      required: question.required ? 1 : 0,
      type_id: typeId,
    };
  });
}

export function validateManagedActivityDateRange(range: ActivityDateRange) {
  return isValidDateOnly(range.startsOn)
    && isValidDateOnly(range.endsOn)
    && range.endsOn >= range.startsOn;
}

export function getActivityRecordValue(
  record: ActivitySignupRecord,
  question: ThreadActivityQuestion,
) {
  const value = record.values[question.id];
  if (Array.isArray(value)) return value.length > 0 ? value.join('、') : '-';
  return value?.trim() || '-';
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

function questionHasCases(question: ActivitySignupQuestion | undefined) {
  return question?.type === 'checkbox' || question?.type === 'radio' || question?.type === 'multiSelect';
}

function questionOptions(question: ActivitySignupQuestion | undefined) {
  if (!question) return [];
  if (question.type === 'checkbox') return ['是', '否'];
  return question.options ?? [];
}

function findInsertedIndex(previous: string[], next: string[]) {
  let index = 0;
  while (index < previous.length && previous[index] === next[index]) index += 1;
  return index;
}

function findRemovedIndex(previous: string[], next: string[]) {
  let index = 0;
  while (index < next.length && previous[index] === next[index]) index += 1;
  return index;
}

function numericId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return 0;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function isValidDateOnly(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function toDateTimeLocalValue(timestamp: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}
