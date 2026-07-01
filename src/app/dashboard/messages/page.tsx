import { createClient } from "@/lib/supabase/server";
import { MessageGenerator } from "@/components/messages/MessageGenerator";
import type { GeneratedMessage, Profile } from "@/lib/types";

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user?.id)
    .maybeSingle();

  const { data: history } = await supabase
    .from("generated_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Générateur de messages</h1>
        <p className="mt-1 text-sm text-muted">
          Créez en quelques secondes un mail ou un message LinkedIn prêt à copier-coller.
        </p>
      </div>

      <MessageGenerator
        profile={profile as Profile | null}
        userId={userData.user?.id ?? ""}
        history={(history ?? []) as GeneratedMessage[]}
      />
    </div>
  );
}
