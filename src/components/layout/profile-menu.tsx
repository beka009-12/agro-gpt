"use client"

import { useRouter } from "next/navigation"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import {
  makeProfileFormSchema,
  type ProfileFormValues,
  type UserProfile,
} from "@/src/lib/profile-schemas"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ChevronRightIcon, MapPinIcon } from "@/src/components/ui/icons"

/** Загружает профиль один раз; null — гость либо сессия истекла. */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch("/api/profile")
        if (!res.ok) return
        const data = (await res.json()) as UserProfile
        if (alive) setProfile(data)
      } catch {
        // гость или сеть — аватар просто не показываем
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  return { profile, setProfile }
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

interface ErrorBody {
  message: string
  errors?: Record<string, string>
}

async function readErrorBody(res: Response, fallback: string): Promise<ErrorBody> {
  const data: unknown = await res.json().catch(() => null)
  if (data !== null && typeof data === "object" && "message" in data) {
    const message = typeof data.message === "string" ? data.message : fallback
    const errors =
      "errors" in data && data.errors !== null && typeof data.errors === "object"
        ? (data.errors as Record<string, string>)
        : undefined
    return { message, errors }
  }
  return { message: fallback }
}

const noopSubscribe = () => () => {}

function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    full_name: profile.full_name,
    email: profile.email ?? "",
  }
}

interface ProfileMenuProps {
  profile: UserProfile
  onProfileChange: (profile: UserProfile | null) => void
  /** compact — аватар для десктоп-хедера; row — карточка для бургер-меню */
  variant?: "compact" | "row"
  /** вызывается после сохранения или выхода (например, закрыть бургер-меню) */
  onDone?: () => void
}

