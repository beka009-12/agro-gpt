interface VolumeLadderProps {
  title: string
  sizes: string[]
  bulk: string
}

export function VolumeLadder({ title, sizes, bulk }: VolumeLadderProps) {
  const volumes = [...sizes, bulk]

  return (
    <div>
      <h3 className="text-sm font-semibold text-white/70">{title}</h3>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-5">
        {volumes.map((volume) => (
          <li key={volume} className="border-t border-white/20 pt-3">
            <strong className="font-mono text-base font-medium text-white">
              {volume}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
