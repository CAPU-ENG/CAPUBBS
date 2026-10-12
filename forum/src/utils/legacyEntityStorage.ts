// The legacy post/reply/edit APIs run html_entity_decode() once over the title
// and text before storing them. Escaping every ampersand makes that single pass
// return the original string, so serialized entities such as &quot; inside a
// style attribute or &lt; in body text survive storage unchanged.
export function protectFromLegacyEntityDecode(value: string) {
  return value.replace(/&/g, '&amp;');
}
