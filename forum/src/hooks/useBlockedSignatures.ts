import { useMemo, useSyncExternalStore } from 'react';
import {
  parseBlockedSignatures,
  readBlockedSignaturesSnapshot,
  subscribeBlockedSignatures,
} from '../utils/preciseSignatureBlocking';

export function useBlockedSignatures() {
  const snapshot = useSyncExternalStore(subscribeBlockedSignatures, readBlockedSignaturesSnapshot, () => '[]');
  return useMemo(() => parseBlockedSignatures(snapshot), [snapshot]);
}
