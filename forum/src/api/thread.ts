import defaultAvatar from '../assets/bg/bicycle.svg';
import type { NestedReply, ThreadAuthor, ThreadFloorData } from '../data/threadDemo';
import type { UserTag } from '../data/tags';
import type { FloorDecorationPaths } from '../data/floorDecoration';
import { mapUserMedals } from './medals';
import {
  forumMarkupToPlainText,
  renderForumMarkup,
  requiresIsolatedForumHtml,
  translateLegacyForumMarkup,
} from '../utils/forumMarkup';
import { normalizeLegacyAvatar } from '../utils/legacyAssets';
import type { SignatureFloorReference } from '../utils/signatureFloorLink';

const THREAD_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type ThreadDetail = {
  activity: ThreadActivity | null;
  authorName: string;
  authorOnly: boolean;
  bid: number;
  board: string;
  boardHref: string;
  bookmarked: boolean;
  canReply: boolean;
  currentPage: number;
  floors: ThreadFloorData[];
  id: string;
  isActivity: boolean;
  locked: boolean;
  pageCount: number;
  replies: number;
  requiredStars: number;
  tid: number;
  title: string;
  totalFloors: number;
  viewer: ThreadAuthor | null;
  viewerSignatures: string[];
  views: number;
};

export type ThreadActivityQuestionOption = {
  id: string;
  label: string;
};

export type ThreadActivityQuestion = {
  id: string;
  label: string;
  options: ThreadActivityQuestionOption[];
  required: boolean;
  type: 'choice' | 'multiChoice' | 'text';
};

export type ThreadActivity = {
  endsOn: string;
  endsAt: number;
  id: number;
  name: string;
  questions: ThreadActivityQuestion[];
  startsOn: string;
  startsAt: number;
  status: 'closed' | 'not_started' | 'open' | null;
};

export type ActivityUpdateCase = {
  case_id?: number;
  case_name: string;
  comment: string;
};

export type ActivityUpdateOption = {
  cases?: ActivityUpdateCase[];
  comment: string;
  option_id?: number;
  option_name: string;
  required: 0 | 1;
  type_id: 1 | 3 | 6;
};

export type EditableThreadFloor = {
  attachments: string;
  author: string;
  bid: number;
  createdAt: string;
  pid: number;
  previewAuthor: ThreadAuthor;
  previewSignatures: string[];
  signatureIndex: number;
  text: string;
  tid: number;
  title: string;
  updatedAt: string;
};

export type ThreadAttachmentInfo = {
  id: string;
  name: string;
  size: number;
};

export type ThreadEditorViewer = ThreadAuthor & {
  signatures: string[];
};

export type ActivitySignupValue = string | string[];

export type ActivitySignupSummaryRecord = {
  hasUnfinishedPunishment: boolean;
  id: number;
  joinedAt: number;
  status: '有效' | '已取消';
  username: string;
  values: Record<string, ActivitySignupValue>;
};

export type ActivitySignupSummary = {
  records: ActivitySignupSummaryRecord[];
  totals: {
    canceled: number;
    effective: number;
    total: number;
  };
};

export class ThreadApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThreadApiError';
  }
}

export async function fetchThreadDetail({
  authorOnly,
  bid,
  decoration,
  page,
  signal,
  tagMedalDisplay,
  tid,
}: {
  authorOnly: boolean;
  bid: number;
  decoration: boolean;
  page: number;
  signal?: AbortSignal;
  tagMedalDisplay: boolean;
  tid: number;
}) {
  const body = new URLSearchParams({
    ask: 'thread_detail',
    authorOnly: authorOnly ? '1' : '0',
    bid: String(bid),
    medal: tagMedalDisplay ? '1' : '0',
    tag: tagMedalDisplay ? '1' : '0',
    page: String(page),
    render: 'both',
    tid: String(tid),
  });
  if (decoration) body.set('decoration', '1');

  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ThreadApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ThreadApiError(payload.message?.trim() || '帖子加载失败，请稍后重试。');
  }

  return mapThreadDetail(payload.data, { authorOnly, bid, page, tid });
}