export function ProfileMenu({
  profile,
  onProfileChange,
  variant = "compact",
  onDone,
}: ProfileMenuProps) {
  const router = useRouter()
  const { dict } = useI18n()
  const p = dict.profile
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [locError, setLocError] = useState<string | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const mounted = useMounted()
  const sheetRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const profileFormSchema = useMemo(() => makeProfileFormSchema(dict), [dict])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toFormValues(profile),
  })

  // бургер-меню нельзя закрывать при открытии шторки: ProfileMenu живёт
  // внутри него и размонтировался бы вместе со шторкой
  const openSheet = () => {
    reset(toFormValues(profile))
    setServerError(null)
    setLocError(null)
    setOpen(true)
  }

  // Escape + фокус-ловушка + скролл-лок, пока шторка открыта
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "Tab") {
        const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
          "button, input, [href]"
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)
    sheetRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const { message, errors: fieldErrors } = await readErrorBody(
          res,
          dict.auth.errors.unavailable
        )
        if (res.status === 401) {
          setOpen(false)
          onProfileChange(null)
          toast.error(dict.auth.errors.unauthorized)
          router.refresh()
          return
        }
        let matched = false
        for (const [field, fieldMessage] of Object.entries(fieldErrors ?? {})) {
          if (field in values) {
            setError(field as keyof ProfileFormValues, { message: fieldMessage })
            matched = true
          }
        }
        setServerError(matched ? null : message)
        return
      }
      const updated = (await res.json()) as UserProfile
      onProfileChange(updated)
      toast.success(p.saved)
      setOpen(false)
      onDone?.()
    } catch {
      toast.error(dict.auth.errors.network)
    }
  })

  const detectLocation = () => {
    if (detecting) return
    if (!("geolocation" in navigator)) {
      setLocError(p.location.unsupported)
      return
    }
    setDetecting(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const res = await fetch("/api/profile/location", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            })
            if (!res.ok) {
              const { message } = await readErrorBody(
                res,
                dict.auth.errors.unavailable
              )
              setLocError(message)
              return
            }
            const updated = (await res.json()) as UserProfile
            onProfileChange(updated)
            toast.success(p.location.saved)
          } catch {
            setLocError(dict.auth.errors.network)
          } finally {
            setDetecting(false)
          }
        })()
      },
      (error) => {
        setDetecting(false)
        setLocError(
          error.code === error.PERMISSION_DENIED
            ? p.location.denied
            : p.location.failed
        )
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    )
  }

  const onLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("[profile:logout]", error)
    }
    setOpen(false)
    onDone?.()
    onProfileChange(null)
    router.refresh()
  }

  const hasLocation =
    profile.location_available ||
    (profile.latitude !== null && profile.longitude !== null)
  const initials = initialsOf(profile.full_name)

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={openSheet}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={p.open}
          className="grid size-9 place-items-center rounded-full bg-deep text-[12px] font-extrabold tracking-wide text-lime transition-opacity hover:opacity-85"
        >
          {initials}
        </button>
      ) : (
        <button
          type="button"
          onClick={openSheet}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-header-mint-soft"
        >
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-full bg-deep text-[13px] font-extrabold tracking-wide text-lime"
          >
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[15px] font-bold text-header-fg">
              {profile.full_name}
            </strong>
            <small className="block truncate text-[12px] text-header-fg-muted">
              {profile.email || p.menuHint}
            </small>
          </span>
          <ChevronRightIcon size={16} className="shrink-0 text-fg-faint" />
        </button>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                key="profile-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.fast }}
                className="fixed inset-0 z-[70] flex items-end justify-center"
              >
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
                />
                <motion.div
                  ref={sheetRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={p.title}
                  tabIndex={-1}
                  initial={reduced ? { opacity: 0 } : { y: "100%" }}
                  animate={reduced ? { opacity: 1 } : { y: 0 }}
                  exit={reduced ? { opacity: 0 } : { y: "100%" }}
                  transition={{ duration: DURATION.base * 0.7, ease: EASE_OUT }}
                  className="relative max-h-[calc(100dvh-16px)] w-full max-w-md overflow-y-auto rounded-t-[26px] border border-edge bg-card px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_55px_rgba(6,78,59,0.18)] outline-none sm:mb-6 sm:rounded-[26px] sm:pb-5"
                >
                  <span
                    aria-hidden
                    className="mx-auto block h-1 w-10 rounded-full bg-edge"
                  />
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 place-items-center rounded-full bg-deep text-[12px] font-extrabold tracking-wide text-lime"
                    >
                      {initials}
                    </span>
                    <p className="text-[17px] font-extrabold text-fg">{p.title}</p>
                  </div>

                  <form
                    onSubmit={onSubmit}
                    noValidate
                    className="mt-4 flex flex-col gap-3"
                  >
                    <Input
                      id="profile_full_name"
                      label={dict.auth.register.nameLabel}
                      autoComplete="name"
                      error={errors.full_name?.message}
                      {...register("full_name")}
                    />
                    <Input
                      id="profile_email"
                      type="email"
                      label={dict.auth.register.emailLabel}
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register("email")}
                    />
                    <div className="rounded-2xl border border-edge bg-bg p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-extrabold text-fg">
                          <MapPinIcon size={16} className="text-accent" />
                          {p.location.title}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                            hasLocation
                              ? "bg-mint-soft text-accent-strong"
                              : "bg-tan-soft text-[#4a4633]"
                          }`}
                        >
                          {hasLocation ? p.location.on : p.location.off}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
                        {p.location.hint}
                      </p>
                      {profile.latitude !== null && profile.longitude !== null && (
                        <p className="mt-2 text-xs font-bold tabular-nums text-fg">
                          {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={detecting}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-mint bg-mint-soft px-4 py-2.5 text-sm font-bold text-accent-strong transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {detecting && (
                          <span
                            aria-hidden
                            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                          />
                        )}
                        {detecting ? p.location.detecting : p.location.detect}
                      </button>
                      {locError && (
                        <p className="mt-2 text-xs text-danger" role="alert">
                          {locError}
                        </p>
                      )}
                    </div>

                    {serverError && (
                      <p
                        className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
                        role="alert"
                      >
                        {serverError}
                      </p>
                    )}

                    <Button type="submit" loading={isSubmitting}>
                      {p.save}
                    </Button>
                  </form>

                  <div className="mt-4 border-t border-edge pt-3">
                    <button
                      type="button"
                      onClick={onLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-danger transition-colors hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loggingOut && (
                        <span
                          aria-hidden
                          className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
                        />
                      )}
                      {p.logout}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
