interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 30, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="15" cy="15" r="15" fill="#2D6A4F" />
      <path
        d="M15 22 C15 15 15 11 15 8"
        stroke="#95D5B2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M15 12 C15 12 11 11 10 15 C13 17 15 15 15 12 Z" fill="#95D5B2" />
      <path d="M15 16 C15 16 19 15 20 19 C17 21 15 19 15 16 Z" fill="#95D5B2" />
    </svg>
  )
}
