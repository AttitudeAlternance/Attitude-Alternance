import { Card } from "@/components/ui/Card";

const resources = [
  {
    category: "Conseils CV",
    icon: "📄",
    items: [
      "Adaptez votre CV à chaque offre : mettez en avant le vocabulaire et les compétences de l'annonce.",
      "Limitez-vous à une page tant que vous êtes étudiant : allez droit au but.",
      "Quantifiez vos expériences (chiffres, résultats) plutôt que de simplement les décrire.",
      "Vérifiez l'orthographe : faites relire votre CV par une autre personne avant envoi.",
    ],
  },
  {
    category: "Conseils LinkedIn",
    icon: "💼",
    items: [
      "Utilisez une photo de profil claire et professionnelle, avec un fond neutre.",
      "Rédigez un titre qui indique votre recherche : « Étudiant en BUT MMI · Recherche alternance ».",
      "Publiez régulièrement pour montrer votre motivation et votre secteur d'intérêt.",
      "Personnalisez chaque demande de connexion avec un message court et contextualisé.",
    ],
  },
  {
    category: "Conseils entretien",
    icon: "🎤",
    items: [
      "Préparez 3 exemples concrets de vos expériences (projet, stage, association).",
      "Renseignez-vous sur l'entreprise : activité, actualité récente, valeurs.",
      "Préparez 2 à 3 questions à poser au recruteur en fin d'entretien.",
      "Envoyez un mail de remerciement dans les 24h suivant l'entretien.",
    ],
  },
  {
    category: "Méthode de relance",
    icon: "🔁",
    items: [
      "Relancez entre 5 et 7 jours ouvrés après l'envoi d'une candidature sans réponse.",
      "Restez bref : rappelez le poste visé et confirmez votre motivation, sans réécrire votre lettre.",
      "Privilégiez un second canal si possible (LinkedIn après un mail resté sans réponse).",
      "N'insistez pas plus de deux fois sans réponse : passez à d'autres opportunités.",
    ],
  },
  {
    category: "Organisation de recherche",
    icon: "🗂️",
    items: [
      "Fixez-vous un objectif hebdomadaire de candidatures (ex : 10 par semaine).",
      "Bloquez des créneaux dédiés à la recherche dans votre agenda, comme un cours.",
      "Suivez chaque candidature dans le CRM dès son envoi pour ne rien oublier.",
      "Faites un bilan chaque semaine : taux de réponse, retours, ajustements à faire.",
    ],
  },
  {
    category: "Exemples de messages",
    icon: "✉️",
    items: [
      "« Bonjour, je recherche une alternance en [poste] à partir de [date] : votre offre correspond exactement à mon projet. »",
      "« Je me permets de revenir vers vous concernant ma candidature envoyée le [date] pour le poste de [poste]. »",
      "« Merci pour cet échange enrichissant, il confirme mon envie de rejoindre votre équipe. »",
      "Retrouvez des messages entièrement personnalisés dans le générateur IA.",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Ressources</h1>
        <p className="mt-1 text-sm text-muted">
          Des conseils concrets pour progresser à chaque étape de votre recherche d&apos;alternance.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {resources.map((section) => (
          <Card key={section.category}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl" aria-hidden="true">
                {section.icon}
              </span>
              <h2 className="font-display text-base font-semibold text-ink">{section.category}</h2>
            </div>
            <ul className="mt-4 space-y-2.5">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-200" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
