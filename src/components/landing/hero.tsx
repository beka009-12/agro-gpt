import Link from "next/link";
import { getDict } from "@/src/i18n/server";
import { ChevronRightIcon } from "@/src/components/ui/icons";
import { DiagnosisCard } from "./diagnosis-card";
import { RevealGroup, RevealItem } from "./reveal";

export async function Hero() {
  const ru = await getDict();

  return (
    <section className="overflow-hidden bg-white">
      <RevealGroup
        trigger="load"
        className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-[1fr_0.9fr] md:gap-8 md:px-8 md:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-16"
      >
        <div className="min-w-0 max-w-[720px]">
          <RevealItem>
            <p className="mb-4 text-sm font-semibold text-accent">
              {ru.hero.badge}
            </p>
          </RevealItem>
          <RevealItem>
            <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] text-fg sm:text-[42px] md:text-[38px] lg:text-[56px]">
              {ru.hero.titleStart}
              <span className="text-accent">{ru.hero.titleAccent}</span>
            </h1>
          </RevealItem>
          <RevealItem>
            <p className="mt-5 max-w-[620px] text-base leading-[1.65] text-fg-muted sm:text-lg md:text-base lg:text-lg">
              {ru.hero.subtitle}
            </p>
          </RevealItem>
          <RevealItem className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/chat"
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-accent-strong active:translate-y-px"
            >
              {ru.hero.ctaChat}
              <ChevronRightIcon size={17} />
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control border border-edge bg-white px-6 py-3 text-[15px] font-semibold text-fg transition-[border-color,background-color,transform] duration-200 hover:border-accent hover:bg-accent-soft active:translate-y-px"
            >
              {ru.hero.ctaAbout}
            </Link>
          </RevealItem>
        </div>

        <RevealItem className="min-w-0 w-full max-w-[560px] justify-self-center md:justify-self-stretch lg:justify-self-end">
          <DiagnosisCard
            label={ru.hero.visual.label}
            status={ru.hero.visual.status}
            cases={ru.hero.visual.cases}
          />
        </RevealItem>
      </RevealGroup>

      <div className="border-y border-edge">
        <ul className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {ru.hero.trust.map((item) => (
            <li
              key={item}
              className="flex min-h-12 items-center justify-center gap-2 border-b border-edge px-5 py-3 text-center text-sm font-medium text-fg-muted transition-colors duration-200 last:border-b-0 hover:bg-accent-soft hover:text-accent-strong sm:min-h-14 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
