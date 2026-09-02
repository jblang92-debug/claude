import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";

export const CREATOR_COOKIE = "creator_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 ans

/**
 * Identifie le créateur de façon anonyme via un cookie longue durée, sans
 * inscription : ça suffit pour lui permettre de retrouver l'historique de
 * ses tests depuis son navigateur.
 * À utiliser uniquement dans une Server Action ou un Route Handler (le
 * cookie peut y être posé).
 */
export async function getOrCreateCreatorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CREATOR_COOKIE)?.value;
  if (existing) {
    await db.creator.upsert({
      where: { id: existing },
      update: {},
      create: { id: existing },
    });
    return existing;
  }

  const id = randomUUID();
  await db.creator.create({ data: { id } });
  store.set(CREATOR_COOKIE, id, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return id;
}

/** Lecture seule du cookie créateur, utilisable dans un Server Component. */
export async function getCreatorId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CREATOR_COOKIE)?.value ?? null;
}
