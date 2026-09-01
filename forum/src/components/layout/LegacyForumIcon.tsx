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
      <path d="M21.25 11.25V5a1.75 1.75 0 0 0-1.75-1.75h-15A1.75 1.75 0 0 0 2.75 5v14A1.75 1.75 0 0 0 4.5 20.75h6.25" />
      <path d="M3 9.25h18" />
      <path d="M8.25 13H16a3 2.75 0 0 1 0 5.5h-4" />
      <path d="m14.5 16-2.5 2.5 2.5 2.5" />
    </svg>
  );
}
