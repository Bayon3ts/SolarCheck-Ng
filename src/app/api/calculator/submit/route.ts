import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

/* ═══════════════════════════════════════════════ */
/* POST /api/calculator/submit                     */
/* Saves full calculator submission + creates lead */
/* ═══════════════════════════════════════════════ */

const submitSchema = z.object({
  // Screen 1 equivalents
  ownershipStatus: z.string().optional(),
  state:           z.string().min(1),
  monthlyBill:     z.number().min(0),
  generatorSpend:  z.number().min(0).default(0),

  // Screen 2 equivalents
  propertyType:    z.string().optional(),
  roofType:        z.string().optional(),
  appliances_with_qty: z.array(z.any()).optional(),
  coveragePct:     z.number().optional(),
  autonomyDays:    z.number().optional(),
  batteryType:     z.string().optional(),

  // Results
  system_pv_kwp:       z.number().optional(),
  system_inverter_kva: z.number().optional(),
  system_battery_kwh:  z.number().optional(),
  cost_low:            z.number().optional(),
  cost_mid:            z.number().optional(),
  cost_high:           z.number().optional(),
  monthly_savings:     z.number().optional(),
  payback_months:      z.number().optional(),
  five_year_savings:   z.number().optional(),

  // Lead data (optional — only present on final submit)
  full_name: z.string().optional(),
  whatsapp:  z.string().optional(),
  timeline:  z.string().optional(),
  landlord_consent: z.boolean().optional(),
});

function billRange(bill: number): string {
  if (bill < 15000)  return "₦5,000 - ₦15,000";
  if (bill < 30000)  return "₦15,000 - ₦30,000";
  if (bill < 50000)  return "₦30,000 - ₦50,000";
  if (bill < 100000) return "₦50,000 - ₦100,000";
  if (bill < 200000) return "₦100,000 - ₦200,000";
  if (bill < 500000) return "₦200,000 - ₦500,000";
  return "₦500,000+";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // ── 1. Save to calculator_submissions ──
    const { error: calcError } = await supabase.from("calculator_submissions").insert({
      // existing columns
      monthly_bill:           data.monthlyBill,
      estimated_system_size:  data.system_inverter_kva ? `${data.system_inverter_kva}KVA` : null,
      estimated_cost_min:     data.cost_low ?? null,
      estimated_cost_max:     data.cost_high ?? null,
      state:                  data.state,
      phone:                  data.whatsapp ?? null,
      converted_to_lead:      false,

      // new columns (added via ALTER TABLE)
      property_type:       data.propertyType ?? null,
      coverage_pct:        data.coveragePct  ?? null,
      autonomy_days:       data.autonomyDays ?? null,
      battery_type:        data.batteryType  ?? null,
      generator_spend:     data.generatorSpend,
      system_pv_kwp:       data.system_pv_kwp      ?? null,
      system_inverter_kva: data.system_inverter_kva ?? null,
      system_battery_kwh:  data.system_battery_kwh  ?? null,
      cost_low:            data.cost_low   ?? null,
      cost_mid:            data.cost_mid   ?? null,
      cost_high:           data.cost_high  ?? null,
      monthly_savings:     data.monthly_savings  ?? null,
      payback_months:      data.payback_months   ?? null,
      five_year_savings:   data.five_year_savings ?? null,
      full_name:           data.full_name ?? null,
      whatsapp:            data.whatsapp  ?? null,
      timeline:            data.timeline  ?? null,
      
      // Critical Additions
      ownership_status:    data.ownershipStatus ?? null,
      roof_type:           data.roofType ?? null,
      appliances_with_qty: data.appliances_with_qty ?? [],
    });

    if (calcError) {
      console.error("[Calculator] Save error:", calcError);
    }

    // ── 2. If lead data present, create lead + notify installers ──
    if (data.full_name && data.whatsapp) {
      try {
        // Map timeline string to the enum the leads table expects
        const timelineMap: Record<string, string> = {
          "asap":        "asap",
          "1-3months":   "1-3months",
          "researching": "researching",
        };
        const mappedTimeline = timelineMap[data.timeline ?? ""] ?? "researching";

        // POST to the existing /api/leads/submit endpoint (do NOT modify that file)
        const leadPayload = {
          full_name:            data.full_name,
          phone:                data.whatsapp,
          whatsapp:             data.whatsapp,
          state:                data.state,
          city:                 "",
          monthly_bill_range:   billRange(data.monthlyBill),
          system_size_interest: data.system_inverter_kva ? `${data.system_inverter_kva}KVA` : undefined,
          timeline:             mappedTimeline,
          lead_type:            "shared",
          ownership_status:     data.ownershipStatus ?? null,
          roof_type:            data.roofType ?? null,
        };

        const leadRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001"}/api/leads/submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leadPayload),
          }
        );

        if (leadRes.ok) {
          // Mark as converted
          await supabase
            .from("calculator_submissions")
            .update({ converted_to_lead: true })
            .eq("state", data.state)
            .eq("whatsapp", data.whatsapp)
            .order("created_at", { ascending: false })
            .limit(1);
        } else {
          console.error("[Calculator] Lead creation failed:", await leadRes.text());
        }
      } catch (leadErr) {
        console.error("[Calculator] Lead error (non-fatal):", leadErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Calculator] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
