import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { z } from "zod";

const warrantyRegisterSchema = z.object({
  homeowner_name: z.string().min(2).max(100),
  homeowner_phone: z.string().min(10).max(15),
  homeowner_email: z.string().email().optional().or(z.literal("")),
  state: z.string().min(2),
  installer_id: z.string().uuid().optional(),
  installer_name_manual: z.string().max(150).optional(),
  system_size_kva: z.string().max(20).optional(),
  battery_kwh: z.string().max(20).optional(),
  panel_count: z.number().int().positive().optional(),
  install_date: z.string(), // ISO date
  total_paid_naira: z.number().positive().optional(),
  lead_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = warrantyRegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }
    const data = validation.data;
    const supabase = createAdminClient();

    const { data: inserted, error } = await supabase
      .from("warranty_registrations")
      .insert({
        lead_id: data.lead_id || null,
        installer_id: data.installer_id || null,
        homeowner_name: data.homeowner_name,
        homeowner_phone: data.homeowner_phone,
        homeowner_email: data.homeowner_email || null,
        state: data.state,
        installer_name_manual: data.installer_name_manual || null,
        system_size_kva: data.system_size_kva || null,
        battery_kwh: data.battery_kwh || null,
        panel_count: data.panel_count || null,
        install_date: data.install_date,
        total_paid_naira: data.total_paid_naira || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("[Warranty Register] Insert failed:", error);
      return NextResponse.json({ error: "Failed to register warranty" }, { status: 500 });
    }

    // Send confirmation + set expectation for a review prompt later via WhatsApp
    await sendWhatsAppMessage({
      to: data.homeowner_phone,
      text:
        `✅ Your solar system warranty is now registered with SolarCheck, ${data.homeowner_name}!\n\n` +
        `Installed: ${data.install_date}\n` +
        `We'll check in with you in a few weeks to see how it's performing, and we keep your warranty on file so you always have a record — even if you lose your paperwork.\n\n` +
        `Thanks for using SolarCheck.`,
    });

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (err) {
    console.error("[Warranty Register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}