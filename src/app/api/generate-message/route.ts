import { NextResponse } from "next/server";
import { generateMessage } from "@/lib/ai/generateMessage";
import type { MessageTone, MessageType } from "@/lib/types";

// Cette route s'exécute côté serveur : c'est ici que la clé API (si configurée)
// est utilisée, sans jamais être exposée au navigateur.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      type,
      company,
      role,
      recruiterName,
      tone,
      personalInfo,
      firstName,
      lastName,
      formation,
      jobDescription,
      cvSummary,
      previousMessage,
      variantSeed,
    } = body as {
      type: MessageType;
      company: string;
      role: string;
      recruiterName?: string;
      tone: MessageTone;
      personalInfo?: string;
      firstName?: string;
      lastName?: string;
      formation?: string;
      jobDescription?: string;
      cvSummary?: string;
      previousMessage?: string;
      variantSeed?: number;
    };

    if (!type || !company || !role || !tone) {
      return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
    }

    const result = await generateMessage({
      type,
      company,
      role,
      recruiterName,
      tone,
      personalInfo,
      firstName,
      lastName,
      formation,
      jobDescription,
      cvSummary,
      previousMessage,
      variantSeed,
    });

    return NextResponse.json({ content: result.content, usedRealAi: result.usedRealAi });
  } catch (err) {
    return NextResponse.json({ error: "Erreur lors de la génération du message." }, { status: 500 });
  }
}
