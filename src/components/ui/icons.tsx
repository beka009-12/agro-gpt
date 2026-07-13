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

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </IconBase>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4.5 10.5 7.5-6 7.5 6" />
      <path d="M6.5 9v9.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
      <path d="M10 19.5v-5h4v5" />
    </IconBase>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.5 13.7 9.8 19 11.5l-5.3 1.7L12 18.5l-1.7-5.3L5 11.5l5.3-1.7L12 4.5Z" />
    </IconBase>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.2 2 3.4 5 3.4 8s-1.2 6-3.4 8c-2.2-2-3.4-5-3.4-8s1.2-6 3.4-8Z" />
    </IconBase>
  )
}

export function ConsultIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10" cy="8.5" r="3" />
      <path d="M4.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="m16.5 12.5 1.6 1.6L21 11" />
    </IconBase>
  )
}

export function SchemeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="6" y="5" width="12" height="15" rx="1.6" />
      <path d="M9 4.5h6a1 1 0 0 1 1 1v1H8v-1a1 1 0 0 1 1-1Z" />
      <path d="M9 11h6M9 14.5h6M9 8h3" />
    </IconBase>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 18c-1-5 1-11 12-12 1 8-3 12-8 12-1.5 0-2.8-.2-4-1Z" />
      <path d="M6 18c1.6-3 4-5.4 8-7.2" />
    </IconBase>
  )
}

export function RootsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v6" />
      <path d="M12 10c-1.5 1-2.3 3-2 6M12 10c1.5 1 2.3 3 2 6M12 10c-2.8 1-4.3 3.6-4.5 6.5M12 10c2.8 1 4.3 3.6 4.5 6.5" />
    </IconBase>
  )
}

export function GrowthIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4 16 5-5 3.5 3.5L20 7" />
      <path d="M14.5 7H20v5.5" />
    </IconBase>
  )
}

export function ResilienceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M11 5.5a2 2 0 1 1 4 0v8.4a4 4 0 1 1-4 0V5.5Z" />
      <path d="M13 9v5.5" />
    </IconBase>
  )
}

export function BloomIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="7" r="2.3" />
      <circle cx="12" cy="17" r="2.3" />
      <circle cx="7" cy="12" r="2.3" />
      <circle cx="17" cy="12" r="2.3" />
    </IconBase>
  )
}

export function HarvestIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 19v-8M12 19V5M19 19v-6" />
    </IconBase>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 4.2 2.2 4.6 5 .7-3.6 3.5.8 5-4.4-2.4-4.4 2.4.8-5-3.6-3.5 5-.7L12 4.2Z" />
    </IconBase>
  )
}

export function RenewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7" />
      <path d="M17.7 3.5v3.3h-3.3M6.3 20.5v-3.3h3.3" />
    </IconBase>
  )
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3.5 7 2.4v5.4c0 4.6-2.9 7.9-7 9.2-4.1-1.3-7-4.6-7-9.2V5.9l7-2.4Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </IconBase>
  )
}

export function PlantIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21V9" />
      <path d="M12 13C7 13 4 10 4 5c5 0 8 3 8 8Z" />
      <path d="M12 17c5 0 8-3 8-8-5 0-8 3-8 8Z" />
    </IconBase>
  )
}

export function FarmerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 21v-8a8 8 0 0 1 16 0v8" />
      <path d="M9 21v-5h6v5" />
      <path d="M7 8c2-4 8-4 10 0" />
    </IconBase>
  )
}

export function AgronomistIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
      <path d="M18 4v4M16 6h4" />
    </IconBase>
  )
}

export function CloudIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 19a4 4 0 1 1 0-8 6 6 0 0 1 11.5 2A3.5 3.5 0 1 1 19 20H8Z" />
    </IconBase>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </IconBase>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  )
}

export type AudienceIconId = "farmer" | "agronomist" | "gardener"

const AUDIENCE_ICONS: Record<
  AudienceIconId,
  (props: IconProps) => ReactElement
> = {
  farmer: FarmerIcon,
  agronomist: AgronomistIcon,
  gardener: PlantIcon,
}

export function AudienceIcon({
  id,
  ...props
}: { id: AudienceIconId } & IconProps) {
  const Component = AUDIENCE_ICONS[id]
  return <Component {...props} />
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

export type AboutIconId =
  | "flask"
  | "consult"
  | "scheme"
  | "globe"
  | "leaf"
  | "roots"
  | "growth"
  | "resilience"
  | "bloom"
  | "harvest"
  | "star"
  | "renew"
  | "shield"

const ABOUT_ICONS: Record<AboutIconId, (props: IconProps) => ReactElement> = {
  flask: FlaskIcon,
  consult: ConsultIcon,
  scheme: SchemeIcon,
  globe: GlobeIcon,
  leaf: LeafIcon,
  roots: RootsIcon,
  growth: GrowthIcon,
  resilience: ResilienceIcon,
  bloom: BloomIcon,
  harvest: HarvestIcon,
  star: StarIcon,
  renew: RenewIcon,
  shield: ShieldCheckIcon,
}

export function AboutIcon({ id, ...props }: { id: AboutIconId } & IconProps) {
  const Component = ABOUT_ICONS[id]
  return <Component {...props} />
}
