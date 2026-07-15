// Types partagés dans toute l'application.
// Ils reflètent exactement le schéma défini dans supabase/schema.sql

export type ApplicationStatus =
  | "a_candidater"
  | "envoyee"
  | "relance_a_faire"
  | "entretien_obtenu"
  | "refus"
  | "accepte";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "a_candidater",
  "envoyee",
  "relance_a_faire",
  "entretien_obtenu",
  "refus",
  "accepte",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  a_candidater: "À candidater",
  envoyee: "Candidature envoyée",
  relance_a_faire: "Relance à faire",
  entretien_obtenu: "Entretien obtenu",
  refus: "Refus",
  accepte: "Accepté",
};

// Classes Tailwind associées à chaque statut (badges)
export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  a_candidater: "bg-slate-100 text-slate-700 border-slate-200",
  envoyee: "bg-primary-50 text-primary-600 border-primary-200",
  relance_a_faire: "bg-warn-50 text-warn-500 border-warn-500/30",
  entretien_obtenu: "bg-accent-50 text-accent-600 border-accent-400/40",
  refus: "bg-danger-50 text-danger-500 border-danger-500/30",
  accepte: "bg-success-50 text-success-500 border-success-500/30",
};

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  offer_url: string | null;
  applied_at: string | null;
  status: ApplicationStatus;
  linkedin_contact: string | null;
  contact_email: string | null;
  next_followup_at: string | null;
  comment: string | null;
  job_description: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationInput = Omit<
  Application,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  formation: string | null;
  target_city: string | null;
  target_sector: string | null;
  target_role: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
  goal: string | null;
  cv_file_path: string | null;
  cv_text: string | null;
  cv_summary: string | null;
  cv_uploaded_at: string | null;
  weekly_goal: number;
  plan: "free" | "premium";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  ai_calls_today: number;
  ai_calls_reset_at: string;
  email: string | null;
  terms_accepted_at: string | null;
  total_applications_created: number;
  referral_code: string | null;
  referred_by: string | null;
  bonus_applications: number;
  is_admin: boolean;
  waitlist_joined_at: string | null;
  age_range: string | null;
  activation_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const AGE_RANGES = ["Moins de 18 ans", "18-20 ans", "21-23 ans", "24-26 ans", "27 ans et plus"] as const;

export type MessageType = "candidature" | "relance" | "linkedin" | "remerciement";

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  candidature: "Mail de candidature",
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
  created_at: string;
}
