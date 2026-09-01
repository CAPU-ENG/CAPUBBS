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
      <path d="M5.75 11.5v-7A1.75 1.75 0 0 1 7.5 2.75h13A1.75 1.75 0 0 1 22.25 4.5v11.75A1.75 1.75 0 0 1 20.5 18H11.5" />
      <path d="M6 8.5h16" />
      <path d="M1 15.25h6.75a2.75 2.75 0 0 1 0 5.5h-4" />
      <path d="m6.25 18.25-2.5 2.5 2.5 2.5" />
    </svg>
  );
}
