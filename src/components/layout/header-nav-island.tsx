"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import type { Dictionary } from "@/src/i18n/dictionaries";
import { SPRING_SNAPPY } from "@/src/lib/motion-tokens";

const NAV_ROUTES: ReadonlyArray<{
  href: string;
  key: keyof Dictionary["header"]["nav"];
}> = [
  { href: "/", key: "home" },
  { href: "/projects", key: "projects" },
  { href: "/team", key: "team" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/contacts", key: "contacts" },
];

/** центральный остров с ссылками — виден от lg и выше, скользящий индикатор активного пункта */
export function HeaderNavIsland() {
  const pathname = usePathname();
  const { dict } = useI18n();
  const reduced = useReducedMotion();

  return (
    <nav
      aria-label={dict.header.nav.home}
      className="hidden items-center gap-0.5 rounded-full border border-header-edge bg-white/90 p-1.5 shadow-[0_2px_10px_rgba(6,78,59,0.05)] backdrop-blur-sm lg:flex"
    >
      {NAV_ROUTES.map(({ href, key }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="relative rounded-full px-3.5 py-2 text-[13px] font-semibold text-header-fg-muted transition-colors hover:text-header-fg"
          >
            {active && (
              <motion.span
                layoutId="header-nav-active"
                transition={reduced ? { duration: 0 } : SPRING_SNAPPY}
                className="absolute inset-0 -z-10 rounded-full bg-header-mint-soft"
              />
            )}
            <span
              className={`relative ${active ? "text-header-accent-strong" : ""}`}
            >
              {dict.header.nav[key]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
