import type { ReactElement, ReactNode, SVGProps } from "react"

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function IconBase({
  size = 24,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export function ChatQuestionIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 4.5h13A1.5 1.5 0 0 1 20 6v9a1.5 1.5 0 0 1-1.5 1.5H11L7 20v-3.5H5.5A1.5 1.5 0 0 1 4 15V6a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M10.1 9a2 2 0 0 1 3.9.55c0 1.3-1.9 1.5-1.9 2.75" />
      <path d="M12.1 14.6v.01" />
    </IconBase>
  )
}

export function LeafSearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="m15.25 15.25 4.75 4.75" />
      <path d="M8.5 12.75c0-2.6 1.7-4.25 4.5-4.55-.3 2.9-1.9 4.55-4.5 4.55Z" />
    </IconBase>
  )
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 4.5H7.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2H15" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1Z" />
      <path d="m9.25 13.25 2 2 3.5-4.25" />
    </IconBase>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 8.5a2 2 0 0 1 2-2h1.9l1.2-1.7a1.5 1.5 0 0 1 1.2-.65h2.4a1.5 1.5 0 0 1 1.2.65l1.2 1.7h1.9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="12.5" r="3.25" />
    </IconBase>
  )
}

export function FlaskIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 3.5h4" />
      <path d="M10.5 3.5v5L5.9 16.9a2 2 0 0 0 1.8 3.1h8.6a2 2 0 0 0 1.8-3.1L13.5 8.5v-5" />
      <path d="M7.75 14.5h8.5" />
    </IconBase>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4.5" y="6" width="15" height="13.5" rx="2" />
      <path d="M8.5 3.75v3.5M15.5 3.75v3.5M4.5 10.75h15" />
      <circle cx="9.25" cy="14.75" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 6.6C10.1 5.1 7.6 4.6 4.75 4.9v13.2c2.85-.3 5.35.2 7.25 1.7 1.9-1.5 4.4-2 7.25-1.7V4.9C16.4 4.6 13.9 5.1 12 6.6Z" />
      <path d="M12 6.6v13.2" />
    </IconBase>
  )
}

export function SproutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20c0-7 0-11 0-13.6" />
      <path
        d="M12 9.6C12 9.6 8.8 8.8 8 12c2.4 1.6 4 0 4-2.4Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M12 12.8c0 0 3.2-.8 4 2.4-2.4 1.6-4 0-4-2.4Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M8.75 20.5h6.5" />
    </IconBase>
  )
}

export function PaperclipIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </IconBase>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 19V5" />
      <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
    </IconBase>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </IconBase>
  )
}

export type LandingIconId =
  | "chat-question"
  | "leaf-search"
  | "clipboard-check"
  | "camera"
  | "flask"
  | "calendar"
  | "book"

const LANDING_ICONS: Record<LandingIconId, (props: IconProps) => ReactElement> =
  {
    "chat-question": ChatQuestionIcon,
    "leaf-search": LeafSearchIcon,
    "clipboard-check": ClipboardCheckIcon,
    camera: CameraIcon,
    flask: FlaskIcon,
    calendar: CalendarIcon,
    book: BookIcon,
  }

export function LandingIcon({
  id,
  ...props
}: { id: LandingIconId } & IconProps) {
  const Component = LANDING_ICONS[id]
  return <Component {...props} />
}
