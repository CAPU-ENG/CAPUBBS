import { useEffect, useMemo, useState } from 'react';
import { fetchDataDisplayPanel } from '../api/dataDisplay';
import { preparePunishmentRecordTags } from '../utils/punishmentRecordTag';

export function usePunishmentRecordTags(html: string, enabled: boolean) {
  const prepared = useMemo(() => enabled ? preparePunishmentRecordTags(html) : null, [enabled, html]);
  const [result, setResult] = useState<{ prepared: typeof prepared; html: string } | null>(null);

  useEffect(() => {
    if (!prepared || !prepared.needsRecords) return;
    const controller = new AbortController();
    void fetchDataDisplayPanel('punishments', controller.signal).then(({ punishmentRecords }) => {
      if (!controller.signal.aborted) setResult({ prepared, html: prepared.render(punishmentRecords) });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setResult({ prepared, html: prepared.render([], error instanceof Error ? error.message : '罚跑记录加载失败') });
      }
    });
    return () => controller.abort();
  }, [prepared]);

  if (!prepared) return html;
  if (!prepared.needsRecords) return prepared.render([]);
  // Resolve before mounting executable HTML to avoid running user scripts twice.
  return result?.prepared === prepared ? result.html : '';
}
