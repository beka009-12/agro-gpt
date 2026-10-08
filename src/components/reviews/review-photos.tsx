"use client"

import Image from "next/image"
import { useState } from "react"
import { useI18n } from "@/src/i18n/client"
import { reviewPhotoTileCount } from "@/src/lib/review-photo-url"
import { ReviewPhotoViewer } from "./review-photo-viewer"

interface ReviewPhotosProps {
  photos: ReadonlyArray<{ id: string; url: string }>
}

export function ReviewPhotos({ photos }: ReviewPhotosProps) {
  const { dict } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { tiles, hidden } = reviewPhotoTileCount(photos.length)

  if (tiles === 0) return null

  return (
    <>
      {/* превью ужимаются в узкой карточке, чтобы реакции оставались в той же строке */}
      <ul className="flex gap-2">
        {photos.slice(0, tiles).map((photo, i) => (
          <li key={photo.id} className="min-w-0 shrink basis-[72px]">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={dict.reviews.openPhoto
                .replace("{current}", String(i + 1))
                .replace("{total}", String(photos.length))}
              className="review-photo-tile group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[10px] bg-surface-muted"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="72px"
                unoptimized={!photo.url.startsWith("/")}
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {hidden > 0 && i === tiles - 1 ? (
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-semibold text-white"
                >
                  +{hidden}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <ReviewPhotoViewer
        photos={photos}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  )
}
