import { useEffect, useState } from 'react';
import { readThreadIds, subscribeThreadReadState } from '../utils/threadReadState';

export function useReadThreadIds(username?: string | null) {
  const [threadIds, setThreadIds] = useState(() => readThreadIds(username));

  useEffect(() => {
    const refresh = () => setThreadIds(readThreadIds(username));
    refresh();
    return subscribeThreadReadState(username, refresh);
  }, [username]);

  return threadIds;
}