export async function fetchEditableThreadFloor({
  bid,
  pid,
  signal,
  tid,
}: {
  bid: number;
  pid: number;
  signal?: AbortSignal;
  tid: number;
}) {
  const payload = await requestThreadApi(new URLSearchParams({
    ask: 'editpreview',
    bid: String(bid),
    pid: String(pid),
    tid: String(tid),
  }), signal, '编辑内容读取失败，请稍后重试。');
  const rows = asRows(payload.data);
  const post = rows.find((row) => positiveInteger(row.pid, 0) === pid)
    ?? asRow(payload.data);
  const viewer = rows.find((row) => Boolean(plainText(row.username))) ?? {};
  const viewerName = plainText(viewer.username);

  if (
    positiveInteger(post.bid, 0) !== bid
    || positiveInteger(post.tid, 0) !== tid
    || positiveInteger(post.pid, 0) !== pid
  ) {
    throw new ThreadApiError('没有找到可编辑的帖子或楼层。');
  }

  if (!viewerName) {
    throw new ThreadApiError('无法读取编辑用户信息，请重新登录后再试。');
  }

  const previewAuthor = await fetchThreadEditorViewer(plainText(post.author) || viewerName, signal);

  return {
    attachments: stringValue(post.attachs),
    author: plainText(post.author),
    bid,
    createdAt: stringValue(post.timestamp ?? post.posttime ?? post.createdAt),
    pid,
    previewAuthor,
    previewSignatures: previewAuthor.signatures,
    signatureIndex: Math.min(3, nonNegativeInteger(post.sig)),
    text: stringValue(post.text) === '<br>' ? '' : stringValue(post.text),
    tid,
    title: plainText(post.title),
    updatedAt: stringValue(post.updatetime ?? post.updatedAt),
  } satisfies EditableThreadFloor;
}

export async function fetchThreadEditorViewer(username: string, signal?: AbortSignal): Promise<ThreadEditorViewer> {
  const normalizedUsername = username.trim();
  if (!normalizedUsername) throw new ThreadApiError('无法读取编辑用户信息，请重新登录后再试。');

  const payload = await requestThreadApi(new URLSearchParams({
    ask: 'user_profile',
    medal: '1',
    tag: '1',
    username: normalizedUsername,
  }), signal, '签名档读取失败，请稍后重试。');
  const profile = asRows(payload.data)[0] ?? asRow(payload.data);
  const name = plainText(profile.username) || normalizedUsername;

  const author = mapAuthor(profile, name);
  const stats = asRow(profile.stats);

  return {
    ...author,
    avatar: normalizeLegacyAvatar(profile.avatar)
      || normalizeLegacyAvatar(profile.icon)
      || author.avatar,
    checkins: nonNegativeInteger(stats.checkins ?? profile.sign),
    lastSeen: plainText(profile.lastSeenAt ?? profile.lastdate) || '时间未知',
    replies: nonNegativeInteger(stats.replies ?? profile.reply),
    signatures: mapEditableViewerSignatures(profile),
    topics: nonNegativeInteger(stats.posts ?? profile.post),
  };
}

export async function updateThreadFloor({
  attachments,
  bid,
  pid,
  signatureIndex,
  text,
  tid,
  title,
}: {
  attachments: string;
  bid: number;
  pid: number;
  signatureIndex: number;
  text: string;
  tid: number;
  title: string;
}) {
  const payload = await requestThreadApi(new URLSearchParams({
    ask: 'edit',
    attachs: attachments,
    bid: String(bid),
    pid: String(pid),
    sig: String(signatureIndex),
    text,
    tid: String(tid),
    title,
    type: 'web',
  }), undefined, '保存修改失败，请稍后重试。');
  const row = asRow(payload.data);

  return {
    bid: positiveInteger(row.bid, bid),
    pid: positiveInteger(row.pid, pid),
    tid: positiveInteger(row.tid, tid),
  };
}

