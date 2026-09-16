export const NESTED_REPLY_MAX_LENGTH = 400;

export function formatNestedReplyText(content: string, targetName?: string | null) {
  return targetName ? `回复 @${targetName}：${content}` : content;
}

export function getNestedReplyInputState(content: string) {
  const length = Array.from(content).length;
  const limit = NESTED_REPLY_MAX_LENGTH;
  const isOverLimit = length > limit;

  return {
    canSubmit: Boolean(content.trim()) && !isOverLimit,
    isOverLimit,
    length,
    limit,
  };
}
