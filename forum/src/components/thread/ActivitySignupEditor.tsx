import { ArrowDown, ArrowUp, CalendarDays, Plus, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import {
  activitySignupQuestionTypeOptions,
  createActivitySignupQuestion,
  getActivitySignupQuestionHint,
  isActivitySignupChoiceType,
  normalizeActivitySignupQuestion,
  type ActivitySignupQuestion,
  type ActivitySignupQuestionType,
  type ActivitySignupSettings,
} from '../../utils/activitySignup';

export function ActivitySignupEditor({
  onChange,
  value,
}: {
  onChange: (value: ActivitySignupSettings) => void;
  value: ActivitySignupSettings;
}) {
  function updateQuestion(id: string, patch: Partial<ActivitySignupQuestion>) {
    onChange({
      ...value,
      questions: value.questions.map((question) => (
        question.id === id ? normalizeActivitySignupQuestion({ ...question, ...patch }) : question
      )),
    });
  }

  function moveQuestion(index: number, offset: number) {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= value.questions.length) return;
    const questions = [...value.questions];
    const [question] = questions.splice(index, 1);
    questions.splice(targetIndex, 0, question);
    onChange({ ...value, questions });
  }

  function removeQuestion(id: string) {
    if (value.questions.length <= 1) return;
    onChange({ ...value, questions: value.questions.filter((question) => question.id !== id) });
  }

  return (
    <section className="activity-signup-editor" aria-labelledby="activity-signup-settings-title">
      <div className="activity-signup-time-grid">
        <label>
          <span>报名开始时间</span>
          <input
            onChange={(event) => onChange({ ...value, startsAt: event.target.value })}
            type="datetime-local"
            value={value.startsAt}
          />
        </label>
        <label>
          <span>报名截止时间</span>
          <input
            min={value.startsAt || undefined}
            onChange={(event) => onChange({ ...value, endsAt: event.target.value })}
            type="datetime-local"
            value={value.endsAt}
          />
        </label>
      </div>

      <div className="activity-signup-fields-heading">
        <h3 id="activity-signup-settings-title"><CalendarDays size={16} />报名字段</h3>
        <button
          onClick={() => onChange({
            ...value,
            questions: [...value.questions, createActivitySignupQuestion(value.questions.length + 1)],
          })}
          type="button"
        >
          <Plus size={15} />添加字段
        </button>
      </div>

      <div className="activity-signup-question-list">
        {value.questions.map((question, index) => (
          <article className="activity-signup-question" key={question.id}>
            <div className="activity-signup-question-order">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <button
                aria-label={`上移${question.label}`}
                disabled={index === 0}
                onClick={() => moveQuestion(index, -1)}
                type="button"
              ><ArrowUp size={14} /></button>
              <button
                aria-label={`下移${question.label}`}
                disabled={index === value.questions.length - 1}
                onClick={() => moveQuestion(index, 1)}
                type="button"
              ><ArrowDown size={14} /></button>
            </div>

            <div className="activity-signup-question-main">
              <label>
                <span>字段名</span>
                <input
                  disabled={question.type === 'id'}
                  onChange={(event) => updateQuestion(question.id, { label: event.target.value })}
                  placeholder="字段名"
                  value={question.label}
                />
              </label>
              <label>
                <span>题型</span>
                <select
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => updateQuestion(question.id, {
                    type: event.target.value as ActivitySignupQuestionType,
                  })}
                  value={question.type}
                >
                  {activitySignupQuestionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="activity-signup-required">
                <input
                  checked={question.required}
                  disabled={question.type === 'id'}
                  onChange={(event) => updateQuestion(question.id, { required: event.target.checked })}
                  type="checkbox"
                />
                必填
              </label>
              <button
                aria-label={`删除${question.label}`}
                className="activity-signup-delete"
                disabled={value.questions.length <= 1}
                onClick={() => removeQuestion(question.id)}
                type="button"
              ><Trash2 size={15} /></button>
            </div>

            <QuestionRuleEditor onUpdate={(patch) => updateQuestion(question.id, patch)} question={question} />
          </article>
        ))}
      </div>
    </section>
  );
}

function QuestionRuleEditor({
  onUpdate,
  question,
}: {
  onUpdate: (patch: Partial<ActivitySignupQuestion>) => void;
  question: ActivitySignupQuestion;
}) {
  if (isActivitySignupChoiceType(question.type)) {
    const options = question.options ?? [];
    return (
      <div className="activity-signup-options">
        <span>选项</span>
        <div>
          {options.map((option, index) => (
            <label key={`${question.id}-${index}`}>
              <input
                onChange={(event) => onUpdate({
                  options: options.map((value, optionIndex) => optionIndex === index ? event.target.value : value),
                })}
                value={option}
              />
              <button
                aria-label={`删除选项${index + 1}`}
                disabled={options.length <= 2}
                onClick={() => onUpdate({ options: options.filter((_, optionIndex) => optionIndex !== index) })}
                type="button"
              ><Trash2 size={13} /></button>
            </label>
          ))}
          <button
            onClick={() => onUpdate({ options: [...options, `选项 ${options.length + 1}`] })}
            type="button"
          ><Plus size={13} />添加选项</button>
        </div>
      </div>
    );
  }

  if (question.type === 'number') {
    return (
      <div className="activity-signup-number-range">
        <span>数字范围</span>
        <label>下限<input onChange={(event) => onUpdate({ min: optionalNumber(event.target.value) })} type="number" value={question.min ?? ''} /></label>
        <label>上限<input onChange={(event) => onUpdate({ max: optionalNumber(event.target.value) })} type="number" value={question.max ?? ''} /></label>
      </div>
    );
  }

  return <p className="activity-signup-question-hint">{getActivitySignupQuestionHint(question.type)}</p>;
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}
