import { redirect } from "next/navigation";
import { requirePromptChainAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function HomePage() {
  const auth = await requirePromptChainAdmin();
  if (auth.allowed) redirect("/flavors");
  return <LoginForm />;
}
