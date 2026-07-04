import { LegalLayout, LegalSection } from "@/components/layout/LegalLayout";

export const metadata = { title: "Conditions Générales d'Utilisation — Attitude Alternance" };

export default function CguPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updatedAt="3 juillet 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (« CGU ») régissent l&apos;accès et l&apos;utilisation du site
          Attitude Alternance (« le Service »), qui propose aux étudiants un outil de suivi de candidatures, de génération
          de messages assistée par intelligence artificielle, et de ressources liées à la recherche d&apos;alternance.
        </p>
        <p>
          L&apos;inscription ou l&apos;utilisation du Service vaut acceptation pleine et entière des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service et création de compte">
        <p>
          L&apos;accès aux fonctionnalités du Service nécessite la création d&apos;un compte, avec une adresse email valide
          et un mot de passe. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les maintenir à jour.
        </p>
        <p>
          Le Service est accessible aux personnes majeures. Un mineur peut utiliser le Service sous réserve de
          l&apos;autorisation de son représentant légal, conformément à la réglementation applicable en matière de
          protection des mineurs et de traitement de leurs données personnelles.
        </p>
      </LegalSection>

      <LegalSection title="3. Description du service et offres">
        <p>
          Une offre gratuite permet de suivre un nombre limité de candidatures et d&apos;utiliser les fonctionnalités
          d&apos;intelligence artificielle dans la limite d&apos;un quota quotidien. Une offre payante « Étudiant+ »,
          souscrite par abonnement mensuel sans engagement de durée et résiliable à tout moment, lève ces limites.
        </p>
        <p>
          Les tarifs en vigueur sont affichés sur le Site avant toute souscription. Le paiement est traité par un
          prestataire tiers (Stripe) ; le Service ne stocke aucune donnée bancaire.
        </p>
        <p>
          <strong>Droit de rétractation :</strong> conformément à l&apos;article L221-18 du Code de la consommation,
          l&apos;utilisateur consommateur dispose d&apos;un délai de 14 jours pour exercer son droit de rétractation sur un
          abonnement payant. En souscrivant à l&apos;offre Étudiant+, l&apos;utilisateur demande expressément à bénéficier
          du service dès le paiement ; s&apos;il exerce son droit de rétractation après avoir commencé à utiliser les
          fonctionnalités payantes, une somme proportionnelle au service déjà fourni pourra être retenue.
        </p>
      </LegalSection>

      <LegalSection title="4. Fonctionnalités d'intelligence artificielle">
        <p>
          Les messages générés, les résumés de CV et les scores de correspondance sont produits par un modèle
          d&apos;intelligence artificielle tiers (Anthropic). Ces contenus sont fournis à titre d&apos;aide et
          d&apos;assistance : ils peuvent comporter des inexactitudes et doivent être relus et validés par
          l&apos;utilisateur avant tout envoi à un tiers (recruteur, entreprise). Le Service ne garantit ni l&apos;exactitude,
          ni la pertinence, ni le succès d&apos;une candidature utilisant ces contenus.
        </p>
      </LegalSection>

      <LegalSection title="5. Estimation d'adresses email">
        <p>
          L&apos;outil de recherche d&apos;email propose des adresses estimées à partir de schémas courants, sans
          vérification de leur existence réelle. L&apos;utilisateur s&apos;engage à utiliser cette fonctionnalité de manière
          raisonnable, dans le cadre légitime d&apos;une recherche d&apos;emploi ou d&apos;alternance, et à ne pas l&apos;employer à
          des fins de prospection commerciale de masse ou d&apos;envoi non sollicité assimilable à du spam.
        </p>
      </LegalSection>

      <LegalSection title="6. Obligations de l'utilisateur">
        <p>L&apos;utilisateur s&apos;engage à :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>ne pas utiliser le Service à des fins illégales ou frauduleuses ;</li>
          <li>ne pas tenter de contourner les limites techniques du Service (quotas, offre gratuite) ;</li>
          <li>ne pas déposer de documents (CV, descriptions d&apos;offres) contenant des données de tiers sans leur accord ;</li>
          <li>conserver la confidentialité de ses identifiants de connexion.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          Le Service est fourni « en l&apos;état ». L&apos;éditeur ne garantit pas une disponibilité continue ni l&apos;absence
          d&apos;erreurs, et ne saurait être tenu responsable des conséquences d&apos;une utilisation des contenus générés
          par l&apos;utilisateur, ni de l&apos;issue des candidatures effectuées.
        </p>
      </LegalSection>

      <LegalSection title="8. Résiliation">
        <p>
          L&apos;utilisateur peut supprimer son compte à tout moment depuis son espace personnel, entraînant la
          suppression de l&apos;ensemble de ses données (voir la Politique de confidentialité). L&apos;éditeur peut suspendre
          ou supprimer un compte en cas de manquement grave aux présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="9. Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige relève, à défaut de résolution amiable, des
          tribunaux compétents.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
