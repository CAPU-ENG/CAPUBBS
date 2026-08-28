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
  assert.match(publishedBody.get('text'), /<!--capubbs:publish:[^>]+-->$/);

  let newThreadRequestCount = 0;
  let newThreadStoredText = '';
  globalThis.fetch = async (_url, init) => {
    newThreadRequestCount += 1;
    const body = new URLSearchParams(init.body);
    if (body.get('ask') === 'post') {
      newThreadStoredText = body.get('text');
      return {
        body: { cancel: () => Promise.resolve() },
        status: 200,
      };
    }
    if (body.get('ask') === 'recentpost') {
      return jsonResponse({
        code: 0,
        data: [{ bid: '28', pid: '1', tid: '156', title: '测试新主题' }],
      });
    }
    assert.equal(body.get('ask'), 'thread_detail');
    return jsonResponse({
      code: 0,
      data: {
        floorsPage: { items: [] },
        mainPost: { pid: 1, rawText: newThreadStoredText },
      },
    });
  };
  assert.deepEqual(await publishThreadContent(createPostRequest(), {
    recoveryDelayMs: 0,
    recoveryTimeoutMs: 100,
  }), {
    bid: 28,
    pid: 1,
    tid: 156,
  });
  assert.equal(newThreadRequestCount, 3);

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

  let requestCount = 0;
  let storedText = '';
  globalThis.fetch = async (_url, init) => {
    requestCount += 1;
    const body = new URLSearchParams(init.body);
    if (requestCount === 1) {
      storedText = body.get('text');
      return abortablePendingResponse(init.signal);
    }
    if (body.get('ask') === 'recentreply') {
      return jsonResponse({
        code: 0,
        data: [
          { nowuser: '' },
          { bid: '28', pid: '5', tid: '155', title: 'Re: 测试主题' },
        ],
      });
    }
    assert.equal(body.get('ask'), 'thread_detail');
    return jsonResponse({
      code: 0,
      data: {
        floorsPage: { items: [{ pid: 5, rawText: storedText }] },
        mainPost: { pid: 1, rawText: '楼主内容' },
      },
    });
  };
  assert.deepEqual(await publishThreadContent(createReplyRequest(), {
    publishTimeoutMs: 5,
    recoveryDelayMs: 0,
    recoveryTimeoutMs: 100,
  }), {
    bid: 28,
    pid: 5,
    tid: 155,
  });
  assert.equal(requestCount, 3);

  globalThis.fetch = async (_url, init) => {
    const body = new URLSearchParams(init.body);
    if (body.get('ask') === 'reply') return abortablePendingResponse(init.signal);
    return jsonResponse({ code: 0, data: [{ nowuser: '' }] });
  };
  await assert.rejects(
    publishThreadContent(createReplyRequest(), {
      publishTimeoutMs: 5,
      recoveryDelayMs: 0,
      recoveryTimeoutMs: 100,
    }),
    (error) => (
      error instanceof ThreadPublishingError
      && /刷新帖子检查是否已经发布/.test(error.message)
    ),
  );
} finally {
  globalThis.fetch = originalFetch;
}

console.log('thread publishing verification passed (13 assertions)');

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
