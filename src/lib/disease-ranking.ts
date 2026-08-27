import { z } from "zod"
import type { TopDiseaseSchema } from "@/src/api/generated/models"

export interface NormalizedTopDisease {
  diseaseName: string
  count: number
  isFallback: boolean
}

const CONFIRMED_DISEASE_NAMES: Readonly<Record<string, readonly string[]>> = {
  "фитофтороз": ["Фитофтороз"],
  "грушевая медяница": ["Грушевая медяница"],
  "грушевая медяница (листоблошка)": ["Грушевая медяница"],
  "септориоз": ["Септориоз"],
  "альтернариоз": ["Альтернариоз"],
  "фитофтороз, альтернариоз": ["Фитофтороз", "Альтернариоз"],
}

const CONFIRMED_NON_DISEASE_NAMES = new Set([
  "дефицит азота",
  "грибковое поражение",
  "пожелтение листьев",
])

const topDiseaseApiItemSchema: z.ZodType<TopDiseaseSchema> = z.object({
  disease_name: z.string().trim().min(1),
  count: z.number().int().nonnegative(),
  is_fallback: z.boolean(),
})

export const topDiseasesResponseSchema = z.array(topDiseaseApiItemSchema)

function cleanDiseaseName(name: string): string {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ")
}

function getDiseaseNames(name: string): readonly string[] {
  const cleanName = cleanDiseaseName(name)
  const lookupName = cleanName.toLocaleLowerCase("ru-RU")

  if (CONFIRMED_NON_DISEASE_NAMES.has(lookupName)) return []

  return CONFIRMED_DISEASE_NAMES[lookupName] ?? [cleanName]
}

export function normalizeTopDiseases(
  items: readonly TopDiseaseSchema[]
): NormalizedTopDisease[] {
  const diseases = items.reduce<Record<string, NormalizedTopDisease>>(
    (result, item) => {
      return getDiseaseNames(item.disease_name).reduce<
        Record<string, NormalizedTopDisease>
      >((currentResult, diseaseName) => {
        const currentDisease = currentResult[diseaseName]

        return {
          ...currentResult,
          [diseaseName]: {
            diseaseName,
            count: (currentDisease?.count ?? 0) + item.count,
            isFallback:
              (currentDisease?.isFallback ?? true) && item.is_fallback,
          },
        }
      }, result)
    },
    {}
  )

  return Object.values(diseases).sort((left, right) => right.count - left.count)
}
