import { NextResponse } from "next/server";
import { requirePromptChainAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(
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
  let body: { name?: string } = {};
  try {
    body = await req.json();
  } catch {
    // name is optional — we'll generate one if not provided
  }

  const supabase = await createSupabaseServerClient();

  const { data: original, error: fetchError } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !original)
    return NextResponse.json({ error: "Flavor not found" }, { status: 404 });

  const flavorRow = { ...(original as Record<string, unknown>) };
  delete flavorRow.id;
  delete flavorRow.created_datetime_utc;
  delete flavorRow.modified_datetime_utc;

  const nameKey = Object.keys(flavorRow).find(
    (k) => k.toLowerCase().includes("name") || k.toLowerCase().includes("title")
  );
  if (nameKey) {
    flavorRow[nameKey] = body.name || `Copy of ${String(original[nameKey] ?? id)}`;
  }

  const { data: newFlavor, error: insertError } = await supabase
    .from("humor_flavors")
    .insert(flavorRow)
    .select("id")
    .single();
  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 });

  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", id)
    .order("order_by", { ascending: true });

  if (steps && steps.length > 0) {
    const newSteps = steps.map((s) => {
      const row = { ...(s as Record<string, unknown>) };
      delete row.id;
      delete row.created_datetime_utc;
      delete row.modified_datetime_utc;
      row.humor_flavor_id = newFlavor!.id;
      return row;
    });
    const { error: stepsError } = await supabase
      .from("humor_flavor_steps")
      .insert(newSteps);
    if (stepsError)
      return NextResponse.json(
        { error: `Flavor created but steps failed: ${stepsError.message}`, id: newFlavor!.id },
        { status: 500 }
      );
  }

  return NextResponse.json({ id: newFlavor!.id, stepsCount: steps?.length ?? 0 });
}
