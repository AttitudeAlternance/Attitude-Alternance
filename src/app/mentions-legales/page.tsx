import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const metadata = { title: "Mentions légales — Attitude Alternance" };

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" updatedAt="19 juillet 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site Attitude Alternance (ci-après « le Site ») est édité par :
        </p>
        <p className="rounded-lg border border-line bg-paper p-4">
          <strong>Baptiste GAUVIN</strong>, exerçant sous le nom commercial <strong>Attitude Alternance</strong>
          <br />
          Entrepreneur individuel (micro-entreprise)
          <br />
          Adresse : 26 Sentier Canis, 33300 Bordeaux, France
          <br />
          SIRET : 107 332 587 00016
          <br />
          TVA non applicable, article 293 B du Code général des impôts
          <br />
          Email : baptistegauvinn@gmail.com
          <br />
          Téléphone : 06 28 68 88 26
        </p>
        <p>Directeur de la publication : Baptiste Gauvin.</p>
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
        <p>Pour toute question relative au Site, vous pouvez écrire à : baptistegauvinn@gmail.com.</p>
      </LegalSection>
    </LegalLayout>
  );
}
