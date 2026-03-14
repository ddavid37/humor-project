import { NextResponse } from "next/server";
import { requirePromptChainAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const auth = await requirePromptChainAdmin();
  if (!auth.allowed)
    return NextResponse.json(
      { error: auth.reason === "not_logged_in" ? "Not authenticated" : "Forbidden" },
      { status: auth.reason === "not_logged_in" ? 401 : 403 }
    );
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .insert(body)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
