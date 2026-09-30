"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PlusIcon, XIcon } from "@/src/components/ui/icons"
import { useI18n } from "@/src/i18n/client"
import {
  REVIEW_MAX_PHOTOS,
  REVIEW_TEXT_MAX,
  validateReviewForm,
} from "@/src/lib/review-schemas"

interface ReviewFormDialogProps {
  isAuthed: boolean
  onCreated?: () => void
}

interface PhotoItem {
  id: string
  file: File
  url: string
}

interface ApiErrorBody {
  message?: string
}

export function ReviewFormDialog({ isAuthed, onCreated }: ReviewFormDialogProps) {
  const { dict } = useI18n()
  const t = dict.reviews
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [crop, setCrop] = useState("")
  const [place, setPlace] = useState("")
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  // превью — object URL, освобождаем при размонтировании
  const photosRef = useRef<PhotoItem[]>([])
  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(
    () => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)),
    []
  )

  function open() {
    if (!isAuthed) {
      router.push("/login")
      return
    }
    setSent(false)
    setError(null)
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  function addPhotos(list: FileList | null) {
    if (!list) return
    const added = Array.from(list).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }))
    const room = REVIEW_MAX_PHOTOS - photos.length
    added.slice(room).forEach((p) => URL.revokeObjectURL(p.url))
    if (added.length > room) setError(t.form.errors.tooManyPhotos)
    setPhotos((prev) => [...prev, ...added.slice(0, room)])
    if (fileRef.current) fileRef.current.value = ""
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      prev.filter((p) => p.id === id).forEach((p) => URL.revokeObjectURL(p.url))
      return prev.filter((p) => p.id !== id)
    })
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalid = validateReviewForm({ text, photos: photos.map((p) => p.file) })
    if (invalid) {
      setError(t.form.errors[invalid])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const body = new FormData()
      body.set("text", text.trim())
      if (crop.trim()) body.set("crop", crop.trim())
      if (place.trim()) body.set("place", place.trim())
      for (const photo of photos) body.append("photos", photo.file)

      const res = await fetch("/api/reviews", { method: "POST", body })
      if (res.status === 401) {
        router.push("/login")
        return
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiErrorBody | null
        setError(data?.message ?? dict.auth.errors.unavailable)
        return
      }
      setText("")
      setCrop("")
      setPlace("")
      photos.forEach((p) => URL.revokeObjectURL(p.url))
      setPhotos([])
      setSent(true)
      onCreated?.()
    } catch {
      setError(dict.auth.errors.network)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button type="button" onClick={open}>
        <PlusIcon size={18} />
        {t.write}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="review-form-title"
        className="m-0 mt-auto max-h-[92dvh] w-full max-w-none flex-col overflow-hidden rounded-b-none rounded-t-card border border-edge bg-card p-0 text-fg open:flex backdrop:bg-black/50 sm:m-auto sm:max-h-[90dvh] sm:w-[min(92vw,560px)] sm:rounded-card"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-edge py-2 pl-5 pr-2 sm:pl-6">
          <h2 id="review-form-title" className="font-display text-xl font-semibold">
            {t.form.title}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t.form.close}
            className="grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:bg-mint-soft"
          >
            <XIcon size={20} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-stretch gap-5 px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-start sm:px-6">
            <p role="status" className="text-base leading-7">
              {t.form.success}
            </p>
            <Button type="button" onClick={close} className="min-h-12 sm:min-h-0">
              {t.form.successClose}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="review-text" className="text-sm font-medium">
                {t.form.text}
              </label>
              <textarea
                id="review-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                enterKeyHint="enter"
                maxLength={REVIEW_TEXT_MAX}
                required
                className="min-h-32 resize-y rounded-xl border border-edge bg-card px-4 py-3 text-base outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
              <p className="text-[13px] text-fg-muted">{t.form.textHint}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
              <Input
                id="review-crop"
                label={t.form.crop}
                placeholder={t.form.cropPlaceholder}
                value={crop}
                maxLength={100}
                onChange={(e) => setCrop(e.target.value)}
              />
              <Input
                id="review-place"
                label={t.form.place}
                placeholder={t.form.placePlaceholder}
                value={place}
                maxLength={200}
                onChange={(e) => setPlace(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t.form.photos}</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(e) => addPhotos(e.target.files)}
              />
              {photos.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {photos.map((photo) => (
                    <li key={photo.id} className="relative">
                      {/* локальное превью (blob:) — next/image не подходит */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={t.photoAlt}
                        className="size-20 rounded-xl border border-edge/60 object-cover"
                      />
                      <button
                        type="button"
                        aria-label={t.form.removePhoto}
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full border border-edge bg-white text-fg shadow-sm transition-colors hover:bg-mint-soft"
                      >
                        <XIcon size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {photos.length < REVIEW_MAX_PHOTOS ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-dashed border-edge px-5 text-sm font-semibold text-fg-muted transition-colors hover:bg-mint-soft"
                >
                  <PlusIcon size={16} />
                  {t.form.addPhotos}
                </button>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-edge bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                className="min-h-12 sm:min-h-0"
              >
                {t.form.cancel}
              </Button>
              <Button type="submit" loading={loading} className="min-h-12 sm:min-h-0">
                {t.form.submit}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
