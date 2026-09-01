import type { SVGProps } from 'react';

type LegacyForumIconProps = Omit<SVGProps<SVGSVGElement>, 'height' | 'width'> & {
  size?: number | string;
};

export function LegacyForumIcon({ size = 24, ...props }: LegacyForumIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect height="17.5" rx="1.75" width="18.5" x="2.75" y="3.25" />
      <path d="M3 9.25h18" />
      <path d="M19 18.5V18a5 5 0 0 0-5-5H8" />
      <path d="m11 10-3 3 3 3" />
    </svg>
  );
}
