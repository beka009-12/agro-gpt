interface StepIndicatorProps {
  steps: readonly string[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="mb-2">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-fg-muted">
        {steps[current]} — {current + 1} / {steps.length}
      </p>
      <div className="flex gap-1.5">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              index <= current ? "bg-accent" : "bg-mint-soft"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
