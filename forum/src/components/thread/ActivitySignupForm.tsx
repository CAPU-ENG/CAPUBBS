import { Check, ClipboardList, Eye, LogIn, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  publishActivitySignup,
  type ActivitySignupValue,
  type ThreadActivity,
  type ThreadActivityQuestion,
} from '../../api/thread';
import type { ThreadAuthor, ThreadFloorData } from '../../data/threadDemo';
import {
  formatPostEditorPreviewTimestamp,
  PostEditorPreviewDialog,
} from './PostEditor';

const signatureOptions = [
  { label: '不使用签名档', value: 0 },
  { label: '签名档 1', value: 1 },
  { label: '签名档 2', value: 2 },
  { label: '签名档 3', value: 3 },
] as const;

type ActivitySignupFormProps = {
  activity: ThreadActivity;
  bid: number;
  floors: ThreadFloorData[];
  locked: boolean;
  loginHref: string;
  signatures: string[];
  threadTitle: string;
  tid: number;
  viewer: ThreadAuthor | null;
};

export function ActivitySignupForm({
  activity,
  bid,
  floors,
  locked,
  loginHref,
  signatures,
  threadTitle,
  tid,
  viewer,
}: ActivitySignupFormProps) {
  const existingSignup = floors.find((floor) => floor.floor > 1 && floor.isOwn) ?? null;
  const [values, setValues] = useState<Record<string, ActivitySignupValue>>(() =>
    createInitialValues(activity.questions, viewer?.name ?? '', existingSignup),
  );
  const [signatureIndex, setSignatureIndex] = useState(existingSignup?.signatureIndex ?? 0);
  const [action, setAction] = useState<'join' | 'modify' | 'restore'>(() => {
    if (!existingSignup) return 'join';
    return existingSignup.paragraphs.some((paragraph) => paragraph.includes('报名状态：已取消')) ? 'restore' : 'modify';
  });
  const [status, setStatus] = useState('');
  const [statusIsError, setStatusIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewedAt, setPreviewedAt] = useState('');
  const requiredFieldsComplete = activity.questions.every((question) =>
    !question.required || hasSignupValue(values[question.id]),
  );
  const signupUnavailable = locked || activity.status === 'closed' || activity.status === 'not_started';
  const canSubmit = Boolean(viewer) && requiredFieldsComplete && !signupUnavailable && !submitting;
  const previewFloor = existingSignup?.floor ?? Math.max(1, ...floors.map((floor) => floor.floor)) + 1;

  function openPreview() {
    setPreviewedAt(formatPostEditorPreviewTimestamp(new Date()));
    setPreviewOpen(true);
  }

  function updateValue(questionId: string, value: ActivitySignupValue) {
    setValues((current) => ({ ...current, [questionId]: value }));
    setStatus('');
  }

  function updateMultiChoice(questionId: string, optionId: string, checked: boolean) {
    const selected = Array.isArray(values[questionId]) ? values[questionId] : [];
    updateValue(questionId, checked
      ? [...selected, optionId]
      : selected.filter((value) => value !== optionId));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setStatusIsError(false);
    setStatus(action === 'modify' ? '正在保存修改' : action === 'restore' ? '正在重新报名' : '正在提交报名');
    try {
      await publishActivitySignup({ action, bid, signatureIndex, tid, title: threadTitle, values });
      setStatus(action === 'modify' ? '报名已修改' : action === 'restore' ? '报名已恢复' : '报名已提交');
      setAction('modify');
    } catch (error) {
      setStatusIsError(true);
      setStatus(error instanceof Error ? error.message : '报名提交失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="activity-signup-title" className="activity-signup-card">
      <header className="activity-signup-header">
        <div>
          <ClipboardList aria-hidden="true" size={18} />
          <h2 id="activity-signup-title">报名表单</h2>
        </div>
        <ActivitySignupWindow activity={activity} locked={locked} />
      </header>

      <form onSubmit={(event) => { void handleSubmit(event); }}>
        <div className="activity-signup-fields">
          {activity.questions.map((question) => (
            <ActivitySignupField
              disabled={!viewer || signupUnavailable || submitting}
              key={question.id}
              onMultiChoiceChange={updateMultiChoice}
              onValueChange={updateValue}
              question={question}
              value={values[question.id]}
            />
          ))}
        </div>

        <footer className="activity-signup-footer">
          {viewer ? (
            <div aria-label="选择签名档" className="reply-signature-options activity-signature-options" role="radiogroup">
              {signatureOptions.map((option) => (
                <label key={option.value}>
                  <input
                    checked={signatureIndex === option.value}
                    disabled={signupUnavailable || submitting}
                    name="activity-signup-signature"
                    onChange={() => setSignatureIndex(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          ) : <span />}

          <div className="activity-signup-actions">
            {status && (
              <span className={statusIsError ? 'activity-signup-status-error' : ''} role={statusIsError ? 'alert' : 'status'}>
                {status}
              </span>
            )}
            {viewer ? (
              <>
                <button
                  className="reply-secondary-button activity-signup-preview-button"
                  disabled={submitting}
                  onClick={openPreview}
                  type="button"
                >
                  <Eye size={15} />
                  预览
                </button>
                <button className="activity-signup-submit-button" disabled={!canSubmit} type="submit">
                  {submitting ? <span className="activity-signup-spinner" aria-hidden="true" /> : action === 'modify' ? <Check size={15} /> : <Send size={15} />}
                  {submitting ? '提交中' : action === 'modify' ? '保存修改' : action === 'restore' ? '重新报名' : '提交报名'}
                </button>
              </>
            ) : (
              <a href={loginHref}><LogIn size={15} />登录后报名</a>
            )}
          </div>
        </footer>
      </form>

      {previewOpen && viewer && (
        <PostEditorPreviewDialog
          attachments={[]}
          editorValue={{
            content: formatActivitySignupPreviewHtml(activity.questions, values),
            mode: 'rich',
          }}
          label="报名预览"
          onClose={() => setPreviewOpen(false)}
          previewAuthor={{ avatar: viewer.avatar, name: viewer.name }}
          previewFloor={previewFloor}
          previewSignature={signatureIndex > 0 ? signatures[signatureIndex - 1] : undefined}
          previewedAt={previewedAt}
          title={`Re: ${threadTitle}`}
        />
      )}
    </section>
  );
}

function ActivitySignupField({
  disabled,
  onMultiChoiceChange,
  onValueChange,
  question,
  value,
}: {
  disabled: boolean;
  onMultiChoiceChange: (questionId: string, optionId: string, checked: boolean) => void;
  onValueChange: (questionId: string, value: ActivitySignupValue) => void;
  question: ThreadActivityQuestion;
  value: ActivitySignupValue | undefined;
}) {
  const label = (
    <>{question.label}{question.required && <span aria-hidden="true">*</span>}</>
  );

  if (question.type === 'choice') {
    return (
      <fieldset className={isWideQuestion(question) ? 'activity-signup-field-wide' : ''}>
        <legend>{label}</legend>
        <div className="activity-signup-choices">
          {question.options.map((option) => (
            <label className={value === option.id ? 'activity-signup-choice-selected' : ''} key={option.id}>
              <input
                checked={value === option.id}
                disabled={disabled}
                name={`activity-signup-${question.id}`}
                onChange={() => onValueChange(question.id, option.id)}
                type="radio"
                value={option.id}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (question.type === 'multiChoice') {
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      <fieldset className="activity-signup-field-wide">
        <legend>{label}</legend>
        <div className="activity-signup-choices">
          {question.options.map((option) => {
            const checked = selectedValues.includes(option.id);
            return (
              <label className={checked ? 'activity-signup-choice-selected' : ''} key={option.id}>
                <input
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => onMultiChoiceChange(question.id, option.id, event.currentTarget.checked)}
                  type="checkbox"
                  value={option.id}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const textValue = typeof value === 'string' ? value : '';
  const isUserId = question.label.trim().toUpperCase() === 'ID';
  const useTextarea = /备注|说明|想说|补充/.test(question.label);
  const inputType = /邮箱|email/i.test(question.label) ? 'email' : /电话|手机/.test(question.label) ? 'tel' : 'text';
  const className = useTextarea || isWideQuestion(question)
    ? 'activity-signup-field activity-signup-field-wide'
    : 'activity-signup-field';

  return (
    <label className={className}>
      <span>{label}</span>
      {useTextarea ? (
        <textarea
          disabled={disabled || isUserId}
          onChange={(event) => onValueChange(question.id, event.currentTarget.value)}
          rows={3}
          value={textValue}
        />
      ) : (
        <input
          disabled={disabled || isUserId}
          onChange={(event) => onValueChange(question.id, event.currentTarget.value)}
          type={inputType}
          value={textValue}
        />
      )}
    </label>
  );
}

function ActivitySignupWindow({ activity, locked }: { activity: ThreadActivity; locked: boolean }) {
  const statusLabel = locked
    ? '活动已锁定'
    : activity.status === 'not_started'
      ? '报名未开始'
      : activity.status === 'closed'
        ? '报名已截止'
        : activity.status === 'open'
          ? '报名进行中'
          : '';
  const range = activity.startsAt && activity.endsAt
    ? `${formatSignupTime(activity.startsAt)} — ${formatSignupTime(activity.endsAt)}`
    : '';

  if (!statusLabel && !range) return null;
  return (
    <div className="activity-signup-window">
      {range && <time>{range}</time>}
      {statusLabel && <span data-status={locked ? 'closed' : activity.status ?? 'unknown'}>{statusLabel}</span>}
    </div>
  );
}

function createInitialValues(
  questions: ThreadActivityQuestion[],
  viewerName: string,
  existingSignup: ThreadFloorData | null,
) {
  const source = existingSignup?.paragraphs.join('\n') ?? '';
  return questions.reduce<Record<string, ActivitySignupValue>>((result, question) => {
    const storedValue = getStoredQuestionValue(source, question, questions);
    if (question.type === 'multiChoice') {
      result[question.id] = storedValue
        ? storedValue.split(/[、,，]/).map((label) => question.options.find((option) => option.label === label.trim())?.id).filter((id): id is string => Boolean(id))
        : [];
    } else if (question.type === 'choice') {
      result[question.id] = question.options.find((option) => option.label === storedValue)?.id ?? '';
    } else {
      result[question.id] = question.label.trim().toUpperCase() === 'ID' ? viewerName : storedValue;
    }
    return result;
  }, {});
}

function getStoredQuestionValue(source: string, question: ThreadActivityQuestion, questions: ThreadActivityQuestion[]) {
  const prefix = `${question.label}：`;
  const start = source.indexOf(prefix);
  if (start < 0) return '';
  const valueStart = start + prefix.length;
  const nextStarts = questions
    .map((candidate) => source.indexOf(`${candidate.label}：`, valueStart))
    .filter((index) => index >= 0);
  const end = nextStarts.length > 0 ? Math.min(...nextStarts) : source.length;
  const value = source.slice(valueStart, end).trim();
  return value === '无' ? '' : value;
}

function hasSignupValue(value: ActivitySignupValue | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
}

function formatActivitySignupPreviewHtml(
  questions: ThreadActivityQuestion[],
  values: Record<string, ActivitySignupValue>,
) {
  return questions.map((question) => {
    const value = formatActivitySignupPreviewValue(question, values[question.id]);
    return `${escapeHtml(question.label)}：${escapeHtml(value)}`;
  }).join('<br>');
}

function formatActivitySignupPreviewValue(
  question: ThreadActivityQuestion,
  value: ActivitySignupValue | undefined,
) {
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return value
      .map((optionId) => question.options.find((option) => option.id === optionId)?.label ?? optionId)
      .join('、');
  }
  const textValue = value?.trim() ?? '';
  if (!textValue) return '';
  if (question.type === 'choice') {
    return question.options.find((option) => option.id === textValue)?.label ?? textValue;
  }
  return textValue;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isWideQuestion(question: ThreadActivityQuestion) {
  return question.label.length > 12 || question.options.some((option) => option.label.length > 10);
}

function formatSignupTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(timestamp * 1000));
}
