import { z } from "zod"

export const REVIEW_TEXT_MIN = 10
export const REVIEW_TEXT_MAX = 2000
export const REVIEW_MAX_PHOTOS = 5
export const REVIEW_MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const REVIEW_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const reactionKindSchema = z.enum(["like", "dislike"])
export type ReactionKind = z.infer<typeof reactionKindSchema>
export type Reaction = ReactionKind | null

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"])

const reviewPhotoSchema = z.object({ id: z.uuid(), url: z.string() })

const reviewBase = {
  id: z.uuid(),
  author_name: z.string(),
  place: z.string().nullable(),
  crop: z.string().nullable(),
  text: z.string(),
  photos: z.array(reviewPhotoSchema),
  likes_count: z.number(),
  dislikes_count: z.number(),
  my_reaction: reactionKindSchema.nullable(),
  created_at: z.string(),
}

export const reviewSchema = z.object(reviewBase)
export type Review = z.infer<typeof reviewSchema>

export const myReviewSchema = z.object({
  ...reviewBase,
  status: reviewStatusSchema,
})
export type MyReview = z.infer<typeof myReviewSchema>

export const reviewReactionSchema = z.object({
  likes_count: z.number(),
  dislikes_count: z.number(),
  my_reaction: reactionKindSchema.nullable(),
})
export type ReviewReaction = z.infer<typeof reviewReactionSchema>

export const reactionBodySchema = z.object({
  reaction: reactionKindSchema.nullable(),
})

/** Какой реакция должна стать после нажатия: повторный клик снимает, другой — меняет. */
export function nextReaction(current: Reaction, clicked: ReactionKind): Reaction {
  return current === clicked ? null : clicked
}

/** Оптимистичный пересчёт счётчиков; счётчики не уходят ниже нуля. */
export function applyReaction(
  state: ReviewReaction,
  next: Reaction
): ReviewReaction {
  const prev = state.my_reaction
  if (prev === next) return state
  let likes = state.likes_count
  let dislikes = state.dislikes_count
  if (prev === "like") likes -= 1
  if (prev === "dislike") dislikes -= 1
  if (next === "like") likes += 1
  if (next === "dislike") dislikes += 1
  return {
    likes_count: Math.max(0, likes),
    dislikes_count: Math.max(0, dislikes),
    my_reaction: next,
  }
}

export type ReviewFormError =
  | "textLength"
  | "tooManyPhotos"
  | "photoType"
  | "photoSize"

export interface ReviewFormInput {
  text: string
  photos: ReadonlyArray<{ type: string; size: number }>
}

export function validateReviewForm(input: ReviewFormInput): ReviewFormError | null {
  const length = input.text.trim().length
  if (length < REVIEW_TEXT_MIN || length > REVIEW_TEXT_MAX) return "textLength"
  if (input.photos.length > REVIEW_MAX_PHOTOS) return "tooManyPhotos"
  for (const photo of input.photos) {
    if (!REVIEW_PHOTO_TYPES.includes(photo.type)) return "photoType"
    if (photo.size > REVIEW_MAX_PHOTO_BYTES) return "photoSize"
  }
  return null
}