export async function deleteThreadFloor({
  bid,
  pid,
  tid,
}: {
  bid: number;
  pid: number;
  tid: number;
}) {
  await requestThreadApi(new URLSearchParams({
    ask: 'delete',
    bid: String(bid),
    pid: String(pid),
    tid: String(tid),
  }), undefined, '楼层删除失败，请稍后重试。');
}

export async function fetchThreadAttachmentInfo(id: string, signal?: AbortSignal): Promise<ThreadAttachmentInfo> {
  const payload = await requestThreadApi(new URLSearchParams({
    ask: 'attachinfo',
    id,
  }), signal, '附件信息读取失败。');
  const row = asRow(payload.data);

  if (stringValue(row.exist).toUpperCase() !== 'YES') {
    throw new ThreadApiError('附件不存在。');
  }

  return {
    id: stringValue(row.id) || id,
    name: plainText(row.name) || `附件 #${id}`,
    size: nonNegativeInteger(row.size),
  };
}

export async function uploadThreadAttachment(file: File): Promise<ThreadAttachmentInfo> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch('/bbs/attach/', {
      body: formData,
      credentials: 'include',
      method: 'POST',
    });
  } catch {
    throw new ThreadApiError('暂时无法上传附件，请稍后重试。');
  }

  let payload: ApiRow;
  try {
    payload = asRow(await response.json());
  } catch {
    throw new ThreadApiError('附件服务返回了无法识别的数据。');
  }

  const legacyCode = stringValue(payload.code);
  const id = stringValue(payload.msg ?? payload.id);
  if (!response.ok || legacyCode !== '0' || !id) {
    throw new ThreadApiError(stringValue(payload.msg) || '附件上传失败，请稍后重试。');
  }

  return {
    id,
    name: file.name,
    size: file.size,
  };
}

export async function publishActivitySignup({
  action,
  bid,
  signatureIndex,
  tid,
  title,
  values,
}: {
  action: 'cancel' | 'join' | 'modify' | 'restore';
  bid: number;
  signatureIndex: number;
  tid: number;
  title: string;
  values: Record<string, ActivitySignupValue>;
}) {
  const body = new URLSearchParams({
    action,
    ask: 'activity_signup',
    bid: String(bid),
    sig: String(signatureIndex),
    tid: String(tid),
    title,
    type: 'web',
  });

  Object.entries(values).forEach(([id, value]) => {
    body.append(`option_values[${id}]`, Array.isArray(value) ? value.join(',') : value.trim());
  });

  await requestThreadApi(
    body,
    undefined,
    action === 'cancel'
      ? '取消报名失败，请稍后重试。'
      : action === 'modify'
        ? '报名修改失败，请稍后重试。'
        : action === 'restore'
          ? '恢复报名失败，请稍后重试。'
          : '报名提交失败，请稍后重试。',
  );
}

export async function updateActivityConfiguration({
  activityEndsOn,
  activityStartsOn,
  bid,
  options,
  signupEndsAt,
  signupStartsAt,
  tid,
}: {
  activityEndsOn: string;
  activityStartsOn: string;
  bid: number;
  options: ActivityUpdateOption[];
  signupEndsAt: number;
  signupStartsAt: number;
  tid: number;
}) {
  const payload = await requestThreadApi(new URLSearchParams({
    activity_ends_on: activityEndsOn,
    activity_starts_on: activityStartsOn,
    ask: 'activity_update',
    bid: String(bid),
    options: JSON.stringify(options),
    signup_ends_at: String(signupEndsAt),
    signup_starts_at: String(signupStartsAt),
    tid: String(tid),
  }), undefined, '活动保存失败，请稍后重试。');
  const activity = mapThreadActivity(asRow(payload.data).activity);
  if (!activity) throw new ThreadApiError('活动已保存，但返回的数据不完整，请刷新页面。');
  return activity;
}

