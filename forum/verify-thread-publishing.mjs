import assert from 'node:assert/strict';
import {
  publishThreadContent,
  ThreadPublishingError,
} from './src/api/threadPublishing.ts';

const originalFetch = globalThis.fetch;

try {
  let publishedBody;
  let successBodyCancelled = false;
  let successJsonRead = false;
  globalThis.fetch = async (_url, init) => {
    publishedBody = new URLSearchParams(init.body);
    return {
      body: {
        cancel() {
          successBodyCancelled = true;
          return Promise.resolve();
        },
      },
      async json() {
        successJsonRead = true;
        return { code: 0, data: { bid: 28, tid: 155, pid: 5 } };
      },
      ok: true,
      status: 200,
    };
  };
  assert.deepEqual(await publishThreadContent(createReplyRequest()), {
    bid: 28,
    pid: null,
    tid: 155,
  });
  assert.equal(successBodyCancelled, true);
  assert.equal(successJsonRead, false);
  assert.equal(publishedBody.get('ask'), 'reply');
  assert.equal(publishedBody.get('text'), '<p>测试正文</p>');

  let newThreadBody;
  globalThis.fetch = async (_url, init) => {
    newThreadBody = new URLSearchParams(init.body);
    return jsonResponse({ code: 0, data: [{ bid: '28', pid: '1', tid: '156' }] });
  };
  assert.deepEqual(await publishThreadContent(createPostRequest()), {
    bid: 28,
    pid: 1,
    tid: 156,
  });
  assert.equal(newThreadBody.get('ask'), 'post');
  assert.equal(newThreadBody.get('text'), '<p>测试新主题正文</p>');

  globalThis.fetch = async () => new Response(JSON.stringify({
    code: 1000,
    message: '请先登录',
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 401,
  });
  await assert.rejects(
    publishThreadContent(createReplyRequest()),
    (error) => error instanceof ThreadPublishingError && error.message === '请先登录',
  );

  globalThis.fetch = async (_url, init) => {
    return abortablePendingResponse(init.signal);
  };
  await assert.rejects(
    publishThreadContent(createReplyRequest(), {
      publishTimeoutMs: 5,
    }),
    (error) => (
      error instanceof ThreadPublishingError
      && /刷新帖子检查是否已经发布/.test(error.message)
    ),
  );
} finally {
  globalThis.fetch = originalFetch;
}

console.log('thread publishing verification passed (10 assertions)');

function createPostRequest() {
  return {
    attachments: '',
    author: '余割',
    bid: 28,
    signatureIndex: 0,
    text: '<p>测试新主题正文</p>',
    tid: null,
    title: '测试新主题',
  };
}

function createReplyRequest() {
  return {
    attachments: '',
    author: '余割',
    bid: 28,
    signatureIndex: 0,
    text: '<p>测试正文</p>',
    tid: 155,
    title: 'Re: 测试主题',
  };
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

function abortablePendingResponse(signal) {
  return new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      reject(new DOMException('aborted', 'AbortError'));
    }, { once: true });
  });
}
