import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFloorDecorationEnabled } from '../../hooks/useAssistiveFeatures';
import { useTagMedalDisplayEnabled } from '../../hooks/useTagMedalDisplay';
import { getThreadCacheScope } from '../../utils/threadContentCache';
import { preloadThreadContent, threadRequestFromHref } from '../../utils/threadContentLoader';

export function ThreadIntentPreloader() {
  const decoration = useFloorDecorationEnabled();
  const tagMedalDisplay = useTagMedalDisplayEnabled();
  const { status, viewer } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;
    const scope = getThreadCacheScope(viewer?.username);

    const preloadFromEvent = (event: Event) => {
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      if (!(target instanceof HTMLAnchorElement) || target.download) return;
      const request = threadRequestFromHref(target.href, { decoration, tagMedalDisplay });
      if (!request || (request.bid === 1 && !viewer)) return;
      void preloadThreadContent(request, scope, 'intent').catch(() => undefined);
    };

    document.addEventListener('focusin', preloadFromEvent);
    document.addEventListener('pointerover', preloadFromEvent, { passive: true });
    document.addEventListener('touchstart', preloadFromEvent, { capture: true, passive: true });
    return () => {
      document.removeEventListener('focusin', preloadFromEvent);
      document.removeEventListener('pointerover', preloadFromEvent);
      document.removeEventListener('touchstart', preloadFromEvent, true);
    };
  }, [decoration, status, tagMedalDisplay, viewer]);

  return null;
}
