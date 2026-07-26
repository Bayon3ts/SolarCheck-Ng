import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeadExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Lead Expired</h1>
        <p className="text-text-muted mb-8">
          This lead was matched to your company, but because it was not accepted within the 10-minute window, it has been reassigned to another installer.
        </p>
        <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-xl mb-8">
          <strong>Tip:</strong> Quick response times are critical for winning solar leads. Ensure notifications are turned on to claim future leads faster.
        </div>
        <Link href="/">
          <Button variant="primary" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
