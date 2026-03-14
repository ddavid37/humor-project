import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { TestRunner } from "./TestRunner";

export default async function TestPage() {
  const supabase = await createSupabaseServerClient();
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id")
    .order("id");

  const flavorIds = (flavors ?? []).map((f) => String((f as { id: string }).id));

  return (
    <div>
      <h1 className="text-2xl font-bold">Test a flavor</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Generate captions for an image using a humor flavor (via API).
      </p>
      <TestRunner flavorIds={flavorIds} />
    </div>
  );
}