export async function fetchActivitySignupSummary({
  bid,
  signal,
  tid,
}: {
  bid: number;
  signal?: AbortSignal;
  tid: number;
}): Promise<ActivitySignupSummary> {
  const payload = await requestThreadApi(new URLSearchParams({
    ask: 'activity_signup_summary',
    bid: String(bid),
    tid: String(tid),
  }), signal, '报名汇总读取失败，请稍后重试。');
  const data = asRow(payload.data);
  const totals = asRow(data.totals);
  const records = asRows(data.records).map((record): ActivitySignupSummaryRecord => ({
    hasUnfinishedPunishment: nonNegativeInteger(record.has_unfinished_punishment) > 0,
    id: positiveInteger(record.record_id, 0),
    joinedAt: nonNegativeInteger(record.joined_at),
    status: stringValue(record.status) === 'canceled' ? '已取消' : '有效',
    username: plainText(record.username),
    values: Object.fromEntries(Object.entries(asRow(record.values)).map(([id, value]) => [
      id,
      Array.isArray(value) ? value.map(stringValue).filter(Boolean) : stringValue(value),
    ])),
  }));

  return {
    records,
    totals: {
      canceled: nonNegativeInteger(totals.canceled),
      effective: nonNegativeInteger(totals.effective),
      total: nonNegativeInteger(totals.total),
    },
  };
}

async function requestThreadApi(body: URLSearchParams, signal: AbortSignal | undefined, fallbackMessage: string) {
  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ThreadApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ThreadApiError(payload.message?.trim() || fallbackMessage);
  }

  return payload;
}

export async function fetchSignatureReferencedFloorHtml(
  { bid, pid, tid }: SignatureFloorReference,
  signal?: AbortSignal,
) {
  const body = new URLSearchParams({
    bid: String(bid),
    pid: String(pid),
    tid: String(tid),
  });

  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ThreadApiError('签名档引用的楼层暂时无法读取。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ThreadApiError('签名档引用的楼层返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ThreadApiError(payload.message?.trim() || '签名档引用的楼层读取失败。');
  }

  const row = asRow(payload.data);
  if (positiveInteger(row.bid, 0) !== bid
    || positiveInteger(row.tid, 0) !== tid
    || positiveInteger(row.pid, 0) !== pid) {
    throw new ThreadApiError('签名档引用的楼层不存在。');
  }

  const rawText = stringValue(row.text);
  const source = stringValue(row.ishtml).toUpperCase() === 'YES'
    ? rawText
    : decodeHtmlEntities(rawText)
      .replace(/\r\n?|\n/g, '<br>')
      .replace(/ /g, '&nbsp;');

  return translateLegacyForumMarkup(source);
}

export async function postNestedReply({
  fid,
  text,
}: {
  fid: number;
  text: string;
}) {
  const body = new URLSearchParams({
    ask: 'lzl',
    fid: String(fid),
    method: 'post',
    text,
  });

  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
    });
  } catch {
    throw new ThreadApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ThreadApiError(payload.message?.trim() || '楼中楼回复发布失败，请稍后重试。');
  }

  return findNewestNestedReplyId(fid, text);
}

export async function deleteNestedReply({
  fid,
  id,
  text,
}: {
  fid: number;
  id: number;
  text: string;
}) {
  const resolvedId = id > 0 ? id : await findNewestNestedReplyId(fid, text);
  if (resolvedId <= 0) {
    throw new ThreadApiError('暂时无法确认这条楼中楼的编号，请刷新页面后再删除。');
  }

  const body = new URLSearchParams({
    ask: 'lzl',
    fid: String(fid),
    lzlid: String(resolvedId),
    method: 'delete',
  });

  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
    });
  } catch {
    throw new ThreadApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ThreadApiError(payload.message?.trim() || '楼中楼删除失败，请稍后重试。');
  }
}

