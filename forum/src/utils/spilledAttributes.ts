// Some copied HTML (Typora, other editors, earlier broken posts) writes a quoted
// font name inside a double-quoted attribute without escaping it:
//   style="font-family: 楷体, STKaiti, "Kaiti SC", serif;"
// Browsers end the attribute at the inner quote and turn the rest into junk
// attributes such as kaiti="" sc",="" serif;"="". Attribute names can never
// legitimately contain quotes, so such a run is rebuilt into the attribute it
// was cut from when that value visibly ends mid-list, and dropped otherwise.

const spilledAttributeHint = /"[^\s"=<>]*=""|\s"[^\s=<>]*=""/;

export function hasSpilledAttributeHint(html: string) {
  return spilledAttributeHint.test(html);
}

export function repairSpilledAttributes(root: ParentNode) {
  let changed = false;
  root.querySelectorAll('*').forEach((element) => {
    if (repairElementAttributes(element)) changed = true;
  });
  return changed;
}

export function repairSpilledAttributesInHtml(html: string) {
  if (!hasSpilledAttributeHint(html)) return html;
  const template = document.createElement('template');
  template.innerHTML = html;
  return repairSpilledAttributes(template.content) ? template.innerHTML : html;
}

function repairElementAttributes(element: Element) {
  const attributes = Array.from(element.attributes);
  if (!attributes.some((attribute) => attribute.name.includes('"'))) return false;

  let index = 0;
  while (index < attributes.length) {
    const runStart = index;
    while (index < attributes.length && attributes[index].value === '' && !isSafeEmptyRunBoundary(attributes, index)) {
      index += 1;
    }
    const run = attributes.slice(runStart, index);
    const lastQuoted = run.map((attribute) => attribute.name.includes('"')).lastIndexOf(true);

    if (lastQuoted >= 0) {
      const spilled = run.slice(0, lastQuoted + 1);
      const owner = runStart > 0 ? attributes[runStart - 1] : null;
      spilled.forEach((attribute) => element.removeAttribute(attribute.name));
      if (owner && /[,:]\s*$/.test(owner.value)) {
        const rest = `"${spilled.map((attribute) => attribute.name).join(' ')}`.replace(/"$/, '');
        element.setAttribute(owner.name, `${owner.value}${rest}`.trim());
      }
    }
    index = Math.max(index, runStart + 1);
  }
  return true;
}

// A run of empty attributes stops at a real empty attribute that follows the
// spilled names' closing quote (e.g. `serif;"="" open=""` keeps `open`).
function isSafeEmptyRunBoundary(attributes: Attr[], index: number) {
  return index > 0 && /"$/.test(attributes[index - 1].name) && !attributes[index].name.includes('"');
}
