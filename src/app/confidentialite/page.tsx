import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const metadata = { title: "Politique de confidentialité — Attitude Alternance" };

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedAt="3 juillet 2026">
      <LegalSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées sur Attitude Alternance est identifié dans
          les <a href="/mentions-legales" className="text-primary underline">Mentions légales</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées et finalités">
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead className="bg-paper/60 text-muted">
              <tr>
                <th className="p-3">Donnée</th>
                <th className="p-3">Finalité</th>
                <th className="p-3">Base légale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="p-3">Email, mot de passe</td>
                <td className="p-3">Création et gestion du compte</td>
                <td className="p-3">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="p-3">Prénom, nom, formation, ville, secteur, objectif</td>
                <td className="p-3">Personnalisation du profil et des messages générés</td>
                <td className="p-3">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="p-3">CV (fichier et texte extrait)</td>
                <td className="p-3">Résumé de profil pour personnaliser les messages et calculer un score de correspondance</td>
                <td className="p-3">Consentement (dépôt volontaire)</td>
              </tr>
              <tr>
                <td className="p-3">Candidatures (entreprise, poste, contact, description d&apos;offre)</td>
                <td className="p-3">Suivi de la recherche d&apos;alternance</td>
                <td className="p-3">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="p-3">Messages générés</td>
                <td className="p-3">Historique consultable par l&apos;utilisateur</td>
                <td className="p-3">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="p-3">Données de paiement</td>
                <td className="p-3">Facturation de l&apos;offre Étudiant+</td>
                <td className="p-3">Exécution du contrat (traité par Stripe, non stocké par nous)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="3. Destinataires des données et sous-traitants">
        <p>Les données sont traitées par les prestataires suivants, agissant comme sous-traitants :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Supabase</strong> (hébergement de la base de données et authentification)</li>
          <li><strong>Vercel</strong> (hébergement de l&apos;application)</li>
          <li>
            <strong>Anthropic</strong> (traitement du CV, des descriptions d&apos;offres et des informations saisies pour
            générer les messages, résumés et scores — société basée aux États-Unis)
          </li>
          <li><strong>Resend</strong> (envoi des emails de rappel de relance, si activé)</li>
          <li><strong>Stripe</strong> (traitement des paiements de l&apos;offre Étudiant+)</li>
          <li>
            <strong>Vercel Analytics</strong> (statistiques de fréquentation anonymisées, sans cookie ni donnée
            personnelle identifiable)
          </li>
        </ul>
        <p>
          Certains de ces prestataires étant situés hors de l&apos;Union européenne (notamment aux États-Unis), les
          transferts de données correspondants s&apos;appuient sur les garanties prévues par le RGPD (clauses
          contractuelles types ou mécanisme équivalent propre à chaque prestataire).
        </p>
        <p>Aucune donnée n&apos;est vendue ni utilisée à des fins publicitaires.</p>
      </LegalSection>

      <LegalSection title="4. Durée de conservation">
        <p>
          Les données sont conservées tant que le compte est actif. En cas de suppression du compte par
          l&apos;utilisateur, l&apos;ensemble des données associées (profil, CV, candidatures, messages générés) est supprimé
          définitivement, à l&apos;exception des données de facturation que Stripe peut être légalement tenu de
          conserver pour ses propres obligations comptables.
        </p>
      </LegalSection>

      <LegalSection title="5. Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès,
          de rectification, d&apos;effacement, de portabilité et d&apos;opposition sur vos données.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Accès et rectification</strong> : directement depuis la page « Mon profil » de votre espace.
          </li>
          <li>
            <strong>Effacement</strong> : un bouton « Supprimer mon compte » dans votre profil supprime immédiatement et
            définitivement l&apos;ensemble de vos données.
          </li>
          <li>
            <strong>Autres demandes</strong> (portabilité, opposition) : par email à l&apos;adresse de contact indiquée
            dans les Mentions légales.
          </li>
        </ul>
        <p>
          Vous disposez également du droit d&apos;introduire une réclamation auprès de la CNIL (
          <a href="https://www.cnil.fr" className="text-primary underline" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </a>
          ) si vous estimez que vos droits ne sont pas respectés.
        </p>
      </LegalSection>

      <LegalSection title="6. Sécurité">
        <p>
          Les données sont protégées par des règles d&apos;accès strictes (Row Level Security) garantissant qu&apos;un
          utilisateur ne peut accéder qu&apos;à ses propres données. Les fichiers CV sont stockés dans un espace privé non
          accessible publiquement.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Le Site utilise uniquement des cookies techniques strictement nécessaires à l&apos;authentification (gestion de
          votre session de connexion). Les statistiques de fréquentation (Vercel Analytics) sont mesurées sans
          cookie et sans identifiant personnel. Aucun cookie publicitaire ou de mesure d&apos;audience tiers
          n&apos;est utilisé à ce jour.
        </p>
      </LegalSection>

      <LegalSection title="8. Mineurs">
        <p>
          Si vous êtes mineur, l&apos;utilisation du Service, et en particulier le dépôt de documents personnels (CV),
          doit se faire avec l&apos;accord de votre représentant légal.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Pour toute question relative à cette politique ou à l&apos;exercice de vos droits, contactez l&apos;adresse email
          indiquée dans les <a href="/mentions-legales" className="text-primary underline">Mentions légales</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
