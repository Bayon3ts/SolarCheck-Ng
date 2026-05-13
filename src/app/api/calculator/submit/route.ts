import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculatorSubmitSchema } from "@/lib/validations";

/* ═══════════════════════════════════════ */
/* POST /api/calculator/submit             */
/* Save calculator result, warm lead       */
/* ═══════════════════════════════════════ */

// Appliance power consumption in watts (typical Nigerian usage)
const APPLIANCE_WATTAGE: Record<string, number> = {
  ac: 1500,
  fridge: 200,
  tv: 150,
  fan: 75,
  washing_machine: 500,
  microwave: 1200,
  iron: 1000,
  water_heater: 2000,
  lighting: 200,
  laptop: 65,
  desktop: 300,
  water_pump: 750,
};

function estimateSystemSize(monthlyBill: number, appliances: Record<string, boolean>): {
  systemSize: string;
  costMin: number;
  costMax: number;
} {
  // Estimate based on monthly bill (₦/kWh ~ ₦65 average in Nigeria)
  const estimatedKwh = monthlyBill / 65;
  const dailyKwh = estimatedKwh / 30;

  // Add appliance load
  let totalWatts = 0;
  for (const [appliance, selected] of Object.entries(appliances)) {
    if (selected && APPLIANCE_WATTAGE[appliance]) {
      totalWatts += APPLIANCE_WATTAGE[appliance];
    }
  }

  // Calculate recommended system size (with 20% headroom)
  const applianceKva = (totalWatts / 1000) * 1.2;
  const billBasedKva = dailyKwh / 4; // ~4 hours peak sun in Nigeria

  const recommendedKva = Math.max(applianceKva, billBasedKva, 1);

  let systemSize: string;
  let costMin: number;
  let costMax: number;

  if (recommendedKva <= 1.5) {
    systemSize = "1KVA";
    costMin = 350000;
    costMax = 600000;
  } else if (recommendedKva <= 2.5) {
    systemSize = "2KVA";
    costMin = 600000;
    costMax = 1000000;
  } else if (recommendedKva <= 4) {
    systemSize = "3KVA";
    costMin = 900000;
    costMax = 1500000;
  } else if (recommendedKva <= 6) {
    systemSize = "5KVA";
    costMin = 1500000;
    costMax = 2500000;
  } else if (recommendedKva <= 8.5) {
    systemSize = "7.5KVA";
    costMin = 2500000;
    costMax = 4000000;
  } else {
    systemSize = "10KVA+";
    costMin = 4000000;
    costMax = 8000000;
  }

  return { systemSize, costMin, costMax };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = calculatorSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const estimate = estimateSystemSize(data.monthly_bill, data.appliances as Record<string, boolean>);

    const supabase = createAdminClient();

    // Save submission
    const { error } = await supabase.from("calculator_submissions").insert({
      monthly_bill: data.monthly_bill,
      appliances: data.appliances,
      estimated_system_size: estimate.systemSize,
      estimated_cost_min: estimate.costMin,
      estimated_cost_max: estimate.costMax,
      state: data.state,
      phone: data.phone || null,
      converted_to_lead: false,
    });

    if (error) {
      console.error("[Calculator] Save error:", error);
    }

    return NextResponse.json({
      success: true,
      data: {
        system_size: estimate.systemSize,
        cost_min: estimate.costMin,
        cost_max: estimate.costMax,
        monthly_savings_vs_generator: Math.round(data.monthly_bill * 0.6),
      },
    });
  } catch (error) {
    console.error("[Calculator] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
