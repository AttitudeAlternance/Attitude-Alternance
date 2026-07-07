"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ReferralCardProps {
  referralCode: string | null;
  bonusApplications: number;
}

export function ReferralCard({ referralCode, bonusApplications }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  if (!referralCode) return null;

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : `/signup?ref=${referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parrainer un ami</CardTitle>
        <CardDescription>
          Chaque ami qui s&apos;inscrit avec votre lien débloque 5 candidatures supplémentaires pour vous deux.
        </CardDescription>
      </CardHeader>

      <div className="flex flex-wrap items-center gap-2">
        <code className="flex-1 min-w-[220px] truncate rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-sm text-ink/80">
          {referralLink}
        </code>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? "Copié ✓" : "Copier le lien"}
        </Button>
      </div>

      {bonusApplications > 0 && (
        <p className="mt-3 text-sm font-medium text-success">
          +{bonusApplications} candidatures débloquées grâce à vos parrainages 🎉
        </p>
      )}
    </Card>
  );
}
