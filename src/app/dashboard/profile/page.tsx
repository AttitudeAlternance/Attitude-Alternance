import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CvUpload } from "@/components/profile/CvUpload";
import { PlanCard } from "@/components/profile/PlanCard";
import { ReferralCard } from "@/components/profile/ReferralCard";
import { DeleteAccountCard } from "@/components/profile/DeleteAccountCard";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user?.id)
    .maybeSingle();

  const typedProfile = profile as Profile | null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Mon profil</h1>
        <p className="mt-1 text-sm text-muted">
          Ces informations sont utilisées pour personnaliser vos messages générés par IA.
        </p>
      </div>

      <div className="space-y-6">
        <PlanCard plan={typedProfile?.plan ?? "free"} justUpgraded={searchParams.upgraded === "1"} />

        <ReferralCard
          referralCode={typedProfile?.referral_code ?? null}
          bonusApplications={typedProfile?.bonus_applications ?? 0}
        />

        <CvUpload
          initialSummary={typedProfile?.cv_summary ?? null}
          initialUploadedAt={typedProfile?.cv_uploaded_at ?? null}
        />

        <ProfileForm
          userId={userData.user?.id ?? ""}
          email={userData.user?.email ?? ""}
          initialProfile={typedProfile}
        />

        <DeleteAccountCard />
      </div>
    </div>
  );
}
