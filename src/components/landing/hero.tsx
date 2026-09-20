import Link from "next/link";
import { getDict } from "@/src/i18n/server";
import { CheckIcon, ChevronRightIcon } from "@/src/components/ui/icons";
import { DiagnosisCard } from "./diagnosis-card";

export async function Hero() {
  const ru = await getDict();

  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 lg:min-h-[640px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:py-12">
        <div className="min-w-0 max-w-[720px]">
          <p className="mb-6 text-sm font-semibold text-accent">
            {ru.hero.badge}
          </p>
          <h1 className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.05em] text-fg sm:text-[54px] lg:text-[58px]">
            {ru.hero.titleStart}
            <span className="text-accent">{ru.hero.titleAccent}</span>
          </h1>
          <p className="mt-7 max-w-[620px] text-lg leading-[1.65] text-fg-muted">
            {ru.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
          </div>
        </div>

        <div className="min-w-0 w-full max-w-[560px] justify-self-center lg:justify-self-end">
          <DiagnosisCard
            label={ru.hero.visual.label}
            status={ru.hero.visual.status}
            cases={ru.hero.visual.cases}
          />
        </div>
      </div>

      <div className="border-y border-edge">
        <ul className="grid gap-0 sm:grid-cols-3">
          {ru.hero.trust.map((item) => (
            <li
              key={item}
              className="group flex min-h-16 items-center justify-center gap-2 border-b border-edge px-5 py-5 text-center text-sm font-medium text-fg-muted transition-colors duration-200 last:border-b-0 hover:bg-accent-soft hover:text-accent-strong sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
