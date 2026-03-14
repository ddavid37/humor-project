import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { NewFlavorForm } from "./NewFlavorForm";

export default async function NewFlavorPage() {
  const supabase = await createSupabaseServerClient();
  const { data: one } = await supabase
    .from("humor_flavors")
    .select("*")
    .limit(1)
    .single();
  const cols = one ? (Object.keys(one as object) as string[]) : ["id"];
  const insertCols = cols.filter((c) => c !== "id" && c !== "created_datetime_utc" && c !== "modified_datetime_utc");

  return (
    <div>
      <h1 className="text-2xl font-bold">New humor flavor</h1>
      <NewFlavorForm columns={insertCols} />
    </div>
  );
}
