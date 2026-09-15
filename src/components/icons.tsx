type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LogoMark({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 9V6a1 1 0 0 1 1-1h3" />
      <path d="M19 9V6a1 1 0 0 0-1-1h-3" />
      <path d="M5 15v3a1 1 0 0 0 1 1h3" />
      <path d="M19 15v3a1 1 0 0 1-1 1h-3" />
      <path d="M10 9v6l5-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 15V5" />
      <path d="M7.5 9.5L12 5l4.5 4.5" />
      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M12 2L14.2 9.8 22 12 14.2 14.2 12 22 9.8 14.2 2 12 9.8 9.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M14 5h5v5" />
      <path d="M19 5l-8.5 8.5" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M9 7l1.2-2h3.6L15 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none" />
      <path d="M4.5 16.5l5-5 3.5 3.5 2.5-2.5 4.5 4.5" />
    </svg>
  );
}

export function ClapperIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 9.5L5.5 5l13 3.3-1.3 4.2z" />
      <path d="M8 6l2 3.4M13 7.2l2 3.4" />
      <rect x="4" y="10" width="16" height="9" rx="1.5" />
    </svg>
  );
}
