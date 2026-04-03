import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import { FlavorDetail } from "./FlavorDetail";

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: flavor, error: flavorError } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", id)
    .single();

  if (flavorError || !flavor) notFound();

  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", id)
    .order("order_by", { ascending: true });

  let stepCols: string[] =
    steps?.length && steps[0]
      ? (Object.keys(steps[0] as object) as string[])
      : [];

  if (stepCols.length === 0) {
    const { data: sampleStep } = await supabase
      .from("humor_flavor_steps")
      .select("*")
      .limit(1)
      .single();
    if (sampleStep) {
      stepCols = Object.keys(sampleStep as object);
    }
  }

  const insertStepCols = stepCols.filter(
    (c) =>
      c !== "id" &&
      c !== "created_datetime_utc" &&
      c !== "modified_datetime_utc"
  );

  const flavorCols = flavor ? (Object.keys(flavor as object) as string[]) : [];
  const updateFlavorCols = flavorCols.filter(
    (c) =>
      c !== "id" &&
      c !== "created_datetime_utc" &&
      c !== "modified_datetime_utc"
  );

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/flavors"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Back to flavors
        </Link>
      </div>
      <FlavorDetail
        flavor={flavor as Record<string, unknown>}
        steps={(steps ?? []) as Record<string, unknown>[]}
        updateFlavorColumns={updateFlavorCols}
        insertStepColumns={insertStepCols}
      />
    </div>
  );
}
