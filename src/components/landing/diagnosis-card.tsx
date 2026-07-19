"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { ReactElement } from "react"
import {
  BloomIcon,
  LeafIcon,
  PlantIcon,
  SproutIcon,
  type IconProps,
} from "@/src/components/ui/icons"

interface DiagnosisCase {
  crop: string
  title: string
  note: string
}

interface DiagnosisCardProps {
  label: string
  status: string
  cases: DiagnosisCase[]
}

interface CaseVisual {
  Icon: (props: IconProps) => ReactElement
  photo: string
  ink: string
}

const CASE_VISUALS: CaseVisual[] = [
  {
    Icon: PlantIcon,
    photo: "/images/nitrogen-deficiency.webp",
    ink: "#1f9153",
  },
  {
    Icon: LeafIcon,
    photo: "/images/powdery-mildew.jpg",
    ink: "#167a41",
  },
  {
    Icon: SproutIcon,
    photo: "/images/leaf-rust.jpg",
    ink: "#8a6f2e",
  },
  {
    Icon: BloomIcon,
    photo: "/images/apple-scab.jpg",
    ink: "#5a7d3a",
  },
]

const ROTATE_MS = 4200

export function DiagnosisCard({ label, status, cases }: DiagnosisCardProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % cases.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [cases.length])

  return (
    <div className="w-full rounded-[30px] border border-edge bg-card p-4 shadow-[0_20px_50px_rgba(20,42,31,0.09)] sm:p-5">
      <div className="mb-4 flex items-center justify-between px-1">
        <span className="text-[13px] font-extrabold text-deep">{label}</span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {status}
        </span>
      </div>

      <div className="grid">
        {cases.map((item, i) => {
          const { Icon, photo, ink } = CASE_VISUALS[i % CASE_VISUALS.length]
          const isActive = i === active
          return (
            <div
              key={item.crop}
              className={`min-w-0 [grid-area:1/1] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                isActive
                  ? "opacity-100 translate-y-0"
                  : "pointer-events-none opacity-0 translate-y-1.5"
              }`}
            >
              <div className="relative h-[190px] overflow-hidden rounded-[20px] sm:h-[220px]">
                <Image
                  src={photo}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 480px, 100vw"
                  className="object-cover"
                  priority={i === 0}
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-extrabold text-deep backdrop-blur-sm">
                  {item.crop}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2.5 rounded-[18px] bg-bg p-3.5">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-card"
                  style={{ color: ink }}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <strong className="block text-[13.5px] leading-snug text-fg">
                    {item.title}
                  </strong>
                  <small className="block truncate text-[11.5px] text-fg-faint">
                    {item.crop} · {item.note}
                  </small>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex justify-start gap-1.5 pl-1.5 sm:justify-center sm:pl-0">
        {cases.map((item, i) => (
          <span
            key={item.crop}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? "w-5 bg-accent" : "w-1.5 bg-edge"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
