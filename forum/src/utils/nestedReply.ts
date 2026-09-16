export const NESTED_REPLY_MAX_LENGTH = 500;

export function formatNestedReplyText(content: string, targetName?: string | null) {
  return targetName ? `回复 @${targetName}：${content}` : content;
}

export function getNestedReplyInputState(content: string, targetName?: string | null) {
  const length = Array.from(content).length;
  const prefixLength = Array.from(formatNestedReplyText('', targetName)).length;
  const limit = Math.max(0, NESTED_REPLY_MAX_LENGTH - prefixLength);
  const isOverLimit = length > limit;

  return {
    canSubmit: Boolean(content.trim()) && !isOverLimit,
    isOverLimit,
    length,
    limit,
  };
}
