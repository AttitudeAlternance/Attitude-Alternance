import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const metadata = { title: "Mentions légales — Attitude Alternance" };

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" updatedAt="3 juillet 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site Attitude Alternance (ci-après « le Site ») est édité par :
        </p>
        <p className="rounded-lg bg-warn-50 p-4 text-warn">
          [À COMPLÉTER] — Nom et prénom (ou dénomination sociale si vous exercez en société), statut (particulier,
          auto-entrepreneur, société...), adresse postale, numéro de SIRET le cas échéant, adresse email de contact,
          numéro de téléphone (facultatif pour un particulier).
        </p>
        <p>Directeur de la publication : [À COMPLÉTER — nom de la personne responsable de la publication].</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le Site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
          (<a href="https://vercel.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">vercel.com</a>).
        </p>
        <p>
          La base de données et l&apos;authentification sont hébergées par Supabase Inc.
          (<a href="https://supabase.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">supabase.com</a>).
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du Site (textes, graphismes, logo, structure) est protégé par le droit d&apos;auteur.
          Toute reproduction non autorisée est interdite. Les contenus générés par l&apos;utilisateur (candidatures, CV,
          messages) restent sa propriété.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Pour toute question relative au Site, vous pouvez écrire à : [À COMPLÉTER — adresse email de contact].</p>
      </LegalSection>
    </LegalLayout>
  );
}
