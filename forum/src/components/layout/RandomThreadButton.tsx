import { Dices } from 'lucide-react';
import { useState } from 'react';
import { fetchRandomThread } from '../../api/randomThread';
import { toForumHref } from '../../utils/forumBasePath';
import { LoadingSpinner as LoaderCircle } from './LoadingSpinner';

type RandomThreadButtonProps = {
  className?: string;
  iconOnly?: boolean;
  onNavigate?: () => void;
};

export function RandomThreadButton({
  className = 'supplement-link',
  iconOnly = false,
  onNavigate,
}: RandomThreadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function navigateToRandomThread() {
    if (loading) return;
    setLoading(true);

    try {
      const { bid, tid } = await fetchRandomThread();
      onNavigate?.();
      window.location.assign(toForumHref(`/?bid=${bid}&tid=${tid}&p=1&random=1`));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '随机帖子加载失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      aria-busy={loading}
      aria-label="试试手气"
      className={className}
      disabled={loading}
      title={iconOnly ? '试试手气' : undefined}
      type="button"
      onClick={() => void navigateToRandomThread()}
    >
      {loading
        ? <LoaderCircle className="animate-spin" size={iconOnly ? 20 : 15} />
        : <Dices aria-hidden="true" size={iconOnly ? 20 : 15} />}
      {!iconOnly && '试试手气'}
    </button>
  );
}
