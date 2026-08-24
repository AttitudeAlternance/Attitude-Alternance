export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  formation: string | null;
  cv_summary: string | null;
  cv_file_path: string | null;
  phone: string | null;
  target_city: string | null;
  target_sectors: string[] | null;
  search_radius: number | null;
  notify_new_offers: boolean;
  weekly_goal: number | null;
  is_admin: boolean;
  plan: string | null;
  total_applications_created: number | null;
  bonus_applications: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  referral_code: string | null;
  referred_by: string | null;
  referral_bonus_granted: boolean | null;
  waitlist_joined_at: string | null;
  age_range: string | null;
  activation_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const AGE_RANGES = ["Moins de 18 ans", "18-20 ans", "21-23 ans", "24-26 ans", "27 ans et plus"] as const;

export type MessageType = "candidature" | "spontanee" | "relance" | "linkedin" | "remerciement";

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  candidature: "Mail de candidature",
  spontanee: "Candidature spontanée",
  relance: "Mail de relance",
  linkedin: "Message LinkedIn",
  remerciement: "Mail de remerciement",
};

export type MessageTone = "professionnel" | "direct" | "chaleureux";

export interface GeneratedMessage {
  id: string;
  user_id: string;
  application_id: string | null;
  type: MessageType;
  company: string | null;
  role: string | null;
  recruiter_name: string | null;
  tone: string | null;
  content: string;
