export type ActivitySignupQuestionType =
  | 'id'
  | 'checkbox'
  | 'radio'
  | 'multiSelect'
  | 'text'
  | 'number'
  | 'phone'
  | 'email'
  | 'textarea';

export type ActivitySignupQuestion = {
  id: string;
  label: string;
  max?: number;
  min?: number;
  options?: string[];
  required: boolean;
  type: ActivitySignupQuestionType;
};

export type ActivitySignupSettings = {
  endsAt: string;
  questions: ActivitySignupQuestion[];
  startsAt: string;
};

export type ActivityCreateOption = {
  cases?: Array<{ case_name: string; comment: string }>;
  comment: string;
  option_name: string;
  required: 0 | 1;
  type_id: 1 | 3 | 6;
};

export const activitySignupQuestionTypeOptions: Array<{
  label: string;
  value: ActivitySignupQuestionType;
}> = [
  { label: 'ID', value: 'id' },
  { label: '勾选', value: 'checkbox' },
  { label: '单选', value: 'radio' },
  { label: '多选', value: 'multiSelect' },
  { label: '填空', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '电话', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '多行文本', value: 'textarea' },
];

const defaultQuestions: ActivitySignupQuestion[] = [
  { id: 'name', label: '姓名', required: true, type: 'text' },
  { id: 'userId', label: 'ID', required: true, type: 'id' },
  { id: 'gender', label: '性别', options: ['男', '女'], required: true, type: 'radio' },
  { id: 'phone', label: '联系电话', required: true, type: 'phone' },
  { id: 'gradeDepartment', label: '年级院系', required: true, type: 'text' },
  {
    id: 'rolePreference',
    label: '职务意愿',
    required: false,
    type: 'text',
  },
  { id: 'acceptAdjustment', label: '是否接受调剂', options: ['是', '否'], required: false, type: 'radio' },
  { id: 'trainingCount', label: '参加过拉练的次数', required: false, type: 'number' },
  { id: 'hasMedicalQualification', label: '是否有队医资格', options: ['是', '否'], required: true, type: 'radio' },
  { id: 'hasSweepQualification', label: '是否有押后资格', options: ['是', '否'], required: true, type: 'radio' },
  { id: 'needsHelmet', label: '是否需要借头盔', options: ['是', '否'], required: true, type: 'radio' },
  { id: 'specialty', label: '特长', required: false, type: 'text' },
  { id: 'message', label: '想说的话', required: false, type: 'textarea' },
];

export function createDefaultActivitySignupSettings(): ActivitySignupSettings {
  return {
    endsAt: '',
    questions: defaultQuestions.map((question) => ({
      ...question,
      options: question.options ? [...question.options] : undefined,
    })),
    startsAt: '',
  };
}

export function createActivitySignupQuestion(index: number): ActivitySignupQuestion {
  return {
    id: `custom-${Date.now()}-${index}`,
    label: `自定义字段 ${index}`,
    required: false,
    type: 'text',
  };
}

export function normalizeActivitySignupQuestion(
  question: ActivitySignupQuestion,
): ActivitySignupQuestion {
  const next = { ...question };

  if (next.type === 'id') {
    next.label = 'ID';
    next.required = true;
  }

  if (isActivitySignupChoiceType(next.type)) {
    next.options = next.options?.length ? next.options : ['选项 1', '选项 2'];
  } else {
    delete next.options;
  }

  if (next.type !== 'number') {
    delete next.min;
    delete next.max;
  }

  return next;
}

export function isActivitySignupChoiceType(type: ActivitySignupQuestionType) {
  return type === 'radio' || type === 'multiSelect';
}

export function getActivitySignupQuestionHint(type: ActivitySignupQuestionType) {
  switch (type) {
    case 'id': return '自动读取当前会员 ID';
    case 'checkbox': return '记录会员是否勾选';
    case 'phone': return '填写联系电话';
    case 'email': return '填写邮箱地址';
    case 'textarea': return '适合填写较长内容';
    case 'text': return '普通单行文本';
    default: return '无需额外配置';
  }
}

export function validateActivitySignupSettings(settings: ActivitySignupSettings) {
  if (!settings.startsAt || !settings.endsAt) return false;
  if (new Date(settings.startsAt).getTime() >= new Date(settings.endsAt).getTime()) return false;
  if (settings.questions.length === 0) return false;

  const labels = new Set<string>();
  return settings.questions.every((question) => {
    const label = question.type === 'id' ? 'ID' : question.label.trim();
    const labelKey = label.toLocaleLowerCase();
    if (!label || labels.has(labelKey)) return false;
    labels.add(labelKey);

    if (isActivitySignupChoiceType(question.type)) {
      const options = (question.options ?? []).map((option) => option.trim()).filter(Boolean);
      return options.length >= 2 && new Set(options).size === options.length;
    }

    return question.type !== 'number'
      || typeof question.min !== 'number'
      || typeof question.max !== 'number'
      || question.min <= question.max;
  });
}

export function activitySignupDateTimeToUnixSeconds(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const [, year, month, day, hour, minute] = match.map(Number);
  return Math.floor(Date.UTC(year, month - 1, day, hour - 8, minute) / 1000);
}

export function buildActivityCreateOptions(
  questions: ActivitySignupQuestion[],
): ActivityCreateOption[] {
  return questions.map((question) => {
    const option: ActivityCreateOption = {
      comment: '',
      option_name: question.type === 'id' ? 'ID' : question.label.trim(),
      required: question.required ? 1 : 0,
      type_id: question.type === 'multiSelect'
        ? 3
        : question.type === 'radio' || question.type === 'checkbox'
          ? 1
          : 6,
    };

    if (option.type_id === 1 || option.type_id === 3) {
      const values = question.type === 'checkbox' ? ['是', '否'] : question.options ?? [];
      option.cases = values.map((value) => ({ case_name: value.trim(), comment: '' }));
    }

    return option;
  });
}
