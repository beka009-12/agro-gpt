"use client"

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { CameraIcon, CheckIcon, PlusIcon, XIcon } from "@/src/components/ui/icons"
import { useI18n } from "@/src/i18n/client"
import {
  REVIEW_MAX_PHOTOS,
  REVIEW_PHOTO_TYPES,
  REVIEW_TEXT_MAX,
  REVIEW_TEXT_MIN,
  pickReviewPhotos,
  validateReviewForm,
} from "@/src/lib/review-schemas"

interface ReviewFormDialogProps {
  isAuthed: boolean
}

interface PhotoItem {
  id: string
  file: File
  url: string
}

interface ApiErrorBody {
  message?: string
}

// <dialog> открыт в top layer — общий Toaster страницы оказался бы под ним,
// поэтому у формы свой Toaster внутри диалога
const TOASTER_ID = "review-form"

function showError(message: string, id: string) {
  // один id на вид ошибки — повторные клики не плодят стопку одинаковых тостов
  toast.error(message, { id: `review-form-${id}`, toasterId: TOASTER_ID })
}

export function ReviewFormDialog({ isAuthed }: ReviewFormDialogProps) {
  const { dict } = useI18n()
  const t = dict.reviews
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState("")
  const [crop, setCrop] = useState("")
  const [place, setPlace] = useState("")
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [textInvalid, setTextInvalid] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

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
    setTextInvalid(false)
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  function pickFiles() {
    fileRef.current?.click()
  }

  function addPhotos(list: FileList | null) {
    if (!list) return
    const { accepted, error } = pickReviewPhotos(Array.from(list), photos.length)
    setPhotos((prev) => [
      ...prev,
      ...accepted.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })),
    ])
    if (error) showError(t.form.errors[error], error)
    if (fileRef.current) fileRef.current.value = ""
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      prev.filter((p) => p.id === id).forEach((p) => URL.revokeObjectURL(p.url))
      return prev.filter((p) => p.id !== id)
    })
  }

  function changeText(value: string) {
    setText(value)
    // подсветку снимаем, как только текст стал допустимым
    if (textInvalid && value.trim().length >= REVIEW_TEXT_MIN) setTextInvalid(false)
  }

  function dragOver(event: DragEvent) {
    event.preventDefault()
    setDragging(true)
  }

  function drop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    addPhotos(event.dataTransfer.files)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalid = validateReviewForm({ text, photos: photos.map((p) => p.file) })
    if (invalid === "textLength") {
      setTextInvalid(true)
      showError(t.form.errors.textLength, invalid)
      textRef.current?.focus()
      return
    }
    if (invalid) {
      showError(t.form.errors[invalid], invalid)
      return
    }

    setLoading(true)
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
        showError(data?.message ?? dict.auth.errors.unavailable, "server")
        return
      }
      setText("")
      setCrop("")
      setPlace("")
      photos.forEach((p) => URL.revokeObjectURL(p.url))
      setPhotos([])
      setSent(true)
    } catch (error) {
      console.error("[reviews] submit failed:", error)
      showError(dict.auth.errors.network, "network")
    } finally {
      setLoading(false)
    }
  }

  const optional = (
    <span className="font-normal text-fg-faint"> · {t.form.optional}</span>
  )
  const dropHandlers = {
    onDragOver: dragOver,
    onDragLeave: () => setDragging(false),
    onDrop: drop,
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
        className="review-form-dialog m-0 mt-auto max-h-[92dvh] w-full max-w-none flex-col overflow-hidden rounded-b-none rounded-t-[20px] border border-edge bg-card p-0 text-fg open:flex sm:m-auto sm:max-h-[90dvh] sm:w-[min(92vw,560px)] sm:rounded-[20px]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-edge py-4 pl-5 pr-3 sm:pl-6">
          <div className="min-w-0 pt-1">
            <h2 id="review-form-title" className="font-display text-xl font-semibold leading-7">
              {t.form.title}
            </h2>
            {sent ? null : (
              <p className="mt-1 text-sm leading-5 text-fg-muted">{t.form.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t.form.close}
            className="grid size-11 shrink-0 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
          >
            <XIcon size={20} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent-strong">
              <CheckIcon size={28} weight="bold" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">{t.form.successTitle}</h3>
            <p role="status" className="mt-2 max-w-sm text-[15px] leading-6 text-fg-muted">
              {t.form.success}
            </p>
            <Button type="button" onClick={close} className="mt-7 min-h-12 w-full sm:w-auto sm:px-10">
              {t.form.successClose}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="review-text" className="text-sm font-medium">
                  {t.form.text}
                </label>
                <textarea
                  ref={textRef}
                  id="review-text"
                  value={text}
                  onChange={(e) => changeText(e.target.value)}
                  rows={4}
                  enterKeyHint="enter"
                  maxLength={REVIEW_TEXT_MAX}
                  placeholder={t.form.textPlaceholder}
                  aria-invalid={textInvalid || undefined}
                  aria-describedby="review-text-hint"
                  className={`field-sizing-content max-h-[40dvh] min-h-24 resize-none sm:min-h-28 rounded-xl border bg-card px-4 py-3 text-base leading-6 outline-none transition-colors placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25 ${
                    textInvalid
                      ? "border-danger/60 focus:border-danger/60 focus:ring-danger/15"
                      : "border-edge"
                  }`}
                />
                <div id="review-text-hint" className="flex items-start justify-between gap-3 text-[13px] leading-5">
                  <p className="text-fg-muted">{t.form.textHint}</p>
                  <span aria-hidden className="shrink-0 tabular-nums text-fg-faint">
                    {text.length} / {REVIEW_TEXT_MAX}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="review-crop"
                  label={<>{t.form.crop}{optional}</>}
                  placeholder={t.form.cropPlaceholder}
                  value={crop}
                  maxLength={100}
                  onChange={(e) => setCrop(e.target.value)}
                />
                <Input
                  id="review-place"
                  label={<>{t.form.place}{optional}</>}
                  placeholder={t.form.placePlaceholder}
                  value={place}
                  maxLength={200}
                  onChange={(e) => setPlace(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">
                    {t.form.photos}
                    {optional}
                  </span>
                  {photos.length > 0 ? (
                    <span className="text-xs tabular-nums text-fg-faint">
                      {photos.length} / {REVIEW_MAX_PHOTOS}
                    </span>
                  ) : null}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={REVIEW_PHOTO_TYPES.join(",")}
                  multiple
                  hidden
                  onChange={(e) => addPhotos(e.target.files)}
                />

                {photos.length === 0 ? (
                  <button
                    type="button"
                    onClick={pickFiles}
                    {...dropHandlers}
                    className={`flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
                      dragging
                        ? "border-accent bg-accent-soft"
                        : "border-edge hover:border-accent/50 hover:bg-surface-muted"
                    }`}
                  >
                    <span className="mb-1 grid size-10 place-items-center rounded-full bg-accent-soft text-accent-strong">
                      <CameraIcon size={20} />
                    </span>
                    <span className="text-sm font-semibold text-fg">
                      {t.form.addPhotos}
                      <span className="hidden font-normal text-fg-muted sm:inline"> {t.form.dropHint}</span>
                    </span>
                    <span className="text-xs text-fg-muted">{t.form.photosHint}</span>
                  </button>
                ) : (
                  <div
                    {...dropHandlers}
                    className={`rounded-xl transition-shadow ${dragging ? "ring-2 ring-accent ring-offset-4" : ""}`}
                  >
                    <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {photos.map((photo) => (
                        <li key={photo.id} className="relative aspect-square">
                          {/* локальное превью (blob:) — next/image не подходит */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={t.photoAlt}
                            className="size-full rounded-xl border border-edge/60 object-cover"
                          />
                          <button
                            type="button"
                            aria-label={t.form.removePhoto}
                            onClick={() => removePhoto(photo.id)}
                            className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors before:absolute before:-inset-2 before:content-[''] hover:bg-black/75"
                          >
                            <XIcon size={14} />
                          </button>
                        </li>
                      ))}
                      {photos.length < REVIEW_MAX_PHOTOS ? (
                        <li className="aspect-square">
                          <button
                            type="button"
                            onClick={pickFiles}
                            aria-label={t.form.addPhotos}
                            className="grid size-full place-items-center rounded-xl border-2 border-dashed border-edge text-fg-muted transition-colors hover:border-accent/50 hover:text-accent-strong"
                          >
                            <PlusIcon size={22} />
                          </button>
                        </li>
                      ) : null}
                    </ul>
                    <p className="mt-2 text-xs text-fg-muted">{t.form.photosHint}</p>
                  </div>
                )}

              </div>
            </div>

            <div className="shrink-0 border-t border-edge bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
              <div className="flex gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={close}
                  className="min-h-12 sm:min-h-0"
                >
                  {t.form.cancel}
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="min-h-12 flex-1 sm:min-h-0 sm:flex-none sm:px-7"
                >
                  {t.form.submit}
                </Button>
              </div>
            </div>
          </form>
        )}
        <Toaster toasterId={TOASTER_ID} position="top-center" />
      </dialog>
    </>
  )
}
