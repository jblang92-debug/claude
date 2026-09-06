import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase sur chaque requête et crée une session
 * anonyme automatiquement si le visiteur n'en a aucune — c'est ce qui
 * permet de jouer sans jamais voir d'écran d'inscription : le compte léger
 * existe dès la première page vue.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(`[DEBUG proxy] no session, signing in anonymously — ${request.method} ${request.nextUrl.pathname}`);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Échec de la connexion anonyme automatique :", error.message);
    } else {
      console.error(`[DEBUG proxy] new anon user=${data.user?.id} — ${request.method} ${request.nextUrl.pathname}`);
    }
  } else {
    console.error(`[DEBUG proxy] existing session user=${user.id} — ${request.method} ${request.nextUrl.pathname}`);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