async function findNewestNestedReplyId(fid: number, text: string) {
  const body = new URLSearchParams({
    ask: 'lzl',
    fid: String(fid),
    method: 'ask',
  });

  try {
    const response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
    });
    const payload = await response.json() as ApiEnvelope;
    if (!response.ok || payload.code !== 0) return 0;

    const rows = Array.isArray(payload.data)
      ? payload.data.map(asRow)
      : [asRow(payload.data)];
    return rows.reduce((newestId, row) => {
      if (stringValue(row.text) !== text) return newestId;
      return Math.max(newestId, nonNegativeInteger(row.id));
    }, 0);
  } catch {
    // The reply has already been published. A failed ID lookup must not invite a duplicate retry.
    return 0;
  }
}

function mapThreadDetail(
  value: unknown,
  request: { authorOnly: boolean; bid: number; page: number; tid: number },
): ThreadDetail {
  const data = asRow(value);
  const board = asRow(data.board);
  const thread = asRow(data.thread);
  const floorsPage = asRow(data.floorsPage);
  const viewerState = asRow(data.viewerState);
  const mainPost = asRow(data.mainPost);
  const activity = mapThreadActivity(data.activity);

  const title = plainText(thread.title);
  const boardTitle = plainText(board.title) || plainText(board.name);
  if (!title || Object.keys(mainPost).length === 0) {
    throw new ThreadApiError('帖子数据不完整，暂时无法展示。');
  }

  const viewerRow = nullableRow(data.viewer);
  const viewerName = viewerRow ? plainText(viewerRow.username) : '';
  const currentPage = positiveInteger(floorsPage.page, request.page);
  const replyFloors = asRows(floorsPage.items)
    .filter((floor) => positiveInteger(floor.pid, 0) !== 1)
    .map((floor) => mapFloor(floor, viewerName));
  const floors = currentPage === 1
    ? [mapFloor(mainPost, viewerName), ...replyFloors]
    : replyFloors;

  return {
    activity,
    authorName: plainText(thread.author),
    authorOnly: Boolean(floorsPage.authorOnly ?? request.authorOnly),
    bid: positiveInteger(thread.bid, request.bid),
    board: boardTitle || `版块 ${request.bid}`,
    boardHref: `/?bid=${positiveInteger(thread.bid, request.bid)}`,
    bookmarked: Boolean(viewerState.bookmarked),
    canReply: Boolean(viewerState.canReply),
    currentPage,
    floors,
    id: plainText(thread.id) || `${request.bid}-${request.tid}`,
    isActivity: Boolean(thread.isActivity) || activity !== null,
    locked: Boolean(thread.locked),
    pageCount: positiveInteger(floorsPage.pages, 1),
    replies: nonNegativeInteger(thread.replies),
    requiredStars: nonNegativeInteger(viewerState.requiredStar),
    tid: positiveInteger(thread.tid, request.tid),
    title,
    totalFloors: positiveInteger(floorsPage.total, floors.length),
    viewer: viewerRow ? mapAuthor(viewerRow, viewerName) : null,
    viewerSignatures: viewerRow ? mapViewerSignatures(viewerRow.signatures) : [],
    views: nonNegativeInteger(thread.views),
  };
}

function mapThreadActivity(value: unknown): ThreadActivity | null {
  const activity = nullableRow(value);
  if (!activity) return null;

  const signupWindow = asRow(activity.signup_window);
  const schedule = asRow(activity.schedule);
  const statusValue = stringValue(signupWindow.status);
  const status = statusValue === 'open' || statusValue === 'closed' || statusValue === 'not_started'
    ? statusValue
    : null;
  const questions = asRows(activity.options)
    .filter((option) => nonNegativeInteger(option.hiden) !== 1)
    .map((option): ThreadActivityQuestion | null => {
      const id = stringValue(option.option_id);
      const label = plainText(option.option_name);
      const typeId = nonNegativeInteger(option.type_id);
      if (!id || !label) return null;

      return {
        id,
        label,
        options: asRows(option.cases)
          .map((item) => ({
            id: stringValue(item.case_id),
            label: plainText(item.case_name),
          }))
          .filter((item) => item.id && item.label),
        required: Boolean(nonNegativeInteger(option.required)),
        type: typeId === 1 ? 'choice' : typeId === 3 ? 'multiChoice' : 'text',
      };
    })
    .filter((question): question is ThreadActivityQuestion => question !== null);

  return {
    endsOn: stringValue(schedule.ends_on),
    endsAt: nonNegativeInteger(signupWindow.ends_at),
    id: positiveInteger(activity.activity_id, 0),
    name: plainText(activity.name),
    questions,
    startsOn: stringValue(schedule.starts_on),
    startsAt: nonNegativeInteger(signupWindow.starts_at),
    status,
  };
}

