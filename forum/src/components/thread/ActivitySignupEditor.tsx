import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  GripVertical,
  LockKeyhole,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
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

export function ActivitySignupSchedule({
  onChange,
  value,
}: {
  onChange: (value: ActivitySignupSettings) => void;
  value: ActivitySignupSettings;
}) {
  return (
    <section className="activity-signup-schedule" aria-label="报名时间">
      <h3><CalendarDays size={16} />报名时间</h3>
      <div className="activity-signup-time-range">
        <label>
          <span>开始</span>
          <input
            onChange={(event) => onChange({ ...value, startsAt: event.target.value })}
            type="datetime-local"
            value={value.startsAt}
          />
        </label>
        <ArrowRight aria-hidden="true" size={16} />
        <label>
          <span>截止</span>
          <input
            min={value.startsAt || undefined}
            onChange={(event) => onChange({ ...value, endsAt: event.target.value })}
            type="datetime-local"
            value={value.endsAt}
          />
        </label>
      </div>
    </section>
  );
}

export function ActivitySignupEditor({
  onChange,
  value,
}: {
  onChange: (value: ActivitySignupSettings) => void;
  value: ActivitySignupSettings;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);

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

  function moveQuestionTo(questionId: string, targetId: string) {
    if (questionId === targetId) return;
    const sourceIndex = value.questions.findIndex((question) => question.id === questionId);
    const targetIndex = value.questions.findIndex((question) => question.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const questions = [...value.questions];
    const [question] = questions.splice(sourceIndex, 1);
    questions.splice(targetIndex, 0, question);
    onChange({ ...value, questions });
  }

  function removeQuestion(id: string) {
    if (value.questions.length <= 1) return;
    onChange({ ...value, questions: value.questions.filter((question) => question.id !== id) });
    setExpandedId((current) => current === id ? null : current);
  }

  function startDragging(event: DragEvent<HTMLButtonElement>, id: string) {
    draggedIdRef.current = id;
    setDraggingId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  }

  function dropQuestion(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    const sourceId = draggedIdRef.current || event.dataTransfer.getData('text/plain');
    if (sourceId) moveQuestionTo(sourceId, targetId);
    draggedIdRef.current = null;
    setDraggingId(null);
  }

  return (
    <section className="activity-signup-editor" aria-labelledby="activity-signup-settings-title">
      <header className="activity-signup-fields-heading">
        <h3 id="activity-signup-settings-title">报名字段 <span>{value.questions.length}</span></h3>
        <button
          onClick={() => {
            const question = createActivitySignupQuestion(value.questions.length + 1);
            onChange({ ...value, questions: [...value.questions, question] });
            setExpandedId(question.id);
          }}
          type="button"
        >
          <Plus size={15} />添加字段
        </button>
      </header>

      <div className="activity-signup-question-list">
        {value.questions.map((question, index) => {
          const expanded = expandedId === question.id;
          const locked = question.type === 'id';
          return (
            <article
              className={`activity-signup-question ${expanded ? 'activity-signup-question-expanded' : ''} ${draggingId === question.id ? 'activity-signup-question-dragging' : ''}`}
              key={question.id}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => dropQuestion(event, question.id)}
            >
              <div className="activity-signup-question-summary">
                <div className="activity-signup-question-order-cell">
                  <button
                    aria-label={`拖动排序${question.label}`}
                    className="activity-signup-drag-handle"
                    draggable
                    onDragEnd={() => {
                      draggedIdRef.current = null;
                      setDraggingId(null);
                    }}
                    onDragStart={(event) => startDragging(event, question.id)}
                    type="button"
                  ><GripVertical size={16} /></button>
                  <span className="activity-signup-question-index">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <button
                  aria-expanded={expanded}
                  className="activity-signup-question-toggle"
                  onClick={() => setExpandedId(expanded ? null : question.id)}
                  type="button"
                >
                  <strong>{question.label.trim() || `字段 ${index + 1}`}</strong>
                </button>
                <div aria-label="字段标签" className="activity-signup-question-tags">
                  <span>{questionTypeLabel(question.type)}</span>
                  {question.required ? <em>必填</em> : null}
                  {locked ? <em className="activity-signup-locked"><LockKeyhole size={11} />锁定</em> : null}
                </div>
                {!locked ? (
                  <button
                    aria-label={`删除${question.label}`}
                    className="activity-signup-delete"
                    disabled={value.questions.length <= 1}
                    onClick={() => removeQuestion(question.id)}
                    type="button"
                  ><Trash2 size={14} /></button>
                ) : <span className="activity-signup-delete-placeholder" />}
                <button
                  aria-label={`${expanded ? '收起' : '编辑'}${question.label}`}
                  aria-expanded={expanded}
                  className="activity-signup-expand"
                  onClick={() => setExpandedId(expanded ? null : question.id)}
                  type="button"
                ><ChevronDown size={16} /></button>
              </div>

              {expanded ? (
                <div className="activity-signup-question-editor">
                  <div className="activity-signup-question-main">
                    <label>
                      <span>字段名</span>
                      <input
                        disabled={locked}
                        onChange={(event) => updateQuestion(question.id, { label: event.target.value })}
                        placeholder="字段名"
                        value={question.label}
                      />
                    </label>
                    <label>
                      <span>题型</span>
                      <select
                        disabled={locked}
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
                        disabled={locked}
                        onChange={(event) => updateQuestion(question.id, { required: event.target.checked })}
                        type="checkbox"
                      />
                      必填
                    </label>
                    <div className="activity-signup-reorder-actions">
                      <button
                        aria-label={`上移${question.label}`}
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, -1)}
                        type="button"
                      ><ArrowUp size={14} />上移</button>
                      <button
                        aria-label={`下移${question.label}`}
                        disabled={index === value.questions.length - 1}
                        onClick={() => moveQuestion(index, 1)}
                        type="button"
                      ><ArrowDown size={14} />下移</button>
                    </div>
                  </div>

                  <QuestionRuleEditor onUpdate={(patch) => updateQuestion(question.id, patch)} question={question} />
                </div>
              ) : null}
            </article>
          );
        })}
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

function questionTypeLabel(type: ActivitySignupQuestionType) {
  return activitySignupQuestionTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}
