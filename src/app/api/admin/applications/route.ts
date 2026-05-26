import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// SUPABASE_SERVICE_ROLE_KEY bypasses RLS.
// This file is server-only (Next.js Route Handler).
// The key is never sent to the browser.
// Access to this endpoint is restricted by middleware
// protecting all /admin/* page routes.

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase.from("installer_applications").select("*").order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
