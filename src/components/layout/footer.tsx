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

  return (
    <footer className="border-t border-edge bg-white pb-8 pt-12">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <span className="flex items-center gap-2">
              <LogoMark size={26} />
              <span className="font-display text-lg font-semibold tracking-[-0.02em] text-fg">
                ibo
              </span>
            </span>
            <p className="mt-4 max-w-[280px] text-sm leading-6 text-fg-muted">
              {ru.footer.tagline}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-9 place-items-center rounded-control border border-edge text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                <InstagramLogoIcon size={18} />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid size-9 place-items-center rounded-control border border-edge text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                <WhatsappLogoIcon size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-fg">{ru.footer.navTitle}</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-fg-muted transition-colors hover:text-accent"
                >
                  {ru.footer.aboutLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-sm text-fg-muted transition-colors hover:text-accent"
                >
                  {ru.header.startChat}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-fg">{ru.footer.contactTitle}</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm text-fg-muted">
                <MapPinIcon size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{ru.footer.address}</span>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2.5 text-sm text-fg-muted transition-colors hover:text-accent"
                >
                  <EnvelopeSimpleIcon size={16} className="shrink-0 text-accent" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE_HREF}`}
                  className="flex items-center gap-2.5 text-sm text-fg-muted transition-colors hover:text-accent"
                >
                  <PhoneIcon size={16} className="shrink-0 text-accent" />
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-edge pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-fg-faint">{ru.footer.copyright}</span>
          <span className="text-[13px] font-semibold text-fg-faint">
            {ru.footer.support}
          </span>
        </div>
      </div>
    </footer>
  )
}
