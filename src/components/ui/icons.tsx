import type { ReactElement } from "react"
import type {
  Icon as PhosphorIcon,
  IconProps as PhosphorIconProps,
} from "@phosphor-icons/react"
import {
  ArrowLeftIcon as PhosphorArrowLeftIcon,
  ArrowUpIcon as PhosphorArrowUpIcon,
  ArrowsClockwiseIcon as PhosphorArrowsClockwiseIcon,
  CameraIcon as PhosphorCameraIcon,
  CaretDownIcon as PhosphorCaretDownIcon,
  CaretRightIcon as PhosphorCaretRightIcon,
  CheckIcon as PhosphorCheckIcon,
  ClipboardTextIcon as PhosphorClipboardTextIcon,
  CloudIcon as PhosphorCloudIcon,
  EyeIcon as PhosphorEyeIcon,
  EyeSlashIcon as PhosphorEyeSlashIcon,
  FarmIcon as PhosphorFarmIcon,
  FlaskIcon as PhosphorFlaskIcon,
  FlowerIcon as PhosphorFlowerIcon,
  GlobeIcon as PhosphorGlobeIcon,
  HouseIcon as PhosphorHouseIcon,
  LeafIcon as PhosphorLeafIcon,
  ListIcon as PhosphorListIcon,
  MapPinIcon as PhosphorMapPinIcon,
  PaperclipIcon as PhosphorPaperclipIcon,
  PaperPlaneTiltIcon as PhosphorPaperPlaneTiltIcon,
  PlantIcon as PhosphorPlantIcon,
  PlusIcon as PhosphorPlusIcon,
  ShieldCheckIcon as PhosphorShieldCheckIcon,
  StarIcon as PhosphorStarIcon,
  ThermometerIcon as PhosphorThermometerIcon,
  TreeStructureIcon as PhosphorTreeStructureIcon,
  TrendUpIcon as PhosphorTrendUpIcon,
  UserFocusIcon as PhosphorUserFocusIcon,
  WarningIcon as PhosphorWarningIcon,
  XIcon as PhosphorXIcon,
} from "@phosphor-icons/react/dist/ssr"

export type IconProps = PhosphorIconProps
export const ICON_WEIGHT: NonNullable<IconProps["weight"]> = "regular"

type AppIcon = (props: IconProps) => ReactElement

function createIcon(Icon: PhosphorIcon): AppIcon {
  return function AppIcon({ size = 24, weight = ICON_WEIGHT, ...props }) {
    const ariaHidden =
      props["aria-hidden"] ?? (props.alt || props["aria-label"] ? undefined : true)

    return (
      <Icon
        {...props}
        aria-hidden={ariaHidden}
        size={size}
        weight={weight}
      />
    )
  }
}

export const MenuIcon = createIcon(PhosphorListIcon)
export const CameraIcon = createIcon(PhosphorCameraIcon)
export const SproutIcon = createIcon(PhosphorPlantIcon)
export const PaperclipIcon = createIcon(PhosphorPaperclipIcon)
export const ArrowLeftIcon = createIcon(PhosphorArrowLeftIcon)
export const ArrowUpIcon = createIcon(PhosphorArrowUpIcon)
export const CheckIcon = createIcon(PhosphorCheckIcon)
export const ChevronDownIcon = createIcon(PhosphorCaretDownIcon)
export const HomeIcon = createIcon(PhosphorHouseIcon)
export const GlobeIcon = createIcon(PhosphorGlobeIcon)
export const LeafIcon = createIcon(PhosphorLeafIcon)
export const BloomIcon = createIcon(PhosphorFlowerIcon)
export const ShieldCheckIcon = createIcon(PhosphorShieldCheckIcon)
export const PlantIcon = createIcon(PhosphorPlantIcon)
export const CloudIcon = createIcon(PhosphorCloudIcon)
export const SendIcon = createIcon(PhosphorPaperPlaneTiltIcon)
export const MapPinIcon = createIcon(PhosphorMapPinIcon)
export const ChevronRightIcon = createIcon(PhosphorCaretRightIcon)
export const PlusIcon = createIcon(PhosphorPlusIcon)
export const EyeIcon = createIcon(PhosphorEyeIcon)
export const EyeOffIcon = createIcon(PhosphorEyeSlashIcon)
export const AlertTriangleIcon = createIcon(PhosphorWarningIcon)
export const XIcon = createIcon(PhosphorXIcon)

export type AudienceIconId = "farmer" | "agronomist" | "gardener"

const AUDIENCE_ICONS: Record<AudienceIconId, AppIcon> = {
  farmer: createIcon(PhosphorFarmIcon),
  agronomist: createIcon(PhosphorUserFocusIcon),
  gardener: PlantIcon,
}

export function AudienceIcon({
  id,
  ...props
}: { id: AudienceIconId } & IconProps) {
  const Icon = AUDIENCE_ICONS[id]
  return <Icon {...props} />
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

const ABOUT_ICONS: Record<AboutIconId, AppIcon> = {
  flask: createIcon(PhosphorFlaskIcon),
  consult: createIcon(PhosphorUserFocusIcon),
  scheme: createIcon(PhosphorClipboardTextIcon),
  globe: GlobeIcon,
  leaf: LeafIcon,
  roots: createIcon(PhosphorTreeStructureIcon),
  growth: createIcon(PhosphorTrendUpIcon),
  resilience: createIcon(PhosphorThermometerIcon),
  bloom: BloomIcon,
  harvest: createIcon(PhosphorFarmIcon),
  star: createIcon(PhosphorStarIcon),
  renew: createIcon(PhosphorArrowsClockwiseIcon),
  shield: ShieldCheckIcon,
}

export function AboutIcon({ id, ...props }: { id: AboutIconId } & IconProps) {
  const Icon = ABOUT_ICONS[id]
  return <Icon {...props} />
}
