/**
 * Envoie un email via l'API Resend (https://resend.com).
 * Nécessite RESEND_API_KEY et RESEND_FROM_EMAIL dans les variables d'environnement.
 * Si ces variables ne sont pas configurées, la fonction ne fait rien (pas d'erreur bloquante) :
 * les rappels par email sont une fonctionnalité optionnelle, le site reste utilisable sans.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn("RESEND_API_KEY ou RESEND_FROM_EMAIL non configurée : email non envoyé.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    return response.ok;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email :", err);
    return false;
  }
}
