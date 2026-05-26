import Link from "next/link";

/* ═══════════════════════════════════════ */
/* Empty Installer State                   */
/* Shown on location pages with 0 results  */
/* ═══════════════════════════════════════ */

interface EmptyInstallerStateProps {
  city: string;
  state: string;
}

export default function EmptyInstallerState({
  city,
  state,
}: EmptyInstallerStateProps) {
  return (
    <div className="text-center py-16 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">🔍</span>
      </div>

      {/* Message */}
      <h3 className="text-xl font-bold text-text-primary mb-2">
        We&apos;re onboarding installers in {city}
      </h3>
      <p className="text-text-muted max-w-sm mx-auto mb-8">
        SolarCheck is actively verifying solar companies in {state}. Be the
        first verified installer in your area.
      </p>

      {/* TWO CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {/* For homeowners */}
        <Link href="/get-quotes" className="btn-primary px-6 py-3">
          Get quotes via WhatsApp →
        </Link>

        {/* For installers */}
        <Link href="/for-installers/apply" className="btn-outline px-6 py-3">
          List your company free
        </Link>
      </div>

      {/* Trust line */}
      <p className="text-xs text-text-muted mt-6">
        Already helping homeowners find solar across all 36 states
      </p>
    </div>
  );
}
