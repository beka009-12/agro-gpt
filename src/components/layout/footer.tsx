import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import {
  EnvelopeSimpleIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@/src/components/ui/icons"
import { LogoMark } from "./logo"

const PHONE_DISPLAY = "+996 990 33 55 55"
const PHONE_HREF = "+996990335555"
const EMAIL = "agro.ibo.official@gmail.com"
const INSTAGRAM_URL = "https://www.instagram.com/agro.ibo.official/"
const WHATSAPP_URL = "https://wa.me/996990335555"

export async function Footer() {
  const ru = await getDict()

  const navLinks = [
    { href: "/about", label: ru.footer.aboutLink },
    { href: "/reviews", label: ru.reviews.pageTitle },
    { href: "/chat", label: ru.header.startChat },
  ]
  const linkClass =
    "inline-flex min-h-11 items-center text-sm text-fg-muted transition-colors hover:text-accent"
  const contactClass =
    "flex min-h-11 items-center gap-2.5 text-sm text-fg-muted transition-colors hover:text-accent"
  const socialClass =
    "grid size-11 place-items-center rounded-control border border-edge bg-white text-fg-muted transition-colors hover:border-accent hover:text-accent"

  return (
    <footer className="border-t border-edge bg-tan-soft">
      <div className="mx-auto max-w-7xl px-5 pb-4 pt-10 md:px-8 md:pt-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr] lg:gap-12">
          <div className="grid grid-cols-[1fr_auto] items-center gap-y-3 md:grid-cols-1 md:items-start md:gap-y-4">
            <span className="flex items-center gap-2">
              <LogoMark size={26} className="mix-blend-multiply" />
              <span className="font-display text-lg font-semibold tracking-[-0.02em] text-fg">
                ibo
              </span>
            </span>
            <p className="col-span-full max-w-[300px] text-sm leading-6 text-fg-muted md:order-2">
              {ru.footer.tagline}
            </p>
            <div className="col-start-2 row-start-1 flex items-center gap-2 md:order-3 md:col-start-auto md:row-start-auto md:mt-1">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={socialClass}
              >
                <InstagramLogoIcon size={18} />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className={socialClass}
              >
                <WhatsappLogoIcon size={18} />
              </a>
            </div>
          </div>

          <nav aria-label={ru.footer.navTitle}>
            <p className="text-sm font-semibold text-fg">{ru.footer.navTitle}</p>
            <ul className="mt-1 flex flex-wrap gap-x-6 md:flex-col md:gap-x-0">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold text-fg">{ru.footer.contactTitle}</p>
            <ul className="mt-1 md:grid md:grid-cols-2 md:gap-x-8 lg:grid-cols-1">
              <li className="flex items-start gap-2.5 py-3 text-sm leading-5 text-fg-muted md:col-span-2 lg:col-span-1">
                <MapPinIcon size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{ru.footer.address}</span>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className={contactClass}>
                  <EnvelopeSimpleIcon size={16} className="shrink-0 text-accent" />
                  <span className="min-w-0 break-all">{EMAIL}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE_HREF}`} className={contactClass}>
                  <PhoneIcon size={16} className="shrink-0 text-accent" />
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-edge pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-fg-muted">{ru.footer.copyright}</span>
          <a
            href={`mailto:${EMAIL}`}
            className="-mx-2 inline-flex min-h-11 items-center px-2 text-[13px] font-semibold text-fg-muted transition-colors hover:text-accent sm:mx-0 sm:px-0"
          >
            {ru.footer.support}
          </a>
        </div>
      </div>
    </footer>
  )
}
