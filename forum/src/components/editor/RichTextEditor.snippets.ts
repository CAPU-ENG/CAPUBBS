export type HtmlSnippet = {
  code: string;
  id: string;
  name: string;
};

const htmlSnippetsStorageKey = 'capubbs-html-snippets:v1';

export function readHtmlSnippets(): HtmlSnippet[] {
  try {
    const storedValue = JSON.parse(window.localStorage.getItem(htmlSnippetsStorageKey) ?? '[]');
    if (!Array.isArray(storedValue)) return [];

    return storedValue.filter(isHtmlSnippet);
  } catch {
    return [];
  }
}

export function storeHtmlSnippets(snippets: HtmlSnippet[]) {
  window.localStorage.setItem(htmlSnippetsStorageKey, JSON.stringify(snippets));
}

export function createHtmlSnippet(name: string, code: string): HtmlSnippet {
  return {
    code,
    id: typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
  };
}

function isHtmlSnippet(value: unknown): value is HtmlSnippet {
  if (!value || typeof value !== 'object') return false;

  const snippet = value as Partial<HtmlSnippet>;
  return typeof snippet.id === 'string'
    && snippet.id.length > 0
    && typeof snippet.name === 'string'
    && snippet.name.trim().length > 0
    && typeof snippet.code === 'string'
    && snippet.code.length > 0;
}
