interface EquipmentHeroProps {
  emoji: string
  badge: string
  title: string
  description: string
  updatedText: string
  /** Optional photo background (serve from /public, e.g. "/solar-panels-hero.jpg") */
  bgImage?: string
}

export default function EquipmentHero({
  emoji,
  badge,
  title,
  description,
  updatedText,
  bgImage,
}: EquipmentHeroProps) {
  return (
    <div
      className={`text-white pt-32 md:pt-36 pb-16 text-center relative overflow-hidden ${!bgImage ? 'bg-primary' : ''}`}
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Dark gradient overlay — ensures text stays readable over any photo */}
      {bgImage && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,40,20,0.72) 0%, rgba(0,60,30,0.80) 60%, rgba(0,40,20,0.82) 100%)',
          }}
        />
      )}

      {/* Subtle diagonal pattern (shown without bgImage, softened with image) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
          opacity: bgImage ? 0.03 : 0.05,
        }}
      />

      <div className="container-custom relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
          <span>{emoji}</span>
          <span>{badge}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto leading-tight drop-shadow-md">
          {title}
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-4 drop-shadow">
          {description}
        </p>
        <p className="text-white/55 text-sm">{updatedText}</p>
      </div>
    </div>
  )
}
