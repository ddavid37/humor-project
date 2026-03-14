import { NextResponse } from "next/server";
import { requirePromptChainAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePromptChainAdmin();
  if (!auth.allowed)
    return NextResponse.json(
      { error: auth.reason === "not_logged_in" ? "Not authenticated" : "Forbidden" },
      { status: auth.reason === "not_logged_in" ? 401 : 403 }
    );
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("humor_flavor_steps")
    .update(body)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePromptChainAdmin();
  if (!auth.allowed)
    return NextResponse.json(
      { error: auth.reason === "not_logged_in" ? "Not authenticated" : "Forbidden" },
      { status: auth.reason === "not_logged_in" ? 401 : 403 }
    );
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