function mapFloor(row: ApiRow, viewerName: string): ThreadFloorData {
  const bid = positiveInteger(row.bid, 0);
  const tid = positiveInteger(row.tid, 0);
  const floor = positiveInteger(row.pid, 1);
  const profile = nullableRow(row.authorProfile);
  const authorName = plainText(row.author) || '匿名用户';
  const rawText = stringValue(row.rawText);
  const contentHtml = renderPostHtml(rawText, stringValue(row.isHtml), stringValue(row.contentHtml));
  const safeContentHtml = renderForumMarkup(contentHtml);
  const signatureIndex = positiveInteger(row.signatureIndex, 0);
  const rawSignatures = profile ? asRow(profile.signatures) : {};
  const rawSignature = signatureIndex > 0 ? stringValue(rawSignatures[String(signatureIndex)]) : '';
  const signatureHtml = renderSignatureHtml(rawSignature, stringValue(row.signatureHtml));
  const safeSignatureHtml = renderForumMarkup(signatureHtml, { normalizeLegacyLineBreaks: true });
  const quoteHtml = renderForumMarkup(stringValue(row.quoteHtml));
  const quoteText = forumMarkupToPlainText(quoteHtml || safeContentHtml);
  const canEdit = Boolean(row.canEdit);
  const canDelete = Boolean(row.canDelete);

  return {
    author: mapAuthor(profile ?? { username: authorName, avatar: row.authorAvatar, star: row.authorStar }, authorName),
    canDelete,
    canEdit,
    contentHtml,
    editedAt: timestampChanged(row.createdAt, row.updatedAt) ? stringValue(row.updatedAt) : undefined,
    fid: positiveInteger(row.fid, 0),
    floor,
    id: `${bid}-${tid}-${floor}`,
    isOwn: Boolean(viewerName && authorName === viewerName),
    nestedReplies: asRows(row.nestedReplies).map(mapNestedReply),
    paragraphs: [quoteText || '此楼层暂无可显示的正文。'],
    publishedAt: stringValue(row.createdAt),
    quoteText,
    signature: forumMarkupToPlainText(safeSignatureHtml),
    signatureHtml,
    signatureIndex,
  };
}

