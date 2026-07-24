interface EquipmentHeroProps {
  emoji: string
  badge: string
  title: string
  description: string
  updatedText: string
  /** Optional photo background (serve from /public, e.g. "/solar-panels-hero.jpg") */
  bgImage?: string
  /** Optional video background (serve from /public, e.g. "/video.mp4") */
  bgVideo?: string
}

export default function EquipmentHero({
  emoji,
  badge,
  title,
  description,
  updatedText,
  bgImage,
  bgVideo,
}: EquipmentHeroProps) {
  return (
    <div
      className={`text-white pt-32 md:pt-36 pb-16 text-center relative overflow-hidden ${!bgImage && !bgVideo ? 'bg-primary' : ''}`}
      style={
        bgImage && !bgVideo
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Video is no longer a background */}
      {/* Dark gradient overlay — ensures text stays readable over any photo or video */}
      {(bgImage || bgVideo) && (
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
          opacity: (bgImage || bgVideo) ? 0.03 : 0.05,
        }}
      />

      <div className={`container-custom relative z-10 flex flex-col md:flex-row items-center gap-8 ${bgVideo ? 'md:text-left' : ''}`}>
        {bgVideo && (
          <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden relative shadow-2xl border-4 border-white/10">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src={bgVideo}
            />
          </div>
        )}
        
        <div className={bgVideo ? 'flex-1' : 'w-full'}>
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
          <span>{emoji}</span>
          <span>{badge}</span>
        </div>
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-md ${!bgVideo ? 'max-w-3xl mx-auto' : ''}`}>
          {title}
        </h1>
        <p className={`text-white/80 text-lg mb-4 drop-shadow ${!bgVideo ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}>
          {description}
        </p>
        <p className="text-white/55 text-sm">{updatedText}</p>
        </div>
      </div>
    </div>
  )
}
