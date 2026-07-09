import type { ReactNode } from "react"

export type FeatureIconId = "photo" | "chat" | "region" | "languages"

interface IconProps {
  className?: string
}

function IconBase({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

function PhotoIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.4-2h5.2L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
      <circle cx={12} cy={13} r={3.25} />
    </IconBase>
  )
}

function ChatIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M20 12a8 8 0 1 0-14.9 4L4 20l4.2-1A8 8 0 0 0 20 12z" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </IconBase>
  )
}

function RegionIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 21s-6.5-5.4-6.5-10.3A6.4 6.4 0 0 1 12 4a6.4 6.4 0 0 1 6.5 6.7C18.5 15.6 12 21 12 21z" />
      <circle cx={12} cy={10.7} r={2.4} />
    </IconBase>
  )
}

function LanguagesIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx={12} cy={12} r={8} />
      <path d="M4 12h16M12 4c2.4 2.2 3.6 5 3.6 8s-1.2 5.8-3.6 8c-2.4-2.2-3.6-5-3.6-8s1.2-5.8 3.6-8z" />
    </IconBase>
  )
}

const ICONS: Record<FeatureIconId, (props: IconProps) => ReactNode> = {
  photo: PhotoIcon,
  chat: ChatIcon,
  region: RegionIcon,
  languages: LanguagesIcon,
}

interface FeatureIconProps extends IconProps {
  id: FeatureIconId
}

export function FeatureIcon({ id, className }: FeatureIconProps) {
  const Icon = ICONS[id]
  return <Icon className={className} />
}
