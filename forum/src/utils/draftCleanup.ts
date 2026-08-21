const DRAFT_CLEANUP_MAX_WAIT_MS = 800;

export async function waitForLocalDraftCleanup(cleanup: Promise<void>) {
  let timeoutId = 0;
  const settledCleanup = cleanup.catch(() => undefined);

  await Promise.race([
    settledCleanup,
    new Promise<void>((resolve) => {
      timeoutId = window.setTimeout(resolve, DRAFT_CLEANUP_MAX_WAIT_MS);
    }),
  ]);

  if (timeoutId) window.clearTimeout(timeoutId);
}
