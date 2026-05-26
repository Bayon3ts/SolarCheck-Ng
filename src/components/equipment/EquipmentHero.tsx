interface EquipmentHeroProps {
  emoji: string
  badge: string
  title: string
  description: string
  updatedText: string
}

export default function EquipmentHero({
  emoji,
  badge,
  title,
  description,
  updatedText,
}: EquipmentHeroProps) {
  return (
    <div className="bg-primary text-white pt-32 md:pt-36 pb-16 text-center relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="container-custom relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
          <span>{emoji}</span>
          <span>{badge}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto leading-tight">
          {title}
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-4">
          {description}
        </p>
        <p className="text-white/50 text-sm">{updatedText}</p>
      </div>
    </div>
  )
}
