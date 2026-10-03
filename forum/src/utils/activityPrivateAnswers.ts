import type { ThreadFloorData } from '../data/thread';

const PRIVATE_ANSWER_MASK = '***********';

// Display-only: puts the server-provided 个人可见 answers back into the floor's
// HTML. quoteText stays masked so quoting a signup never republishes them.
export function revealActivityPrivateAnswers(floor: ThreadFloorData): ThreadFloorData {
  const answers = floor.privateAnswers;
  if (!answers?.length || !floor.contentHtml?.includes(PRIVATE_ANSWER_MASK)) return floor;

  const template = document.createElement('template');
  template.innerHTML = floor.contentHtml;
  let changed = false;
  visitTextNodes(template.content, (node) => {
    let text = node.data;
    answers.forEach((answer) => {
      text = text.split(`${answer.label}：${PRIVATE_ANSWER_MASK}`).join(`${answer.label}：${answer.value}`);
    });
    if (text !== node.data) {
      node.data = text;
      changed = true;
    }
  });

  return changed ? { ...floor, contentHtml: template.innerHTML } : floor;
}

function visitTextNodes(parent: Node, callback: (node: Text) => void) {
  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === 3) {
      callback(node as Text);
    } else if (node.nodeType === 1) {
      visitTextNodes(node, callback);
    }
  });
}
