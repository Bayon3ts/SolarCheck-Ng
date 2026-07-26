import { createAdminClient } from "@/lib/supabase/admin";
import { CheckCircle2, Phone, MessageCircle, MapPin, Zap, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LeadSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ installer: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!lead || lead.installer_id !== resolvedSearchParams.installer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p className="text-text-muted">You do not have access to this lead.</p>
        </div>
      </div>
    );
  }

  const phone = lead.phone || "";
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const telUrl = `tel:${phone}`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-green-600 w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Lead Accepted!</h1>
              <p className="text-sm text-text-muted">You've successfully claimed this lead.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-text-muted mb-1 text-sm font-medium">
                <User size={16} /> Customer Name
              </div>
              <div className="text-lg font-semibold text-text-primary">{lead.full_name}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-text-muted mb-1 text-sm font-medium">
                <MapPin size={16} /> Location
              </div>
              <div className="text-lg font-semibold text-text-primary">{lead.city}, {lead.state}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-text-muted mb-1 text-sm font-medium">
                <Phone size={16} /> Phone Number
              </div>
              <div className="text-lg font-semibold text-text-primary">{lead.phone}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-text-muted mb-1 text-sm font-medium">
                <Zap size={16} /> System Needs
              </div>
              <div className="text-sm font-semibold text-text-primary">Bill: {lead.monthly_bill_range}</div>
              <div className="text-sm text-text-muted">Timeline: {lead.timeline || "N/A"}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href={telUrl} className="flex-1">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2" size="lg">
                <Phone size={18} /> Call Now
              </Button>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-50" size="lg">
                <MessageCircle size={18} /> Message on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
