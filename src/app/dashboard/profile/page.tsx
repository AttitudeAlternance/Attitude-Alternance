import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CvUpload } from "@/components/profile/CvUpload";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user?.id)
    .maybeSingle();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Mon profil</h1>
        <p className="mt-1 text-sm text-muted">
          Ces informations sont utilisées pour personnaliser vos messages générés par IA.
        </p>
      </div>

      <div className="space-y-6">
        <CvUpload
          initialSummary={(profile as Profile | null)?.cv_summary ?? null}
          initialUploadedAt={(profile as Profile | null)?.cv_uploaded_at ?? null}
        />

        <ProfileForm
          userId={userData.user?.id ?? ""}
          email={userData.user?.email ?? ""}
          initialProfile={profile as Profile | null}
        />
      </div>
    </div>
  );
}
