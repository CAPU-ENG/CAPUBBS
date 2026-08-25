import { useRef, type CSSProperties } from 'react';
import type { UserMedal } from '../../data/medals';
import { MEDAL_OCTAGON_PATH, MEDAL_TEXTURES } from '../management/medalDesign';
import { useMedalTilt } from './useMedalTilt';

export function MedalBadge({ medal, size = 'compact' }: { medal: UserMedal; size?: 'compact' | 'large' }) {
  if (size === 'compact') {
    const label = medalLabel(medal);
    return (
      <span
        aria-label={label}
        className="user-medal user-medal-compact"
        data-tooltip={label}
        role="img"
      >
        <span aria-hidden="true" className="user-medal-compact-visual">
          <img alt="" draggable={false} src={medal.smallImagePath} />
        </span>
      </span>
    );
  }

  return <LargeMedalBadge medal={medal} />;
}

export function MedalList({ medals }: { medals: UserMedal[] }) {
  if (medals.length === 0) return null;
  return (
    <span aria-label="展示勋章" className="user-medal-list">
      {medals.map((medal) => <MedalBadge key={medal.id} medal={medal} />)}
    </span>
  );
}

function LargeMedalBadge({ medal }: { medal: UserMedal }) {
  const previewRef = useRef<HTMLSpanElement>(null);
  const rotatorRef = useRef<HTMLSpanElement>(null);
  const texture = MEDAL_TEXTURES.find((item) => item.id === medal.textureId);

  useMedalTilt(previewRef, rotatorRef);

  return (
    <span
      aria-label={medalLabel(medal)}
      className="user-medal user-medal-large"
      ref={previewRef}
      role="img"
      title={medalLabel(medal)}
    >
      <span
        className="user-medal-rotator"
        ref={rotatorRef}
        style={texture ? { '--medal-foil': `url(${texture.src})` } as CSSProperties : undefined}
      >
        <span className="user-medal-front">
          {medal.largeImagePath ? (
            <img alt="" draggable={false} src={medal.largeImagePath} />
          ) : null}
          <span aria-hidden="true" className="user-medal-shine" />
          <span aria-hidden="true" className="user-medal-glare" />
        </span>
        <svg aria-hidden="true" className="user-medal-outline" preserveAspectRatio="none" viewBox="0 0 1 1">
          <path className="user-medal-outline-shadow" d={MEDAL_OCTAGON_PATH} vectorEffect="non-scaling-stroke" />
          <path className="user-medal-outline-highlight" d={MEDAL_OCTAGON_PATH} vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
    </span>
  );
}

function medalLabel(medal: UserMedal) {
  return medal.role ? `${medal.name}-${medal.role}` : medal.name;
}
