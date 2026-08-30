interface DialogFocusTargetOptions {
  activeIndex: number
  focusableCount: number
  shiftKey: boolean
}

export function shouldCloseDiseaseDialog(key: string): boolean {
  return key === "Escape"
}

export function getDialogFocusTarget({
  activeIndex,
  focusableCount,
  shiftKey,
}: DialogFocusTargetOptions): number | null {
  if (focusableCount === 0) return null
  if (shiftKey && activeIndex === 0) return focusableCount - 1
  if (!shiftKey && activeIndex === focusableCount - 1) return 0
  return null
}
