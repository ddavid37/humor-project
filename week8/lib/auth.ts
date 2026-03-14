import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export type AuthResult =
  | { allowed: true; userId: string }
  | { allowed: false; reason: "not_logged_in" | "forbidden" };

/** Allow profiles.is_superadmin OR profiles.is_matrix_admin */
export async function requirePromptChainAdmin(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { allowed: false, reason: "not_logged_in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = profile?.is_superadmin === true;
  const isMatrixAdmin = profile?.is_matrix_admin === true;
  if (!isSuperAdmin && !isMatrixAdmin)
    return { allowed: false, reason: "forbidden" };

  return { allowed: true, userId: user.id };
}
