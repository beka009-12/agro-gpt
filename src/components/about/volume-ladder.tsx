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
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-5 sm:gap-x-6 sm:gap-y-3">
        {volumes.map((volume) => (
          <li key={volume} className="border-t border-white/20 pt-3">
            <strong className="whitespace-nowrap font-mono text-[15px] font-medium text-white sm:text-base">
              {volume}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