function decodeHtmlEntities(value: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

function renderSignatureHtml(rawSignature: string, translatedSignature: string) {
  if (!rawSignature.trim()) return translatedSignature.trim();
  if (/<\/?[a-z][\s\S]*?>/i.test(rawSignature)) return rawSignature.trim();

  return translateLegacyForumMarkup(rawSignature
    .replace(/\r\n?|\n/g, '<br>')
    .replace(/ /g, '&nbsp;'))
    .trim();
}

function renderPostHtml(rawText: string, isHtml: string, translatedHtml: string) {
  if (!rawText.trim()) return translatedHtml.trim();
  if (isHtml.toUpperCase() === 'YES' && requiresIsolatedForumHtml(rawText)) {
    return translateLegacyForumMarkup(rawText).trim();
  }
  return (translatedHtml || rawText).trim();
}

function mapNestedReply(row: ApiRow): NestedReply {
  const authorName = plainText(row.author) || '匿名用户';
  const storedContent = stringValue(row.content);
  const targetMatch = storedContent.match(/^回复 @(.+?)[：:]\s*([\s\S]*)$/);

  return {
    author: mapAuthor({ username: authorName, avatar: row.authorAvatar }, authorName),
    canDelete: Boolean(row.canDelete),
    content: targetMatch ? targetMatch[2] : storedContent,
    id: String(row.id ?? `${authorName}-${row.createdAt ?? ''}`),
    publishedAt: stringValue(row.createdAt),
    target: targetMatch?.[1],
  };
}

function mapAuthor(row: ApiRow, fallbackName: string): ThreadAuthor {
  const stats = asRow(row.stats);
  const floorDecoration = mapFloorDecoration(row.floorDecoration);
  return {
    avatar: normalizeLegacyAvatar(row.avatar ?? row.icon) || defaultAvatar,
    checkins: nonNegativeInteger(stats.checkins),
    lastSeen: plainText(row.lastSeenAt) || '时间未知',
    medals: Array.isArray(row.medals) ? mapUserMedals(row.medals) : [],
    name: plainText(row.username) || fallbackName || '匿名用户',
    replies: nonNegativeInteger(stats.replies),
    role: '',
    stars: nonNegativeInteger(row.star),
    tags: Array.isArray(row.tags) ? mapThreadTags(row.tags) : [],
    topics: nonNegativeInteger(stats.posts),
    ...(floorDecoration ? { floorDecoration } : {}),
  };
}

function mapFloorDecoration(value: unknown): FloorDecorationPaths | null {
  const decoration = nullableRow(value);
  if (!decoration) return null;
  return {
    darkImagePath: stringValue(decoration.darkImagePath) || null,
    lightImagePath: stringValue(decoration.lightImagePath) || null,
  };
}

function mapThreadTags(value: unknown): UserTag[] {
  return asRows(value)
    .map((row): UserTag | null => {
      const id = stringValue(row.id);
      const name = plainText(row.name);
      if (!id || !name) return null;

      const addedAt = timestampToIso(row.added_at);
      const displayOrder = nonNegativeInteger(row.display_order);
      return {
        addedAt: addedAt || undefined,
        color: stringValue(row.color) || '#69747c',
        displayOrder: displayOrder === 1 || displayOrder === 2 ? displayOrder : undefined,
        id,
        name,
      };
    })
    .filter((tag): tag is UserTag => tag !== null);
}

function mapViewerSignatures(value: unknown) {
  const signatures = asRow(value);
  return ['1', '2', '3'].map((key) => renderSignatureHtml(stringValue(signatures[key]), ''));
}

function mapEditableViewerSignatures(viewer: ApiRow) {
  const structuredSignatures = mapViewerSignatures(viewer.signatures);
  if (structuredSignatures.some(Boolean)) return structuredSignatures;

  return [1, 2, 3].map((index) => renderSignatureHtml(stringValue(viewer[`sig${index}`]), ''));
}

function plainTextFromHtml(value: string) {
  if (!value.trim()) return '';
  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'text/html');
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function plainText(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return plainTextFromHtml(String(value));
}

function timestampChanged(createdAt: unknown, updatedAt: unknown) {
  const created = stringValue(createdAt);
  const updated = stringValue(updatedAt);
  return Boolean(updated && updated !== created);
}

function timestampToIso(value: unknown) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return new Date(numeric > 10_000_000_000 ? numeric : numeric * 1000).toISOString();
  }
  if (typeof value !== 'string' || !value.trim()) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function nonNegativeInteger(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function positiveInteger(value: unknown, fallback: number) {
  const number = nonNegativeInteger(value);
  return number > 0 ? number : fallback;
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRow : {};
}

function nullableRow(value: unknown) {
  const row = asRow(value);
  return Object.keys(row).length > 0 ? row : null;
}

function asRows(value: unknown) {
  return Array.isArray(value) ? value.map(asRow).filter((row) => Object.keys(row).length > 0) : [];
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
